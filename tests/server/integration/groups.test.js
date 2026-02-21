const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../../../server/models/User");
const Group = require("../../../server/models/Group");
const Expense = require("../../../server/models/Expense");
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
  name: "John Doe",
  email: "john@example.com",
};

const mockGroup = {
  _id: "507f1f77bcf86cd799439012",
  name: "Trip to Paris",
  type: "Trip",
  startDate: new Date("2026-03-01"),
  endDate: new Date("2026-03-10"),
  settleUpReminders: true,
  members: [mockUser],
  createdBy: mockUser,
};

describe("Groups API", () => {
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
    // Setup auth mock - user lookup for auth middleware
    User.findById = jest.fn().mockResolvedValue(mockUser);
  });

  describe("Create Group", () => {
    describe("when authenticated with valid data", () => {
      it("should create a new group", async () => {
        Group.create = jest.fn().mockResolvedValue({
          ...mockGroup,
          populate: jest.fn().mockReturnThis(),
        });

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "Trip to Paris",
            type: "Trip",
            startDate: "2026-03-01",
            endDate: "2026-03-10",
            settleUpReminders: true,
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    describe("when group name is missing", () => {
      it("should return 400 error", async () => {
        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ type: "Trip" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Group name is required");
      });
    });

    describe("when not authenticated", () => {
      it("should return 401 error", async () => {
        const response = await request(app)
          .post("/api/groups")
          .send({ name: "Trip to Paris" });

        expect(response.status).toBe(401);
      });
    });
  });

  describe("Get All Groups", () => {
    describe("when user has groups", () => {
      it("should return all user groups", async () => {
        Group.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue([mockGroup]),
            }),
          }),
        });

        const response = await request(app)
          .get("/api/groups")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe("Get Group By ID", () => {
    describe("when group exists", () => {
      it("should return the group", async () => {
        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockGroup),
          }),
        });

        const response = await request(app)
          .get(`/api/groups/${mockGroup._id}`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe("Trip to Paris");
      });
    });

    describe("when group does not exist", () => {
      it("should return 404 error", async () => {
        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
          }),
        });

        const response = await request(app)
          .get("/api/groups/507f1f77bcf86cd799439099")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Group not found");
      });
    });
  });

  describe("Update Group", () => {
    describe("when updating valid fields", () => {
      it("should update the group", async () => {
        const updatedGroup = { ...mockGroup, name: "Updated Trip" };
        Group.findByIdAndUpdate = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(updatedGroup),
          }),
        });

        const response = await request(app)
          .put(`/api/groups/${mockGroup._id}`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ name: "Updated Trip" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe("Delete Group", () => {
    describe("when creator deletes group", () => {
      it("should delete successfully", async () => {
        Group.findById = jest.fn().mockResolvedValue({
          ...mockGroup,
          createdBy: { toString: () => mockUser._id },
        });
        Group.findByIdAndDelete = jest.fn().mockResolvedValue(mockGroup);

        const response = await request(app)
          .delete(`/api/groups/${mockGroup._id}`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Group deleted successfully");
      });
    });

    describe("when non-creator tries to delete", () => {
      it("should return 403 forbidden", async () => {
        Group.findById = jest.fn().mockResolvedValue({
          ...mockGroup,
          createdBy: { toString: () => "different-user-id" },
        });

        const response = await request(app)
          .delete(`/api/groups/${mockGroup._id}`)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Not authorized to delete this group");
      });
    });

    describe("when group does not exist", () => {
      it("should return 404 error", async () => {
        Group.findById = jest.fn().mockResolvedValue(null);

        const response = await request(app)
          .delete("/api/groups/507f1f77bcf86cd799439099")
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Group not found");
      });
    });
  });

  describe("Add Member", () => {
    describe("when adding new member", () => {
      it("should add member successfully", async () => {
        const groupWithSave = {
          ...mockGroup,
          members: [mockUser._id],
          includes: jest.fn().mockReturnValue(false),
          push: jest.fn(),
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockReturnThis(),
        };
        Group.findById = jest.fn().mockResolvedValue(groupWithSave);

        const response = await request(app)
          .post(`/api/groups/${mockGroup._id}/members`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ userId: "507f1f77bcf86cd799439013" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe("when userId is missing", () => {
      it("should return 400 error", async () => {
        const response = await request(app)
          .post(`/api/groups/${mockGroup._id}/members`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("User ID is required");
      });
    });

    describe("when user is already a member", () => {
      it("should return 400 error", async () => {
        const groupWithMember = {
          ...mockGroup,
          members: {
            includes: jest.fn().mockReturnValue(true),
          },
        };
        Group.findById = jest.fn().mockResolvedValue(groupWithMember);

        const response = await request(app)
          .post(`/api/groups/${mockGroup._id}/members`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ userId: mockUser._id });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("User is already a member");
      });
    });
  });

  describe("Remove Member", () => {
    describe("when removing non-creator member", () => {
      it("should remove member successfully", async () => {
        const groupWithSave = {
          ...mockGroup,
          createdBy: { toString: () => mockUser._id },
          members: [mockUser._id, "507f1f77bcf86cd799439013"],
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockReturnThis(),
        };
        Group.findById = jest.fn().mockResolvedValue(groupWithSave);
        Expense.find = jest.fn().mockResolvedValue([]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .delete(`/api/groups/${mockGroup._id}/members`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ userId: "507f1f77bcf86cd799439013" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe("when trying to remove creator", () => {
      it("should return 400 error", async () => {
        const groupWithCreator = {
          ...mockGroup,
          createdBy: { toString: () => mockUser._id },
        };
        Group.findById = jest.fn().mockResolvedValue(groupWithCreator);

        const response = await request(app)
          .delete(`/api/groups/${mockGroup._id}/members`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ userId: mockUser._id });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Cannot remove the group creator");
      });
    });

    describe("when member has unsettled positive balance (is owed money)", () => {
      it("should return 400 error", async () => {
        const memberToRemove = "507f1f77bcf86cd799439013";
        const groupWithSave = {
          ...mockGroup,
          createdBy: { toString: () => mockUser._id },
          members: [mockUser._id, memberToRemove],
        };
        Group.findById = jest.fn().mockResolvedValue(groupWithSave);
        
        // Member paid €50, split is €25 each -> member is owed €25
        Expense.find = jest.fn().mockResolvedValue([{
          paidBy: [{ user: { toString: () => memberToRemove }, amount: 50 }],
          splits: [
            { user: { toString: () => memberToRemove }, amount: 25 },
            { user: { toString: () => mockUser._id }, amount: 25 }
          ]
        }]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .delete(`/api/groups/${mockGroup._id}/members`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ userId: memberToRemove });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Cannot remove member");
        expect(response.body.error).toContain("is owed");
        expect(response.body.error).toContain("25.00");
      });
    });

    describe("when member has unsettled negative balance (owes money)", () => {
      it("should return 400 error", async () => {
        const memberToRemove = "507f1f77bcf86cd799439013";
        const groupWithSave = {
          ...mockGroup,
          createdBy: { toString: () => mockUser._id },
          members: [mockUser._id, memberToRemove],
        };
        Group.findById = jest.fn().mockResolvedValue(groupWithSave);
        
        // Creator paid €50, split is €25 each -> member owes €25
        Expense.find = jest.fn().mockResolvedValue([{
          paidBy: [{ user: { toString: () => mockUser._id }, amount: 50 }],
          splits: [
            { user: { toString: () => memberToRemove }, amount: 25 },
            { user: { toString: () => mockUser._id }, amount: 25 }
          ]
        }]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .delete(`/api/groups/${mockGroup._id}/members`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ userId: memberToRemove });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Cannot remove member");
        expect(response.body.error).toContain("owes");
        expect(response.body.error).toContain("25.00");
      });
    });

    describe("when member balance is settled (zero)", () => {
      it("should allow removal after settlement", async () => {
        const memberToRemove = "507f1f77bcf86cd799439013";
        const groupWithSave = {
          ...mockGroup,
          createdBy: { toString: () => mockUser._id },
          members: [mockUser._id, memberToRemove],
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockReturnThis(),
        };
        Group.findById = jest.fn().mockResolvedValue(groupWithSave);
        
        // Creator paid €50, split €25 each -> member owes €25
        Expense.find = jest.fn().mockResolvedValue([{
          paidBy: [{ user: { toString: () => mockUser._id }, amount: 50 }],
          splits: [
            { user: { toString: () => memberToRemove }, amount: 25 },
            { user: { toString: () => mockUser._id }, amount: 25 }
          ]
        }]);
        // Settlement clears the debt: member paid €25 to creator
        Settlement.find = jest.fn().mockResolvedValue([{
          from: { toString: () => memberToRemove },
          to: { toString: () => mockUser._id },
          amount: 25
        }]);

        const response = await request(app)
          .delete(`/api/groups/${mockGroup._id}/members`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({ userId: memberToRemove });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe("Group Type Validation", () => {
    describe("Trip group with dates", () => {
      it("should accept startDate and endDate", async () => {
        Group.create = jest.fn().mockResolvedValue({
          ...mockGroup,
          populate: jest.fn().mockReturnThis(),
        });

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "Beach Trip",
            type: "Trip",
            startDate: "2026-06-01",
            endDate: "2026-06-15",
          });

        expect(response.status).toBe(201);
        expect(Group.create).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: "2026-06-01",
            endDate: "2026-06-15",
          })
        );
      });
    });

    describe("Subscription group with renewal date", () => {
      it("should accept renewalDate", async () => {
        const subscriptionGroup = {
          ...mockGroup,
          type: "Subscription",
          renewalDate: new Date("2026-04-01"),
        };
        Group.create = jest.fn().mockResolvedValue({
          ...subscriptionGroup,
          populate: jest.fn().mockReturnThis(),
        });

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "Netflix",
            type: "Subscription",
            renewalDate: "2026-04-01",
          });

        expect(response.status).toBe(201);
        expect(Group.create).toHaveBeenCalledWith(
          expect.objectContaining({
            renewalDate: "2026-04-01",
          })
        );
      });
    });
  });

  describe("Settle Up Reminders", () => {
    describe("when settleUpReminders is true", () => {
      it("should save the preference", async () => {
        Group.create = jest.fn().mockResolvedValue({
          ...mockGroup,
          settleUpReminders: true,
          populate: jest.fn().mockReturnThis(),
        });

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "Roommates",
            type: "Home",
            settleUpReminders: true,
          });

        expect(response.status).toBe(201);
        expect(Group.create).toHaveBeenCalledWith(
          expect.objectContaining({
            settleUpReminders: true,
          })
        );
      });
    });

    describe("when settleUpReminders is not provided", () => {
      it("should default to false", async () => {
        Group.create = jest.fn().mockResolvedValue({
          ...mockGroup,
          settleUpReminders: false,
          populate: jest.fn().mockReturnThis(),
        });

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "Test Group",
            type: "Other",
          });

        expect(response.status).toBe(201);
        expect(Group.create).toHaveBeenCalledWith(
          expect.objectContaining({
            settleUpReminders: false,
          })
        );
      });
    });
  });
});
