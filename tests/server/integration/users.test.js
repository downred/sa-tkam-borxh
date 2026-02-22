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
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  createdAt: new Date(),
};

describe("Users API", () => {
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
    // Default auth mock - auth middleware calls User.findById
    User.findById = jest.fn().mockResolvedValue(mockUser);
  });

  describe("GET /api/users", () => {
    describe("when users exist", () => {
      it("should return all users", async () => {
        const mockUsers = [mockUser, { ...mockUser, _id: "507f1f77bcf86cd799439022", name: "Jane Doe" }];
        
        User.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers),
        });

        const response = await request(app)
          .get("/api/users")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
      });
    });

    describe("when no users exist", () => {
      it("should return empty array", async () => {
        User.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([]),
        });

        const response = await request(app)
          .get("/api/users")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
    });
    
    describe("when not authenticated", () => {
      it("should return 401", async () => {
        const response = await request(app).get("/api/users");

        expect(response.status).toBe(401);
      });
    });
  });

  describe("GET /api/users/:id", () => {
    describe("when user exists", () => {
      it("should return the user", async () => {
        User.findById = jest.fn()
          .mockResolvedValueOnce(mockUser)  // For auth middleware
          .mockResolvedValueOnce(mockUser); // For getUserById

        const response = await request(app)
          .get(`/api/users/${mockUser._id}`)
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(mockUser.name);
        expect(response.body.email).toBe(mockUser.email);
      });
    });

    describe("when user does not exist", () => {
      it("should return 404", async () => {
        User.findById = jest.fn()
          .mockResolvedValueOnce(mockUser)  // For auth middleware
          .mockResolvedValueOnce(null);     // For getUserById

        const response = await request(app)
          .get("/api/users/nonexistent123456")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("User not found");
      });
    });
  });

  describe("POST /api/users", () => {
    describe("when data is valid", () => {
      it("should create a new user", async () => {
        const newUser = {
          name: "New User",
          email: "newuser@example.com",
          password: "password123",
        };

        User.prototype.save = jest.fn().mockResolvedValue({
          ...newUser,
          _id: "507f1f77bcf86cd799439033",
        });

        const response = await request(app)
          .post("/api/users")
          .set("Authorization", "Bearer " + validToken)
          .send(newUser);

        expect(response.status).toBe(201);
      });
    });

    describe("when data is invalid", () => {
      it("should return 400 error", async () => {
        User.prototype.save = jest.fn().mockRejectedValue(new Error("Validation failed"));

        const response = await request(app)
          .post("/api/users")
          .set("Authorization", "Bearer " + validToken)
          .send({ email: "invalid" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      });
    });
  });

  describe("PUT /api/users/:id", () => {
    describe("when user exists", () => {
      it("should update the user", async () => {
        const updatedUser = { ...mockUser, name: "Updated Name" };

        User.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

        const response = await request(app)
          .put(`/api/users/${mockUser._id}`)
          .set("Authorization", "Bearer " + validToken)
          .send({ name: "Updated Name" });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe("Updated Name");
      });
    });

    describe("when user does not exist", () => {
      it("should return 404", async () => {
        User.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        const response = await request(app)
          .put("/api/users/nonexistent123456")
          .set("Authorization", "Bearer " + validToken)
          .send({ name: "Updated Name" });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("User not found");
      });
    });
  });

  describe("DELETE /api/users/:id", () => {
    describe("when user exists", () => {
      it("should delete the user", async () => {
        User.findByIdAndDelete = jest.fn().mockResolvedValue(mockUser);

        const response = await request(app)
          .delete(`/api/users/${mockUser._id}`)
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User deleted successfully");
      });
    });

    describe("when user does not exist", () => {
      it("should return 404", async () => {
        User.findByIdAndDelete = jest.fn().mockResolvedValue(null);

        const response = await request(app)
          .delete("/api/users/nonexistent123456")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("User not found");
      });
    });
  });
});
