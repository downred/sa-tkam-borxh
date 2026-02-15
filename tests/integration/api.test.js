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

describe("API", () => {
  beforeAll(async () => {
    // Given the test environment is configured
    process.env.JWT_SECRET = "test-secret-key";
    process.env.MONGODB_URI = "mongodb://localhost:27017/test-db";

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

  describe("Root Endpoint", () => {
    describe("GET /api", () => {
      it("should return a welcome message", async () => {
        // When requesting the root endpoint
        const response = await request(app).get("/api");

        // Then it should return success with welcome message
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Welcome to Splitwise Solo API");
      });
    });
  });

  describe("Authentication", () => {
    describe("User Registration", () => {
      describe("when required fields are missing", () => {
        it("should reject the request with 400 status", async () => {
          // Given a registration request without name and password
          const response = await request(app)
            .post("/api/auth/register")
            .send({ email: "test@example.com" });

          // Then it should return a validation error
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("error");
        });
      });

      // TODO: implement email validation
      describe("when email format is invalid", () => {
        it("should reject the request with validation error", async () => {
          // Given a registration request with invalid email format
          const response = await request(app).post("/api/auth/register").send({
            name: "Test User",
            email: "invalid-email",
            password: "password123",
          });

          // Then it should return an email validation error
          expect(response.status).toBe(400);
          expect(response.body.error).toContain("valid email");
        });
      });
    });

    describe("User Login", () => {
      describe("when credentials are incomplete", () => {
        it("should reject the request with 400 status", async () => {
          // Given a login request without password
          const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@example.com" });

          // Then it should return a validation error
          expect(response.status).toBe(400);
          expect(response.body.error).toBe("Please provide email and password");
        });
      });

      describe("when password is incorrect", () => {
        it("should reject the request with 401 status", async () => {
          // Given a user exists in the database
          User.findOne = jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              _id: "123",
              email: "john@example.com",
              password: "hashedPassword",
            }),
          });
          bcrypt.compare = jest.fn().mockResolvedValue(false);

          // When attempting login with wrong password
          const response = await request(app).post("/api/auth/login").send({
            email: "john@example.com",
            password: "wrongpassword",
          });

          // Then it should return unauthorized
          expect(response.status).toBe(401);
        });
      });
    });
  });

  describe("Expenses", () => {
    describe("Listing Expenses", () => {
      describe("when expenses exist", () => {
        it("should return an array of all expenses", async () => {
          // Given expenses exist in the database
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

          // When requesting all expenses
          const response = await request(app).get("/api/expenses");

          // Then it should return the expenses array
          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
        });
      });
    });

    describe("Creating Expense", () => {
      describe("when required fields are missing", () => {
        it("should reject the request with 400 status", async () => {
          // Given an expense request with only description
          const response = await request(app)
            .post("/api/expenses")
            .send({ description: "Test" });

          // Then it should return a validation error
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("error");
        });
      });
    });

    describe("Getting Single Expense", () => {
      describe("when expense does not exist", () => {
        it("should return 404 status", async () => {
          // Given the expense is not found
          Expense.findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
          });

          // When requesting the non-existent expense
          const response = await request(app).get(
            "/api/expenses/507f1f77bcf86cd799439011"
          );

          // Then it should return not found
          expect(response.status).toBe(404);
          expect(response.body.error).toBe("Expense not found");
        });
      });
    });

    describe("Deleting Expense", () => {
      describe("when expense does not exist", () => {
        it("should return 404 status", async () => {
          // Given the expense is not found
          Expense.findByIdAndDelete = jest.fn().mockResolvedValue(null);

          // When attempting to delete
          const response = await request(app).delete(
            "/api/expenses/507f1f77bcf86cd799439011"
          );

          // Then it should return not found
          expect(response.status).toBe(404);
          expect(response.body.error).toBe("Expense not found");
        });
      });
    });
  });

  describe("Users", () => {
    describe("Listing Users", () => {
      describe("when users exist", () => {
        it("should return an array of all users", async () => {
          // Given users exist in the database
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

          // When requesting all users
          const response = await request(app).get("/api/users");

          // Then it should return the users array
          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
        });
      });
    });

    describe("Getting Single User", () => {
      describe("when user does not exist", () => {
        it("should return 404 status", async () => {
          // Given the user is not found
          User.findById = jest.fn().mockResolvedValue(null);

          // When requesting the non-existent user
          const response = await request(app).get(
            "/api/users/507f1f77bcf86cd799439011"
          );

          // Then it should return not found
          expect(response.status).toBe(404);
          expect(response.body.error).toBe("User not found");
        });
      });
    });
  });
});
