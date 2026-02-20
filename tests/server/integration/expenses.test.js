const request = require("supertest");
const mongoose = require("mongoose");
const Expense = require("../../../server/models/Expense");

jest.mock("../../../server/config/database");
jest.mock("bcryptjs");
jest.mock("@scalar/express-api-reference", () => ({
  apiReference: jest.fn(() => (req, res) => {
    res.status(200).json({ message: "API Reference Mock" });
  }),
}));

let app;

const mockExpense = {
  _id: "507f1f77bcf86cd799439011",
  description: "Groceries",
  amount: 150.50,
  category: "Food",
  date: new Date("2026-02-15"),
  paidBy: {
    _id: "507f1f77bcf86cd799439022",
    name: "John Doe",
    email: "john@example.com",
  },
};

describe("Expenses API", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret-key";
    process.env.MONGODB_URI = "mongodb://localhost:27017/test-db";

    mongoose.connect = jest.fn().mockResolvedValue(true);

    app = require("../../../server/index");
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/expenses", () => {
    describe("when expenses exist", () => {
      it("should return all expenses sorted by date", async () => {
        const mockExpenses = [
          mockExpense,
          { ...mockExpense, _id: "507f1f77bcf86cd799439033", description: "Rent" },
        ];

        Expense.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockExpenses),
          }),
        });

        const response = await request(app).get("/api/expenses");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
      });
    });

    describe("when no expenses exist", () => {
      it("should return empty array", async () => {
        Expense.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([]),
          }),
        });

        const response = await request(app).get("/api/expenses");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
    });

    describe("when database error occurs", () => {
      it("should return 500 error", async () => {
        Expense.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error("Database error")),
          }),
        });

        const response = await request(app).get("/api/expenses");

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error");
      });
    });
  });

  describe("GET /api/expenses/:id", () => {
    describe("when expense exists", () => {
      it("should return the expense with populated paidBy", async () => {
        Expense.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockExpense),
        });

        const response = await request(app).get(`/api/expenses/${mockExpense._id}`);

        expect(response.status).toBe(200);
        expect(response.body.description).toBe(mockExpense.description);
        expect(response.body.amount).toBe(mockExpense.amount);
        expect(response.body.paidBy).toHaveProperty("name");
      });
    });

    describe("when expense does not exist", () => {
      it("should return 404", async () => {
        Expense.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        });

        const response = await request(app).get("/api/expenses/nonexistent123456");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Expense not found");
      });
    });
  });

  describe("POST /api/expenses", () => {
    describe("when data is valid", () => {
      it("should create a new expense", async () => {
        const newExpense = {
          description: "New Expense",
          amount: 75.00,
          category: "Entertainment",
          paidBy: "507f1f77bcf86cd799439022",
        };

        Expense.prototype.save = jest.fn().mockResolvedValue({
          ...newExpense,
          _id: "507f1f77bcf86cd799439044",
          date: new Date(),
        });

        const response = await request(app)
          .post("/api/expenses")
          .send(newExpense);

        expect(response.status).toBe(201);
      });
    });

    describe("when description is missing", () => {
      it("should return 400 error", async () => {
        Expense.prototype.save = jest.fn().mockRejectedValue(
          new Error("Expense validation failed: description: Path `description` is required.")
        );

        const response = await request(app)
          .post("/api/expenses")
          .send({ amount: 100, paidBy: "507f1f77bcf86cd799439022" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      });
    });

    describe("when amount is missing", () => {
      it("should return 400 error", async () => {
        Expense.prototype.save = jest.fn().mockRejectedValue(
          new Error("Expense validation failed: amount: Path `amount` is required.")
        );

        const response = await request(app)
          .post("/api/expenses")
          .send({ description: "Test", paidBy: "507f1f77bcf86cd799439022" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      });
    });

    describe("when paidBy is missing", () => {
      it("should return 400 error", async () => {
        Expense.prototype.save = jest.fn().mockRejectedValue(
          new Error("Expense validation failed: paidBy: Path `paidBy` is required.")
        );

        const response = await request(app)
          .post("/api/expenses")
          .send({ description: "Test", amount: 100 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      });
    });
  });

  describe("PUT /api/expenses/:id", () => {
    describe("when expense exists", () => {
      it("should update the expense", async () => {
        const updatedExpense = { ...mockExpense, amount: 200.00 };

        Expense.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedExpense);

        const response = await request(app)
          .put(`/api/expenses/${mockExpense._id}`)
          .send({ amount: 200.00 });

        expect(response.status).toBe(200);
        expect(response.body.amount).toBe(200.00);
      });
    });

    describe("when updating description", () => {
      it("should update the description", async () => {
        const updatedExpense = { ...mockExpense, description: "Updated Description" };

        Expense.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedExpense);

        const response = await request(app)
          .put(`/api/expenses/${mockExpense._id}`)
          .send({ description: "Updated Description" });

        expect(response.status).toBe(200);
        expect(response.body.description).toBe("Updated Description");
      });
    });

    describe("when expense does not exist", () => {
      it("should return 404", async () => {
        Expense.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        const response = await request(app)
          .put("/api/expenses/nonexistent123456")
          .send({ amount: 200.00 });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Expense not found");
      });
    });

    describe("when validation fails", () => {
      it("should return 400 error", async () => {
        Expense.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error("Validation failed"));

        const response = await request(app)
          .put(`/api/expenses/${mockExpense._id}`)
          .send({ amount: -100 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      });
    });
  });

  describe("DELETE /api/expenses/:id", () => {
    describe("when expense exists", () => {
      it("should delete the expense", async () => {
        Expense.findByIdAndDelete = jest.fn().mockResolvedValue(mockExpense);

        const response = await request(app).delete(`/api/expenses/${mockExpense._id}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Expense deleted successfully");
      });
    });

    describe("when expense does not exist", () => {
      it("should return 404", async () => {
        Expense.findByIdAndDelete = jest.fn().mockResolvedValue(null);

        const response = await request(app).delete("/api/expenses/nonexistent123456");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Expense not found");
      });
    });

    describe("when database error occurs", () => {
      it("should return 500 error", async () => {
        Expense.findByIdAndDelete = jest.fn().mockRejectedValue(new Error("Database error"));

        const response = await request(app).delete(`/api/expenses/${mockExpense._id}`);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error");
      });
    });
  });
});
