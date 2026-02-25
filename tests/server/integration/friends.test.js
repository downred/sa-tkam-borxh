const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../../../server/models/User");

jest.mock("../../../server/config/database");
jest.mock("bcryptjs");
jest.mock("@scalar/express-api-reference", () => ({
  apiReference: jest.fn(() => (req, res) => {
    res.status(200).json({ message: "API Reference Mock" });
  }),
}));

let app;
let jwt;
let validToken;

const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  id: "507f1f77bcf86cd799439011",
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  friends: [],
  save: jest.fn().mockResolvedValue(true),
};

const mockFriend = {
  _id: "507f1f77bcf86cd799439022",
  id: "507f1f77bcf86cd799439022",
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "0987654321",
  friends: [],
};

describe("Friends API", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret-key";
    process.env.MONGODB_URI = "mongodb://localhost:27017/test-db";

    mongoose.connect = jest.fn().mockResolvedValue(true);

    app = require("../../../server/index");
    jwt = require("../../../server/node_modules/jsonwebtoken");
    validToken = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser.friends = [];
    mockUser.save = jest.fn().mockResolvedValue(true);
  });

  describe("Add Friend", () => {
    describe("when authenticated with valid email", () => {
      it("should add the friend successfully", async () => {
        User.findById = jest.fn()
          .mockResolvedValueOnce(mockUser) 
          .mockResolvedValueOnce({ ...mockUser, friends: [], save: jest.fn().mockResolvedValue(true) }); 
        User.findOne = jest.fn().mockResolvedValueOnce(mockFriend); 

        const response = await request(app)
          .post("/api/friends")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ email: mockFriend.email });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Friend added successfully");
      });
    });

    describe("when email is missing", () => {
      it("should return 400 error", async () => {
        User.findById = jest.fn().mockResolvedValue(mockUser);

        const response = await request(app)
          .post("/api/friends")
          .set("Authorization", `Bearer ${validToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Email is required");
      });
    });

    describe("when trying to add yourself as friend", () => {
      it("should return 400 error", async () => {
        User.findById = jest.fn().mockResolvedValue(mockUser);
        User.findOne = jest.fn().mockResolvedValueOnce(mockUser); 

        const response = await request(app)
          .post("/api/friends")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ email: mockUser.email });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Cannot add yourself as a friend");
      });
    });

    describe("when email does not exist", () => {
      it("should return 404 error", async () => {
        User.findById = jest.fn().mockResolvedValueOnce(mockUser); 
        User.findOne = jest.fn().mockResolvedValueOnce(null); 

        const response = await request(app)
          .post("/api/friends")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ email: "nonexistent@example.com" });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("User not found");
      });
    });

    describe("when friend is already added", () => {
      it("should return 400 error", async () => {
        const userWithFriend = {
          ...mockUser,
          friends: [mockFriend._id],
          save: jest.fn(),
        };

        User.findById = jest.fn()
          .mockResolvedValueOnce(mockUser) 
          .mockResolvedValueOnce(userWithFriend); 
        User.findOne = jest.fn().mockResolvedValueOnce(mockFriend); 

        const response = await request(app)
          .post("/api/friends")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ email: mockFriend.email });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("User is already a friend");
      });
    });

    describe("when not authenticated", () => {
      it("should return 401 error", async () => {
        const response = await request(app)
          .post("/api/friends")
          .send({ friendId: mockFriend._id });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Not authorized to access this route");
      });
    });
  });

  describe("Remove Friend", () => {
    describe("when removing an existing friend", () => {
      it("should remove the friend successfully", async () => {
        const userWithFriend = {
          ...mockUser,
          friends: [mockFriend._id],
          save: jest.fn().mockResolvedValue(true),
        };

        User.findById = jest.fn()
          .mockResolvedValueOnce(mockUser) 
          .mockResolvedValueOnce(userWithFriend); 

        const response = await request(app)
          .delete(`/api/friends/${mockFriend._id}`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Friend removed successfully");
      });
    });

    describe("when friend is not in list", () => {
      it("should return 400 error", async () => {
        const userWithoutFriend = {
          ...mockUser,
          friends: [],
        };

        User.findById = jest.fn()
          .mockResolvedValueOnce(mockUser) 
          .mockResolvedValueOnce(userWithoutFriend); 

        const response = await request(app)
          .delete(`/api/friends/${mockFriend._id}`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("User is not in your friends list");
      });
    });

    describe("when not authenticated", () => {
      it("should return 401 error", async () => {
        const response = await request(app)
          .delete(`/api/friends/${mockFriend._id}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Not authorized to access this route");
      });
    });
  });

  describe("Get Friends", () => {
    describe("when user has friends", () => {
      it("should return populated friends list", async () => {
        const populatedUser = {
          ...mockUser,
          friends: [
            { _id: mockFriend._id, name: mockFriend.name, email: mockFriend.email, phone: mockFriend.phone },
          ],
        };

        User.findById = jest.fn()
          .mockResolvedValueOnce(mockUser) 
          .mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(populatedUser),
          });

        const response = await request(app)
          .get("/api/friends")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty("name", mockFriend.name);
        expect(response.body[0]).toHaveProperty("email", mockFriend.email);
      });
    });

    describe("when user has no friends", () => {
      it("should return empty array", async () => {
        const userNoFriends = {
          ...mockUser,
          friends: [],
        };

        User.findById = jest.fn()
          .mockResolvedValueOnce(mockUser) 
          .mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(userNoFriends),
          });

        const response = await request(app)
          .get("/api/friends")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
    });

    describe("when not authenticated", () => {
      it("should return 401 error", async () => {
        const response = await request(app)
          .get("/api/friends");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Not authorized to access this route");
      });
    });

    describe("when user not found", () => {
      it("should return 404 error", async () => {
        User.findById = jest.fn()
          .mockResolvedValueOnce(mockUser) 
          .mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(null),
          });

        const response = await request(app)
          .get("/api/friends")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("User not found");
      });
    });
  });

  describe("Security", () => {
    describe("when token is invalid", () => {
      it("should reject the request", async () => {
        const response = await request(app)
          .get("/api/friends")
          .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);
      });
    });

    describe("when token is malformed", () => {
      it("should reject the request", async () => {
        const response = await request(app)
          .get("/api/friends")
          .set("Authorization", "malformed-header");

        expect(response.status).toBe(401);
      });
    });
  });
});
