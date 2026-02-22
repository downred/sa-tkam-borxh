const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../../../server/models/User");
const Group = require("../../../server/models/Group");
const Settlement = require("../../../server/models/Settlement");

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
  name: "Alice",
  email: "alice@example.com",
};

const mockUser2 = {
  _id: "507f1f77bcf86cd799439022",
  name: "Bob",
  email: "bob@example.com",
};

const groupId = "607f1f77bcf86cd799439099";

const mockGroup = {
  _id: groupId,
  name: "Trip to Paris",
  type: "Trip",
  members: [mockUser._id, mockUser2._id],
  createdBy: mockUser._id,
};

describe("Settlements API", () => {
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
    // Auth middleware finds user
    User.findById = jest.fn().mockResolvedValue(mockUser);
  });

  // ───────────────────────────────────────────────
  // GET /api/groups/:groupId/settlements
  // ───────────────────────────────────────────────
  describe("Get Group Settlements", () => {
    describe("when settlements exist for group", () => {
      it("should return all settlements sorted by date", async () => {
        const mockSettlements = [
          {
            _id: "s1",
            group: groupId,
            from: mockUser,
            to: mockUser2,
            amount: 50,
            createdAt: new Date(),
          },
        ];

        Settlement.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockSettlements),
            }),
          }),
        });

        const response = await request(app)
          .get(`/api/groups/${groupId}/settlements`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty("amount", 50);
      });
    });

    describe("when no settlements exist", () => {
      it("should return empty array", async () => {
        Settlement.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue([]),
            }),
          }),
        });

        const response = await request(app)
          .get(`/api/groups/${groupId}/settlements`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
    });

    describe("when not authenticated", () => {
      it("should return 401 error", async () => {
        const response = await request(app)
          .get(`/api/groups/${groupId}/settlements`);

        expect(response.status).toBe(401);
      });
    });
  });

  // ───────────────────────────────────────────────
  // POST /api/settlements
  // ───────────────────────────────────────────────
  describe("Create Settlement", () => {
    describe("when creating with valid data", () => {
      it("should create a new settlement", async () => {
        Group.findById = jest.fn().mockResolvedValue(mockGroup);
        
        const mockSettlement = {
          _id: "s1",
          group: groupId,
          from: mockUser._id,
          to: mockUser2._id,
          amount: 50,
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockResolvedValue({
            _id: "s1",
            group: groupId,
            from: mockUser,
            to: mockUser2,
            amount: 50,
          }),
        };

        Settlement.prototype.save = jest.fn().mockResolvedValue(mockSettlement);
        Settlement.prototype.populate = jest.fn().mockResolvedValue(mockSettlement);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            to: mockUser2._id,
            amount: 50,
          });

        expect(response.status).toBe(201);
      });
    });

    describe("when group does not exist", () => {
      it("should return 404 error", async () => {
        Group.findById = jest.fn().mockResolvedValue(null);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: "nonexistent",
            to: mockUser2._id,
            amount: 50,
          });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Group not found");
      });
    });

    describe("when user is not a member of the group", () => {
      it("should return 403 error", async () => {
        const groupWithoutUser = {
          ...mockGroup,
          members: [mockUser2._id], // Current user not in members
        };
        Group.findById = jest.fn().mockResolvedValue(groupWithoutUser);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            to: mockUser2._id,
            amount: 50,
          });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("You are not a member of this group");
      });
    });

    describe("when recipient is not a member of the group", () => {
      it("should return 400 error", async () => {
        Group.findById = jest.fn().mockResolvedValue(mockGroup);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            to: "nonmember123456789012", // Not in group members
            amount: 50,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("The other user is not a member of this group");
      });
    });

    describe("when trying to settle with yourself", () => {
      it("should return 400 error", async () => {
        Group.findById = jest.fn().mockResolvedValue(mockGroup);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            to: mockUser._id, // Same as authenticated user
            amount: 50,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Cannot settle with yourself");
      });
    });

    describe("when amount is invalid", () => {
      it("should return 400 error for zero amount", async () => {
        Group.findById = jest.fn().mockResolvedValue(mockGroup);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            to: mockUser2._id,
            amount: 0,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Amount must be greater than 0");
      });

      it("should return 400 error for negative amount", async () => {
        Group.findById = jest.fn().mockResolvedValue(mockGroup);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            to: mockUser2._id,
            amount: -50,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Amount must be greater than 0");
      });

      it("should return 400 error for missing amount", async () => {
        Group.findById = jest.fn().mockResolvedValue(mockGroup);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            to: mockUser2._id,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Amount must be greater than 0");
      });
    });

    describe("when not authenticated", () => {
      it("should return 401 error", async () => {
        const response = await request(app)
          .post("/api/settlements")
          .send({
            groupId: groupId,
            to: mockUser2._id,
            amount: 50,
          });

        expect(response.status).toBe(401);
      });
    });
  });

  // ───────────────────────────────────────────────
  // DELETE /api/settlements/:id
  // ───────────────────────────────────────────────
  describe("Delete Settlement", () => {
    describe("when deleting own settlement", () => {
      it("should delete the settlement successfully", async () => {
        const mockSettlement = {
          _id: "s1",
          group: groupId,
          from: mockUser2._id,
          to: mockUser._id, // Current user is the recipient
          amount: 50,
          deleteOne: jest.fn().mockResolvedValue(true),
        };

        Settlement.findById = jest.fn().mockResolvedValue(mockSettlement);

        const response = await request(app)
          .delete("/api/settlements/s1")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Settlement deleted successfully");
      });
    });

    describe("when settlement does not exist", () => {
      it("should return 404 error", async () => {
        Settlement.findById = jest.fn().mockResolvedValue(null);

        const response = await request(app)
          .delete("/api/settlements/nonexistent")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Settlement not found");
      });
    });

    describe("when trying to delete someone else's settlement", () => {
      it("should return 403 error", async () => {
        const mockSettlement = {
          _id: "s1",
          group: groupId,
          from: mockUser._id,
          to: mockUser2._id, // Different user is the recipient
          amount: 50,
        };

        Settlement.findById = jest.fn().mockResolvedValue(mockSettlement);

        const response = await request(app)
          .delete("/api/settlements/s1")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Only the recipient can delete this settlement");
      });
    });

    describe("when not authenticated", () => {
      it("should return 401 error", async () => {
        const response = await request(app)
          .delete("/api/settlements/s1");

        expect(response.status).toBe(401);
      });
    });
  });

  // ───────────────────────────────────────────────
  // PUT /api/settlements/:id
  // ───────────────────────────────────────────────
  describe("Update Settlement", () => {
    describe("when updating own settlement", () => {
      it("should update the settlement amount successfully", async () => {
        const mockSettlement = {
          _id: "s1",
          group: groupId,
          from: mockUser2._id,
          to: mockUser._id, // Current user is the recipient
          amount: 50,
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockReturnThis(),
        };

        Settlement.findById = jest.fn().mockResolvedValue(mockSettlement);

        const response = await request(app)
          .put("/api/settlements/s1")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ amount: 75 });

        expect(response.status).toBe(200);
        expect(mockSettlement.amount).toBe(75);
      });
    });

    describe("when settlement does not exist", () => {
      it("should return 404 error", async () => {
        Settlement.findById = jest.fn().mockResolvedValue(null);

        const response = await request(app)
          .put("/api/settlements/nonexistent")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ amount: 75 });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Settlement not found");
      });
    });

    describe("when trying to update someone else's settlement", () => {
      it("should return 403 error", async () => {
        const mockSettlement = {
          _id: "s1",
          group: groupId,
          from: mockUser._id,
          to: mockUser2._id, // Different user is the recipient
          amount: 50,
        };

        Settlement.findById = jest.fn().mockResolvedValue(mockSettlement);

        const response = await request(app)
          .put("/api/settlements/s1")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ amount: 75 });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Only the recipient can update this settlement");
      });
    });

    describe("when amount is invalid", () => {
      it("should return 400 error for zero amount", async () => {
        const mockSettlement = {
          _id: "s1",
          group: groupId,
          from: mockUser2._id,
          to: mockUser._id,
          amount: 50,
        };

        Settlement.findById = jest.fn().mockResolvedValue(mockSettlement);

        const response = await request(app)
          .put("/api/settlements/s1")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ amount: 0 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Amount must be greater than 0");
      });
    });

    describe("when not authenticated", () => {
      it("should return 401 error", async () => {
        const response = await request(app)
          .put("/api/settlements/s1")
          .send({ amount: 75 });

        expect(response.status).toBe(401);
      });
    });
  });

  // ───────────────────────────────────────────────
  // Create Settlement with 'from' field (bidirectional)
  // ───────────────────────────────────────────────
  describe("Create Settlement (recording payment received)", () => {
    describe("when creating with 'from' field", () => {
      it("should create settlement where logged-in user is recipient", async () => {
        Group.findById = jest.fn().mockResolvedValue(mockGroup);
        
        const mockSettlement = {
          _id: "s1",
          group: groupId,
          from: mockUser2._id,
          to: mockUser._id, // Logged-in user as recipient
          amount: 50,
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockResolvedValue({
            _id: "s1",
            group: groupId,
            from: mockUser2,
            to: mockUser,
            amount: 50,
          }),
        };

        Settlement.prototype.save = jest.fn().mockResolvedValue(mockSettlement);
        Settlement.prototype.populate = jest.fn().mockResolvedValue(mockSettlement);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            from: mockUser2._id, // Recording that mockUser2 paid mockUser
            amount: 50,
          });

        expect(response.status).toBe(201);
      });
    });

    describe("when neither from nor to is provided", () => {
      it("should return 400 error", async () => {
        Group.findById = jest.fn().mockResolvedValue(mockGroup);

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            amount: 50,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Must specify either from or to user");
      });
    });
  });

  // ───────────────────────────────────────────────
  // Settlement Amount Boundary Value Analysis
  // ───────────────────────────────────────────────
  describe("Settlement Amount Boundary Value Analysis", () => {
    beforeEach(() => {
      Group.findById = jest.fn().mockResolvedValue(mockGroup);
    });

    describe("when amount is at minimum valid value (0.01)", () => {
      it("should accept the settlement", async () => {
        Settlement.prototype.save = jest.fn().mockResolvedValue(true);
        Settlement.prototype.populate = jest.fn().mockResolvedValue({
          _id: "s1",
          group: groupId,
          from: mockUser,
          to: mockUser2,
          amount: 0.01,
        });

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            to: mockUser2._id,
            amount: 0.01,
          });

        expect(response.status).toBe(201);
      });
    });

    describe("when amount is very large", () => {
      it("should accept the settlement", async () => {
        Settlement.prototype.save = jest.fn().mockResolvedValue(true);
        Settlement.prototype.populate = jest.fn().mockResolvedValue({
          _id: "s1",
          group: groupId,
          from: mockUser,
          to: mockUser2,
          amount: 999999.99,
        });

        const response = await request(app)
          .post("/api/settlements")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            groupId: groupId,
            to: mockUser2._id,
            amount: 999999.99,
          });

        expect(response.status).toBe(201);
      });
    });
  });
});
