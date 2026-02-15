const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../../server/models/User");
const Expense = require("../../server/models/Expense");
const bcrypt = require("bcryptjs");


jest.mock("../../server/config/database");
jest.mock("bcryptjs");
jest.mock("@scalar/express-api-reference", () => ({
  apiReference: jest.fn(() => (req, res) => {
    res.status(200).json({ message: "API Reference Mock" });
  }),
}));

let app;

describe("API Integration Tests", () => {
  beforeAll(async () => {
    
    process.env.JWT_SECRET = "test-secret-key";
    process.env.MONGODB_URI = "mongodb:

    
    mongoose.connect = jest.fn().mockResolvedValue(true);

    
    bcrypt.genSalt = jest.fn().mockResolvedValue("salt");
    bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    app = require("../../server/index");
  });

  afterAll(async () => {
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe("GET /api", () => {
    test("should return welcome message", async () => {
      const response = await request(app).get("/api");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Welcome to Splitwise Solo API");
    });
  });

  describe("Auth Endpoints", () => {
    describe("POST /api/auth/register", () => {
      test("should return 400 if required fields are missing", async () => {
        const response = await request(app)
          .post("/api/auth/register")
          .send({ email: "test@example.com" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      });

            //todo: implement email validation
      test("should validate email format in request", async () => {
        const response = await request(app).post("/api/auth/register").send({
          name: "Test User",
          email: "invalid-email",
          password: "password123",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("valid email");
      });
    });

    describe("POST /api/auth/login", () => {
      test("should return 400 if email or password is missing", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({ email: "test@example.com" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Please provide email and password");
      });

      test("should return 401 for invalid password", async () => {
        User.findOne = jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            _id: "123",
            email: "john@example.com",
            password: "hashedPassword",
          }),
        });

        bcrypt.compare = jest.fn().mockResolvedValue(false);

        const response = await request(app).post("/api/auth/login").send({
          email: "john@example.com",
          password: "wrongpassword",
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe("Expense Endpoints", () => {
    describe("GET /api/expenses", () => {
      test("should return an array of expenses", async () => {
        
        const mockExpenses = [
          {
            _id: "507f1f77bcf86cd799439011",
            description: "Test Expense",
            amount: 100,
            category: "Food",
            date: new Date(),
            paidBy: { name: "John Doe", email: "john@example.com" },
          },
        ];

        Expense.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockExpenses),
          }),
        });

        const response = await request(app).get("/api/expenses");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe("POST /api/expenses", () => {
      test("should return 400 if required fields are missing", async () => {
        const response = await request(app)
          .post("/api/expenses")
          .send({ description: "Test" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      });
    });

    describe("GET /api/expenses/:id", () => {
      test("should return 404 for non-existent expense", async () => {
        Expense.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        });

        const response = await request(app).get(
          "/api/expenses/507f1f77bcf86cd799439011",
        );

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Expense not found");
      });
    });

    describe("DELETE /api/expenses/:id", () => {
      test("should return 404 when deleting non-existent expense", async () => {
        Expense.findByIdAndDelete = jest.fn().mockResolvedValue(null);

        const response = await request(app).delete(
          "/api/expenses/507f1f77bcf86cd799439011",
        );

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Expense not found");
      });
    });
  });

  describe("User Endpoints", () => {
    describe("GET /api/users", () => {
      test("should return an array of users", async () => {
        const mockUsers = [
          {
            _id: "507f1f77bcf86cd799439011",
            name: "John Doe",
            email: "john@example.com",
            phone: "1234567890",
          },
        ];

        User.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers),
        });

        const response = await request(app).get("/api/users");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe("GET /api/users/:id", () => {
      test("should return 404 for non-existent user", async () => {
        User.findById = jest.fn().mockResolvedValue(null);

        const response = await request(app).get(
          "/api/users/507f1f77bcf86cd799439011",
        );

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("User not found");
      });
    });
  });
});
