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
  name: "Alice",
  email: "alice@example.com",
};

const mockUser2 = {
  _id: "507f1f77bcf86cd799439022",
  name: "Bob",
  email: "bob@example.com",
};

const mockUser3 = {
  _id: "507f1f77bcf86cd799439033",
  name: "Charlie",
  email: "charlie@example.com",
};

const groupId = "607f1f77bcf86cd799439099";

const mockGroup = {
  _id: groupId,
  name: "Trip to Paris",
  type: "Trip",
  members: [mockUser._id, mockUser2._id, mockUser3._id],
  createdBy: mockUser._id,
};

describe("Expenses API", () => {
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
  // GET /api/groups/:groupId/expenses
  // ───────────────────────────────────────────────
  describe("Get Group Expenses", () => {
    describe("when expenses exist for group", () => {
      it("should return all expenses sorted by date", async () => {
        const mockExpenses = [
          {
            _id: "e1",
            description: "Dinner",
            amount: 90,
            group: groupId,
            paidBy: [{ user: mockUser, amount: 90 }],
            splits: [
              { user: mockUser, amount: 30 },
              { user: mockUser2, amount: 30 },
              { user: mockUser3, amount: 30 },
            ],
            createdBy: mockUser,
          },
        ];

        Expense.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockExpenses),
              }),
            }),
          }),
        });

        const response = await request(app)
          .get("/api/groups/" + groupId + "/expenses")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].description).toBe("Dinner");
      });
    });

    describe("when no expenses exist", () => {
      it("should return empty array", async () => {
        Expense.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        });

        const response = await request(app)
          .get("/api/groups/" + groupId + "/expenses")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
    });

    describe("when not authenticated", () => {
      it("should return 401", async () => {
        const response = await request(app).get(
          "/api/groups/" + groupId + "/expenses"
        );

        expect(response.status).toBe(401);
      });
    });

    describe("when database error occurs", () => {
      it("should return 500", async () => {
        Expense.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                sort: jest
                  .fn()
                  .mockRejectedValue(new Error("Database error")),
              }),
            }),
          }),
        });

        const response = await request(app)
          .get("/api/groups/" + groupId + "/expenses")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error");
      });
    });
  });

  // ───────────────────────────────────────────────
  // GET /api/expenses/:id
  // ───────────────────────────────────────────────
  describe("Get Expense By ID", () => {
    describe("when expense exists", () => {
      it("should return the expense with populated fields", async () => {
        const mockExpense = {
          _id: "e1",
          description: "Groceries",
          amount: 150,
          paidBy: [{ user: mockUser, amount: 150 }],
          splits: [
            { user: mockUser, amount: 75 },
            { user: mockUser2, amount: 75 },
          ],
          createdBy: mockUser,
        };

        Expense.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(mockExpense),
            }),
          }),
        });

        const response = await request(app)
          .get("/api/expenses/e1")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.description).toBe("Groceries");
        expect(response.body.amount).toBe(150);
        expect(response.body.paidBy).toHaveLength(1);
        expect(response.body.splits).toHaveLength(2);
      });
    });

    describe("when expense does not exist", () => {
      it("should return 404", async () => {
        Expense.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(null),
            }),
          }),
        });

        const response = await request(app)
          .get("/api/expenses/nonexistent123456")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Expense not found");
      });
    });
  });

  // ───────────────────────────────────────────────
  // POST /api/expenses — Split Types & Validation
  // ───────────────────────────────────────────────
  describe("Create Expense", () => {
    beforeEach(() => {
      Group.findById = jest.fn().mockResolvedValue(mockGroup);
      Expense.prototype.save = jest.fn().mockResolvedValue(true);
      Expense.prototype.populate = jest.fn().mockResolvedValue(true);
    });

    describe("Equal Split", () => {
      describe("when creating with valid equal split", () => {
        it("should create expense and split equally among participants", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Dinner",
              amount: 90,
              groupId: groupId,
              category: "Food",
              splitType: "equal",
              paidBy: [{ user: mockUser._id, amount: 90 }],
              splitAmong: [mockUser._id, mockUser2._id, mockUser3._id],
            });

          expect(response.status).toBe(201);
        });
      });

      describe("when splitType is omitted (defaults to equal)", () => {
        it("should default to equal split", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Taxi",
              amount: 30,
              groupId: groupId,
              paidBy: [{ user: mockUser._id, amount: 30 }],
              splitAmong: [mockUser._id, mockUser2._id],
            });

          expect(response.status).toBe(201);
        });
      });
    });

    describe("Exact Split", () => {
      describe("when creating with valid exact amounts", () => {
        it("should create expense with specified split amounts", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Shared bill",
              amount: 100,
              groupId: groupId,
              splitType: "exact",
              paidBy: [{ user: mockUser._id, amount: 100 }],
              splitAmong: [
                { user: mockUser._id, amount: 10 },
                { user: mockUser2._id, amount: 30 },
                { user: mockUser3._id, amount: 60 },
              ],
            });

          expect(response.status).toBe(201);
        });
      });

      describe("when exact amounts don't sum to total", () => {
        it("should return 400 error", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Bad split",
              amount: 100,
              groupId: groupId,
              splitType: "exact",
              paidBy: [{ user: mockUser._id, amount: 100 }],
              splitAmong: [
                { user: mockUser._id, amount: 10 },
                { user: mockUser2._id, amount: 20 },
              ],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("Split amounts must sum to the total");
        });
      });

      describe("when exact split has no amounts", () => {
        it("should return 400 error", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "No amounts",
              amount: 100,
              groupId: groupId,
              splitType: "exact",
              paidBy: [{ user: mockUser._id, amount: 100 }],
              splitAmong: [mockUser._id, mockUser2._id],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("Exact split requires amounts");
        });
      });
    });

    describe("Percentage Split", () => {
      describe("when creating with valid percentages", () => {
        it("should create expense with percentage-based splits", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Subscription",
              amount: 200,
              groupId: groupId,
              splitType: "percentage",
              paidBy: [{ user: mockUser._id, amount: 200 }],
              splitAmong: [
                { user: mockUser._id, percentage: 50 },
                { user: mockUser2._id, percentage: 30 },
                { user: mockUser3._id, percentage: 20 },
              ],
            });

          expect(response.status).toBe(201);
        });
      });

      describe("when percentages don't sum to 100", () => {
        it("should return 400 error", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Bad percent",
              amount: 200,
              groupId: groupId,
              splitType: "percentage",
              paidBy: [{ user: mockUser._id, amount: 200 }],
              splitAmong: [
                { user: mockUser._id, percentage: 50 },
                { user: mockUser2._id, percentage: 30 },
              ],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("Percentages must sum to 100");
        });
      });

      describe("when percentage split has no percentages", () => {
        it("should return 400 error", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "No pct",
              amount: 200,
              groupId: groupId,
              splitType: "percentage",
              paidBy: [{ user: mockUser._id, amount: 200 }],
              splitAmong: [mockUser._id, mockUser2._id],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("Percentage split requires percentages");
        });
      });
    });

    describe("Multiple Payers", () => {
      describe("when multiple users pay for an expense", () => {
        it("should accept multiple paidBy entries", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Group dinner",
              amount: 100,
              groupId: groupId,
              splitType: "equal",
              paidBy: [
                { user: mockUser._id, amount: 60 },
                { user: mockUser2._id, amount: 40 },
              ],
              splitAmong: [mockUser._id, mockUser2._id, mockUser3._id],
            });

          expect(response.status).toBe(201);
        });
      });

      describe("when paidBy amounts don't sum to total", () => {
        it("should return 400 error", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Wrong paid total",
              amount: 100,
              groupId: groupId,
              paidBy: [
                { user: mockUser._id, amount: 30 },
                { user: mockUser2._id, amount: 30 },
              ],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("Paid amounts must sum to the total");
        });
      });
    });

    describe("Validation", () => {
      describe("when group does not exist", () => {
        it("should return 404", async () => {
          Group.findById = jest.fn().mockResolvedValue(null);

          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Test",
              amount: 50,
              groupId: "nonexistent",
              paidBy: [{ user: mockUser._id, amount: 50 }],
            });

          expect(response.status).toBe(404);
          expect(response.body.error).toBe("Group not found");
        });
      });

      describe("when user is not a group member", () => {
        it("should return 403", async () => {
          Group.findById = jest.fn().mockResolvedValue({
            ...mockGroup,
            members: [mockUser2._id],
          });

          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Test",
              amount: 50,
              groupId: groupId,
              paidBy: [{ user: mockUser._id, amount: 50 }],
            });

          expect(response.status).toBe(403);
          expect(response.body.error).toBe("You are not a member of this group");
        });
      });

      describe("when payer is not a group member", () => {
        it("should return 400", async () => {
          const outsider = "507f1f77bcf86cd799439099";

          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Test",
              amount: 50,
              groupId: groupId,
              paidBy: [{ user: outsider, amount: 50 }],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("is not a group member");
        });
      });

      describe("when split participant is not a group member", () => {
        it("should return 400", async () => {
          const outsider = "507f1f77bcf86cd799439099";

          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Test",
              amount: 50,
              groupId: groupId,
              paidBy: [{ user: mockUser._id, amount: 50 }],
              splitAmong: [mockUser._id, outsider],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("is not a group member");
        });
      });

      describe("when not authenticated", () => {
        it("should return 401", async () => {
          const response = await request(app).post("/api/expenses").send({
            description: "Test",
            amount: 50,
            groupId: groupId,
            paidBy: [{ user: mockUser._id, amount: 50 }],
          });

          expect(response.status).toBe(401);
        });
      });
    });
  });

  // ───────────────────────────────────────────────
  // PUT /api/expenses/:id
  // ───────────────────────────────────────────────
  describe("Update Expense", () => {
    describe("when creator updates expense", () => {
      it("should update successfully", async () => {
        const existingExpense = {
          _id: "e1",
          description: "Old",
          amount: 50,
          createdBy: { toString: () => mockUser._id },
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockResolvedValue(true),
        };

        Expense.findById = jest.fn().mockResolvedValue(existingExpense);

        const response = await request(app)
          .put("/api/expenses/e1")
          .set("Authorization", "Bearer " + validToken)
          .send({ description: "Updated" });

        expect(response.status).toBe(200);
      });
    });

    describe("when non-creator tries to update", () => {
      it("should return 403", async () => {
        const existingExpense = {
          _id: "e1",
          createdBy: { toString: () => mockUser2._id },
        };

        Expense.findById = jest.fn().mockResolvedValue(existingExpense);

        const response = await request(app)
          .put("/api/expenses/e1")
          .set("Authorization", "Bearer " + validToken)
          .send({ description: "Hacked" });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Only the creator can update this expense");
      });
    });

    describe("when expense does not exist", () => {
      it("should return 404", async () => {
        Expense.findById = jest.fn().mockResolvedValue(null);

        const response = await request(app)
          .put("/api/expenses/nonexistent")
          .set("Authorization", "Bearer " + validToken)
          .send({ description: "Test" });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Expense not found");
      });
    });
  });

  // ───────────────────────────────────────────────
  // DELETE /api/expenses/:id
  // ───────────────────────────────────────────────
  describe("Delete Expense", () => {
    describe("when creator deletes expense", () => {
      it("should delete successfully", async () => {
        const existingExpense = {
          _id: "e1",
          createdBy: { toString: () => mockUser._id },
          deleteOne: jest.fn().mockResolvedValue(true),
        };

        Expense.findById = jest.fn().mockResolvedValue(existingExpense);

        const response = await request(app)
          .delete("/api/expenses/e1")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Expense deleted successfully");
        expect(existingExpense.deleteOne).toHaveBeenCalled();
      });
    });

    describe("when non-creator tries to delete", () => {
      it("should return 403", async () => {
        const existingExpense = {
          _id: "e1",
          createdBy: { toString: () => mockUser2._id },
        };

        Expense.findById = jest.fn().mockResolvedValue(existingExpense);

        const response = await request(app)
          .delete("/api/expenses/e1")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Only the creator can delete this expense");
      });
    });

    describe("when expense does not exist", () => {
      it("should return 404", async () => {
        Expense.findById = jest.fn().mockResolvedValue(null);

        const response = await request(app)
          .delete("/api/expenses/nonexistent")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Expense not found");
      });
    });
  });

  // ───────────────────────────────────────────────
  // GET /api/groups/:groupId/balances
  // ───────────────────────────────────────────────
  describe("Get Group Balances", () => {
    describe("when group has expenses and settlements", () => {
      it("should compute correct net balances", async () => {
        const populatedGroup = {
          _id: groupId,
          members: [
            { _id: mockUser._id, name: "Alice", email: "alice@example.com" },
            { _id: mockUser2._id, name: "Bob", email: "bob@example.com" },
            { _id: mockUser3._id, name: "Charlie", email: "charlie@example.com" },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedGroup),
        });

        // Alice paid 90, split equally 3 ways
        Expense.find = jest.fn().mockResolvedValue([
          {
            amount: 90,
            paidBy: [{ user: mockUser._id, amount: 90 }],
            splits: [
              { user: mockUser._id, amount: 30 },
              { user: mockUser2._id, amount: 30 },
              { user: mockUser3._id, amount: 30 },
            ],
          },
        ]);

        // Bob settled 10 with Alice
        Settlement.find = jest.fn().mockResolvedValue([
          { from: mockUser2._id, to: mockUser._id, amount: 10 },
        ]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/balances")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(3);

        const alice = response.body.find(function(b) { return b.user._id === mockUser._id; });
        const bob = response.body.find(function(b) { return b.user._id === mockUser2._id; });
        const charlie = response.body.find(function(b) { return b.user._id === mockUser3._id; });

        // Alice: paid 90 - owed 30 - received settlement 10 = 50
        expect(alice.balance).toBe(50);
        // Bob: paid 0 - owed 30 + sent settlement 10 = -20
        expect(bob.balance).toBe(-20);
        // Charlie: paid 0 - owed 30 = -30
        expect(charlie.balance).toBe(-30);
      });
    });

    describe("when balances sum to zero (zero-sum invariant)", () => {
      it("should always have zero-sum balances", async () => {
        const populatedGroup = {
          _id: groupId,
          members: [
            { _id: mockUser._id, name: "Alice", email: "alice@example.com" },
            { _id: mockUser2._id, name: "Bob", email: "bob@example.com" },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedGroup),
        });

        Expense.find = jest.fn().mockResolvedValue([
          {
            amount: 100,
            paidBy: [{ user: mockUser._id, amount: 100 }],
            splits: [
              { user: mockUser._id, amount: 50 },
              { user: mockUser2._id, amount: 50 },
            ],
          },
          {
            amount: 60,
            paidBy: [{ user: mockUser2._id, amount: 60 }],
            splits: [
              { user: mockUser._id, amount: 30 },
              { user: mockUser2._id, amount: 30 },
            ],
          },
        ]);

        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/balances")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);

        var totalBalance = response.body.reduce(function(sum, b) { return sum + b.balance; }, 0);
        expect(totalBalance).toBeCloseTo(0, 2);
      });
    });

    describe("when group has no expenses", () => {
      it("should return zero balances for all members", async () => {
        const populatedGroup = {
          _id: groupId,
          members: [
            { _id: mockUser._id, name: "Alice", email: "alice@example.com" },
            { _id: mockUser2._id, name: "Bob", email: "bob@example.com" },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedGroup),
        });

        Expense.find = jest.fn().mockResolvedValue([]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/balances")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        response.body.forEach(function(b) {
          expect(b.balance).toBe(0);
        });
      });
    });

    describe("when group does not exist", () => {
      it("should return 404", async () => {
        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        });

        const response = await request(app)
          .get("/api/groups/" + groupId + "/balances")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Group not found");
      });
    });

    describe("when multiple payers with settlements", () => {
      it("should compute balances correctly with split payments", async () => {
        const populatedGroup = {
          _id: groupId,
          members: [
            { _id: mockUser._id, name: "Alice", email: "alice@example.com" },
            { _id: mockUser2._id, name: "Bob", email: "bob@example.com" },
            { _id: mockUser3._id, name: "Charlie", email: "charlie@example.com" },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedGroup),
        });

        // Alice paid 60, Bob paid 40, split equally 3 ways (~33.33 each)
        Expense.find = jest.fn().mockResolvedValue([
          {
            amount: 99,
            paidBy: [
              { user: mockUser._id, amount: 60 },
              { user: mockUser2._id, amount: 39 },
            ],
            splits: [
              { user: mockUser._id, amount: 33 },
              { user: mockUser2._id, amount: 33 },
              { user: mockUser3._id, amount: 33 },
            ],
          },
        ]);

        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/balances")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);

        var totalBalance = response.body.reduce(function(sum, b) { return sum + b.balance; }, 0);
        expect(totalBalance).toBeCloseTo(0, 2);

        var alice = response.body.find(function(b) { return b.user._id === mockUser._id; });
        var bob = response.body.find(function(b) { return b.user._id === mockUser2._id; });
        var charlie = response.body.find(function(b) { return b.user._id === mockUser3._id; });

        // Alice: paid 60, owed 33 => +27
        expect(alice.balance).toBe(27);
        // Bob: paid 39, owed 33 => +6
        expect(bob.balance).toBe(6);
        // Charlie: paid 0, owed 33 => -33
        expect(charlie.balance).toBe(-33);
      });
    });
  });
});
