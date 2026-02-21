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

      describe("when splitAmong is empty array", () => {
        it("should return 400 to prevent division by zero", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Test",
              amount: 100,
              groupId: groupId,
              splitType: "equal",
              paidBy: [{ user: mockUser._id, amount: 100 }],
              splitAmong: [],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("at least one participant");
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

    describe("Shares Split", () => {
      describe("when creating with valid shares", () => {
        it("should create expense with share-based splits", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Rent",
              amount: 900,
              groupId: groupId,
              splitType: "shares",
              paidBy: [{ user: mockUser._id, amount: 900 }],
              splitAmong: [
                { user: mockUser._id, shares: 2 },
                { user: mockUser2._id, shares: 1 },
              ],
            });

          expect(response.status).toBe(201);
        });
      });

      describe("when shares split calculates correctly", () => {
        it("should split 90 with shares 2:1 as 60:30", async () => {
          // 2 shares + 1 share = 3 total
          // Alice: 90 * 2/3 = 60
          // Bob: 90 * 1/3 = 30
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Dinner",
              amount: 90,
              groupId: groupId,
              splitType: "shares",
              paidBy: [{ user: mockUser._id, amount: 90 }],
              splitAmong: [
                { user: mockUser._id, shares: 2 },
                { user: mockUser2._id, shares: 1 },
              ],
            });

          expect(response.status).toBe(201);
        });
      });

      describe("when shares split has no shares", () => {
        it("should return 400 error", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "No shares",
              amount: 100,
              groupId: groupId,
              splitType: "shares",
              paidBy: [{ user: mockUser._id, amount: 100 }],
              splitAmong: [mockUser._id, mockUser2._id],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("Shares split requires shares");
        });
      });

      describe("when total shares is zero", () => {
        it("should return 400 error", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Zero shares",
              amount: 100,
              groupId: groupId,
              splitType: "shares",
              paidBy: [{ user: mockUser._id, amount: 100 }],
              splitAmong: [
                { user: mockUser._id, shares: 0 },
                { user: mockUser2._id, shares: 0 },
              ],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("Total shares must be greater than 0");
        });
      });
    });

    describe("Refunds (Negative Expenses)", () => {
      describe("when creating a refund with equal split", () => {
        it("should create expense with negative amounts", async () => {
          // Bob refunds €60 split equally among 3 people (-€20 each)
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Refund for cancelled trip",
              amount: -60,
              groupId: groupId,
              splitType: "equal",
              paidBy: [{ user: mockUser2._id, amount: -60 }],
              splitAmong: [mockUser._id, mockUser2._id, mockUser3._id],
            });

          expect(response.status).toBe(201);
          expect(response.body.amount).toBe(-60);
          // Each person's split should be -20
          expect(response.body.splits[0].amount).toBe(-20);
        });
      });

      describe("when creating a refund with exact amounts", () => {
        it("should create expense with specified negative amounts", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Partial refund",
              amount: -50,
              groupId: groupId,
              splitType: "exact",
              paidBy: [{ user: mockUser._id, amount: -50 }],
              splitAmong: [
                { user: mockUser._id, amount: -30 },
                { user: mockUser2._id, amount: -20 },
              ],
            });

          expect(response.status).toBe(201);
          expect(response.body.amount).toBe(-50);
        });
      });

      describe("when amount is zero", () => {
        it("should return 400 error", async () => {
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Zero expense",
              amount: 0,
              groupId: groupId,
              paidBy: [{ user: mockUser._id, amount: 0 }],
              splitAmong: [mockUser._id],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("Amount cannot be zero");
        });
      });

      describe("when refund amount sign mismatches paidBy", () => {
        it("should fail zero-sum validation", async () => {
          // Negative amount but positive paidBy - should fail
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", "Bearer " + validToken)
            .send({
              description: "Bad refund",
              amount: -50,
              groupId: groupId,
              paidBy: [{ user: mockUser._id, amount: 50 }], // Wrong sign!
              splitAmong: [mockUser._id, mockUser2._id],
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain("Paid");
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
          group: groupId,
          createdBy: { toString: () => mockUser._id },
          paidBy: [{ user: mockUser._id, amount: 50 }],
          splits: [{ user: mockUser._id, amount: 50 }],
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockResolvedValue(true),
        };

        Expense.findById = jest.fn().mockResolvedValue(existingExpense);
        Group.findById = jest.fn().mockResolvedValue({
          ...mockGroup,
          members: [{ toString: () => mockUser._id }],
        });

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

    describe("when updating paidBy with non-group member", () => {
      it("should return 400", async () => {
        const existingExpense = {
          _id: "e1",
          group: groupId,
          amount: 100,
          createdBy: { toString: () => mockUser._id },
          paidBy: [{ user: mockUser._id, amount: 100 }],
          splits: [
            { user: mockUser._id, amount: 50 },
            { user: mockUser2._id, amount: 50 },
          ],
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockReturnThis(),
        };

        Expense.findById = jest.fn().mockResolvedValue(existingExpense);
        Group.findById = jest.fn().mockResolvedValue({
          ...mockGroup,
          members: [{ toString: () => mockUser._id }, { toString: () => mockUser2._id }],
        });

        const response = await request(app)
          .put("/api/expenses/e1")
          .set("Authorization", "Bearer " + validToken)
          .send({
            paidBy: [{ user: "nonmember123", amount: 100 }],
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("not a group member");
      });
    });

    describe("when updating splits with non-group member", () => {
      it("should return 400", async () => {
        const existingExpense = {
          _id: "e1",
          group: groupId,
          amount: 100,
          createdBy: { toString: () => mockUser._id },
          paidBy: [{ user: mockUser._id, amount: 100 }],
          splits: [
            { user: mockUser._id, amount: 50 },
            { user: mockUser2._id, amount: 50 },
          ],
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockReturnThis(),
        };

        Expense.findById = jest.fn().mockResolvedValue(existingExpense);
        Group.findById = jest.fn().mockResolvedValue({
          ...mockGroup,
          members: [{ toString: () => mockUser._id }, { toString: () => mockUser2._id }],
        });

        const response = await request(app)
          .put("/api/expenses/e1")
          .set("Authorization", "Bearer " + validToken)
          .send({
            splits: [
              { user: mockUser._id, amount: 50 },
              { user: "nonmember456", amount: 50 },
            ],
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("not a group member");
      });
    });
  });

  // ───────────────────────────────────────────────
  // DELETE /api/expenses/:id
  // ───────────────────────────────────────────────
  describe("Delete Expense", () => {
    describe("when creator deletes expense", () => {
      it("should delete successfully and return balance impact", async () => {
        const existingExpense = {
          _id: "e1",
          description: "Test dinner",
          amount: 100,
          createdBy: { toString: () => mockUser._id },
          paidBy: [{ user: { toString: () => mockUser._id }, amount: 100 }],
          splits: [
            { user: { toString: () => mockUser._id }, amount: 50 },
            { user: { toString: () => mockUser2._id }, amount: 50 },
          ],
          deleteOne: jest.fn().mockResolvedValue(true),
        };

        Expense.findById = jest.fn().mockResolvedValue(existingExpense);

        const response = await request(app)
          .delete("/api/expenses/e1")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Expense deleted successfully");
        expect(response.body.deletedExpense.description).toBe("Test dinner");
        expect(response.body.deletedExpense.amount).toBe(100);
        expect(response.body.balanceImpact).toBeDefined();
        expect(existingExpense.deleteOne).toHaveBeenCalled();
      });

      it("should show correct balance impact", async () => {
        // Alice paid €100, split €50 each with Bob
        // Balance impact: Alice loses €50 (was owed), Bob gains €50 (no longer owes)
        const aliceId = mockUser._id;
        const bobId = mockUser2._id;
        
        const existingExpense = {
          _id: "e1",
          description: "Test",
          amount: 100,
          createdBy: { toString: () => aliceId },
          paidBy: [{ user: aliceId, amount: 100 }],
          splits: [
            { user: aliceId, amount: 50 },
            { user: bobId, amount: 50 },
          ],
          deleteOne: jest.fn().mockResolvedValue(true),
        };

        Expense.findById = jest.fn().mockResolvedValue(existingExpense);

        const response = await request(app)
          .delete("/api/expenses/e1")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        
        // Alice: paid -100 + split +50 = -50 (loses €50)
        const aliceImpact = response.body.balanceImpact.find(b => b.user === aliceId);
        expect(aliceImpact.change).toBe(-50);
        
        // Bob: split +50 (no longer owes €50)
        const bobImpact = response.body.balanceImpact.find(b => b.user === bobId);
        expect(bobImpact.change).toBe(50);
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

  describe("Debt Simplification", () => {
    const mockUser4 = {
      _id: "507f1f77bcf86cd799439044",
      name: "Diana",
      email: "diana@example.com",
    };

    describe("Simple chain simplification", () => {
      it("should simplify A->B->C to A->C", async () => {
        // Scenario: A owes B €50, B owes C €50
        // After simplification: A pays C €50 (1 transaction instead of 2)
        const mockGroupWith3 = {
          ...mockGroup,
          members: [
            { _id: mockUser._id, name: mockUser.name, email: mockUser.email },
            { _id: mockUser2._id, name: mockUser2.name, email: mockUser2.email },
            { _id: mockUser3._id, name: mockUser3.name, email: mockUser3.email },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGroupWith3),
        });

        // Expense 1: B paid €100, split equally A/B => A owes B €50
        // Expense 2: C paid €100, split equally B/C => B owes C €50
        Expense.find = jest.fn().mockResolvedValue([
          {
            paidBy: [{ user: { toString: () => mockUser2._id }, amount: 100 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 50 },
              { user: { toString: () => mockUser2._id }, amount: 50 },
            ],
          },
          {
            paidBy: [{ user: { toString: () => mockUser3._id }, amount: 100 }],
            splits: [
              { user: { toString: () => mockUser2._id }, amount: 50 },
              { user: { toString: () => mockUser3._id }, amount: 50 },
            ],
          },
        ]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/simplified-debts")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        // Net: A=-50, B=0, C=+50 => A pays C €50 (1 transaction)
        expect(response.body.transactionCount).toBe(1);
        expect(response.body.transactions[0].from._id).toBe(mockUser._id);
        expect(response.body.transactions[0].to._id).toBe(mockUser3._id);
        expect(response.body.transactions[0].amount).toBe(50);
      });
    });

    describe("Circular debt cancellation", () => {
      it("should cancel out circular debts completely", async () => {
        // Scenario: A owes B €30, B owes C €30, C owes A €30
        // All circular - net balances are 0, no transactions needed
        const mockGroupWith3 = {
          ...mockGroup,
          members: [
            { _id: mockUser._id, name: mockUser.name, email: mockUser.email },
            { _id: mockUser2._id, name: mockUser2.name, email: mockUser2.email },
            { _id: mockUser3._id, name: mockUser3.name, email: mockUser3.email },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGroupWith3),
        });

        // A owes B €30: B paid €60, split A/B equally
        // B owes C €30: C paid €60, split B/C equally
        // C owes A €30: A paid €60, split A/C equally
        Expense.find = jest.fn().mockResolvedValue([
          {
            paidBy: [{ user: { toString: () => mockUser2._id }, amount: 60 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 30 },
              { user: { toString: () => mockUser2._id }, amount: 30 },
            ],
          },
          {
            paidBy: [{ user: { toString: () => mockUser3._id }, amount: 60 }],
            splits: [
              { user: { toString: () => mockUser2._id }, amount: 30 },
              { user: { toString: () => mockUser3._id }, amount: 30 },
            ],
          },
          {
            paidBy: [{ user: { toString: () => mockUser._id }, amount: 60 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 30 },
              { user: { toString: () => mockUser3._id }, amount: 30 },
            ],
          },
        ]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/simplified-debts")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        // All cancel out - no transactions needed
        expect(response.body.transactionCount).toBe(0);
        expect(response.body.transactions).toEqual([]);
      });

      it("should handle partial circular debt with remainder", async () => {
        // A owes B €50, B owes C €30, C owes A €20
        // Net: A = -50+20 = -30, B = +50-30 = +20, C = +30-20 = +10
        // Simplified: A pays B €20, A pays C €10 (2 transactions)
        const mockGroupWith3 = {
          ...mockGroup,
          members: [
            { _id: mockUser._id, name: mockUser.name, email: mockUser.email },
            { _id: mockUser2._id, name: mockUser2.name, email: mockUser2.email },
            { _id: mockUser3._id, name: mockUser3.name, email: mockUser3.email },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGroupWith3),
        });

        Expense.find = jest.fn().mockResolvedValue([
          {
            paidBy: [{ user: { toString: () => mockUser2._id }, amount: 100 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 50 },
              { user: { toString: () => mockUser2._id }, amount: 50 },
            ],
          },
          {
            paidBy: [{ user: { toString: () => mockUser3._id }, amount: 60 }],
            splits: [
              { user: { toString: () => mockUser2._id }, amount: 30 },
              { user: { toString: () => mockUser3._id }, amount: 30 },
            ],
          },
          {
            paidBy: [{ user: { toString: () => mockUser._id }, amount: 40 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 20 },
              { user: { toString: () => mockUser3._id }, amount: 20 },
            ],
          },
        ]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/simplified-debts")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.transactionCount).toBe(2);
        
        // A (owes 30) pays B (owed 20) and C (owed 10)
        const totalPaid = response.body.transactions.reduce((sum, t) => sum + t.amount, 0);
        expect(totalPaid).toBe(30);
      });
    });

    describe("Multiple creditors and debtors", () => {
      it("should minimize transactions with 4 people", async () => {
        // A=-60, B=-40, C=+70, D=+30
        // Optimal: A pays C €60, B pays C €10, B pays D €30 = 3 transactions
        const mockGroupWith4 = {
          ...mockGroup,
          members: [
            { _id: mockUser._id, name: mockUser.name, email: mockUser.email },
            { _id: mockUser2._id, name: mockUser2.name, email: mockUser2.email },
            { _id: mockUser3._id, name: mockUser3.name, email: mockUser3.email },
            { _id: mockUser4._id, name: mockUser4.name, email: mockUser4.email },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGroupWith4),
        });

        Expense.find = jest.fn().mockResolvedValue([
          {
            paidBy: [{ user: { toString: () => mockUser3._id }, amount: 140 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 35 },
              { user: { toString: () => mockUser2._id }, amount: 35 },
              { user: { toString: () => mockUser3._id }, amount: 35 },
              { user: { toString: () => mockUser4._id }, amount: 35 },
            ],
          },
          {
            paidBy: [{ user: { toString: () => mockUser4._id }, amount: 60 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 25 },
              { user: { toString: () => mockUser2._id }, amount: 5 },
              { user: { toString: () => mockUser3._id }, amount: 30 },
              { user: { toString: () => mockUser4._id }, amount: 0 },
            ],
          },
        ]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/simplified-debts")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        // Max n-1 transactions for n people with non-zero balance
        expect(response.body.transactionCount).toBeLessThanOrEqual(3);
        
        // Sum of all transaction amounts should conserve money
        const totalTransferred = response.body.transactions.reduce((sum, t) => sum + t.amount, 0);
        expect(totalTransferred).toBe(100); // Total debt = 60 + 40 = 100
      });
    });

    describe("Already settled group", () => {
      it("should return 0 transactions when all settled", async () => {
        const mockGroupWith2 = {
          ...mockGroup,
          members: [
            { _id: mockUser._id, name: mockUser.name, email: mockUser.email },
            { _id: mockUser2._id, name: mockUser2.name, email: mockUser2.email },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGroupWith2),
        });

        // A paid €100, split equally
        Expense.find = jest.fn().mockResolvedValue([
          {
            paidBy: [{ user: { toString: () => mockUser._id }, amount: 100 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 50 },
              { user: { toString: () => mockUser2._id }, amount: 50 },
            ],
          },
        ]);
        // B settled with A
        Settlement.find = jest.fn().mockResolvedValue([
          {
            from: { toString: () => mockUser2._id },
            to: { toString: () => mockUser._id },
            amount: 50,
          },
        ]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/simplified-debts")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.transactionCount).toBe(0);
        expect(response.body.summary).toContain("0 payments");
      });
    });
  });

  describe("Zero-Sum Integrity", () => {
    describe("Create expense validation", () => {
      it("should reject expense where splits don't sum to amount", async () => {
        Group.findById = jest.fn().mockResolvedValue({
          ...mockGroup,
          members: [{ toString: () => mockUser._id }, { toString: () => mockUser2._id }],
        });

        const response = await request(app)
          .post("/api/expenses")
          .set("Authorization", "Bearer " + validToken)
          .send({
            description: "Bad expense",
            amount: 100,
            groupId: groupId,
            paidBy: [{ user: mockUser._id, amount: 100 }],
            splitType: "exact",
            splitAmong: [
              { user: mockUser._id, amount: 40 },
              { user: mockUser2._id, amount: 40 }, // Only 80, not 100!
            ],
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("must sum to");
      });

      it("should reject expense where paidBy doesn't sum to amount", async () => {
        Group.findById = jest.fn().mockResolvedValue({
          ...mockGroup,
          members: [{ toString: () => mockUser._id }, { toString: () => mockUser2._id }],
        });

        const response = await request(app)
          .post("/api/expenses")
          .set("Authorization", "Bearer " + validToken)
          .send({
            description: "Bad expense",
            amount: 100,
            groupId: groupId,
            paidBy: [{ user: mockUser._id, amount: 80 }], // Only 80, not 100!
            splitType: "equal",
            splitAmong: [mockUser._id, mockUser2._id],
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Paid amounts must sum");
      });
    });

    describe("Group integrity check endpoint", () => {
      it("should return valid for healthy group", async () => {
        const mockGroupWith2 = {
          ...mockGroup,
          members: [
            { _id: mockUser._id, name: mockUser.name, email: mockUser.email },
            { _id: mockUser2._id, name: mockUser2.name, email: mockUser2.email },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGroupWith2),
        });

        // Valid expense: paid = splits = amount
        Expense.find = jest.fn().mockResolvedValue([
          {
            _id: "expense1",
            description: "Dinner",
            amount: 100,
            paidBy: [{ user: { toString: () => mockUser._id }, amount: 100 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 50 },
              { user: { toString: () => mockUser2._id }, amount: 50 },
            ],
          },
        ]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/integrity")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.valid).toBe(true);
        expect(response.body.totalBalance).toBe(0);
        expect(response.body.issues).toHaveLength(0);
        expect(response.body.message).toContain("Zero-sum integrity verified");
      });

      it("should detect expense with mismatched splits", async () => {
        const mockGroupWith2 = {
          ...mockGroup,
          members: [
            { _id: mockUser._id, name: mockUser.name, email: mockUser.email },
            { _id: mockUser2._id, name: mockUser2.name, email: mockUser2.email },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGroupWith2),
        });

        // Invalid expense: splits don't sum to amount
        Expense.find = jest.fn().mockResolvedValue([
          {
            _id: "expense1",
            description: "Bad expense",
            amount: 100,
            paidBy: [{ user: { toString: () => mockUser._id }, amount: 100 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 40 },
              { user: { toString: () => mockUser2._id }, amount: 40 }, // Total 80, not 100
            ],
          },
        ]);
        Settlement.find = jest.fn().mockResolvedValue([]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/integrity")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.valid).toBe(false);
        expect(response.body.issues.length).toBeGreaterThan(0);
        expect(response.body.issues[0].type).toBe("expense_split_mismatch");
      });

      it("should verify balances sum to zero after settlements", async () => {
        const mockGroupWith2 = {
          ...mockGroup,
          members: [
            { _id: mockUser._id, name: mockUser.name, email: mockUser.email },
            { _id: mockUser2._id, name: mockUser2.name, email: mockUser2.email },
          ],
        };

        Group.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGroupWith2),
        });

        // Alice paid €100, split equally -> Alice +50, Bob -50
        Expense.find = jest.fn().mockResolvedValue([
          {
            _id: "expense1",
            description: "Dinner",
            amount: 100,
            paidBy: [{ user: { toString: () => mockUser._id }, amount: 100 }],
            splits: [
              { user: { toString: () => mockUser._id }, amount: 50 },
              { user: { toString: () => mockUser2._id }, amount: 50 },
            ],
          },
        ]);
        // Bob paid Alice €50 -> now both at 0
        Settlement.find = jest.fn().mockResolvedValue([
          {
            from: { toString: () => mockUser2._id },
            to: { toString: () => mockUser._id },
            amount: 50,
          },
        ]);

        const response = await request(app)
          .get("/api/groups/" + groupId + "/integrity")
          .set("Authorization", "Bearer " + validToken);

        expect(response.status).toBe(200);
        expect(response.body.valid).toBe(true);
        expect(response.body.totalBalance).toBe(0);
      });
    });
  });
});
