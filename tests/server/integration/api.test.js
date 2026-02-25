const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../../../server/models/User");
const Expense = require("../../../server/models/Expense");
const Group = require("../../../server/models/Group");
const bcrypt = require("bcryptjs");

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
  name: "Test User",
  email: "test@example.com",
};

const mockGroup = {
  _id: "607f1f77bcf86cd799439099",
  name: "Test Group",
  members: [mockUser._id],
  createdBy: mockUser._id,
};

describe("API", () => {
  beforeAll(async () => {
    
    process.env.JWT_SECRET = "test-secret-key";
    process.env.MONGODB_URI = "mongodb://localhost:27017/test-db";

    mongoose.connect = jest.fn().mockResolvedValue(true);

    bcrypt.genSalt = jest.fn().mockResolvedValue("salt");
    bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    app = require("../../../server/index");
    jwt = require("../../../server/node_modules/jsonwebtoken");
    validToken = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    
    jest.clearAllMocks();
    
    User.findById = jest.fn().mockResolvedValue(mockUser);
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
        
        const response = await request(app).get("/api");

        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Welcome to saTkamBorxh API");
      });
    });
  });

  describe("Authentication", () => {
    describe("User Registration", () => {
      describe("when required fields are missing", () => {
        it("should reject the request with 400 status", async () => {
          
          const response = await request(app)
            .post("/api/auth/register")
            .send({ email: "test@example.com" });

          
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("error");
        });
      });

      
      describe("when email format is invalid", () => {
        it("should reject the request with validation error", async () => {
          
          const response = await request(app).post("/api/auth/register").send({
            name: "Test User",
            email: "invalid-email",
            password: "password123",
          });

          
          expect(response.status).toBe(400);
          expect(response.body.error).toContain("valid email");
        });
      });
    });

    describe("User Login", () => {
      describe("when credentials are incomplete", () => {
        it("should reject the request with 400 status", async () => {
          
          const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@example.com" });

          
          expect(response.status).toBe(400);
          expect(response.body.error).toBe("Please provide email and password");
        });
      });

      describe("when password is incorrect", () => {
        it("should reject the request with 401 status", async () => {
          
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
  });

  describe("Expenses", () => {
    describe("Listing Expenses", () => {
      describe("when expenses exist", () => {
        it("should return an array of all expenses", async () => {
          
          const mockExpenses = [
            {
              _id: "507f1f77bcf86cd799439011",
              description: "Test Expense",
              amount: 100,
              category: "Food",
              date: new Date(),
              paidBy: [{ user: mockUser, amount: 100 }],
              splits: [{ user: mockUser, amount: 100 }],
              createdBy: mockUser,
            },
          ];

          Group.findById = jest.fn().mockResolvedValue(mockGroup);
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
            .get(`/api/groups/${mockGroup._id}/expenses`)
            .set("Authorization", `Bearer ${validToken}`);

          
          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
        });
      });
    });

    describe("Creating Expense", () => {
      describe("when required fields are missing", () => {
        it("should reject the request with 400 status", async () => {
          
          const response = await request(app)
            .post("/api/expenses")
            .set("Authorization", `Bearer ${validToken}`)
            .send({ description: "Test" });

          
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty("error");
        });
      });
    });

    describe("Getting Single Expense", () => {
      describe("when expense does not exist", () => {
        it("should return 404 status", async () => {
          
          Expense.findById = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
              }),
            }),
          });

          
          const response = await request(app)
            .get("/api/expenses/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${validToken}`);

          
          expect(response.status).toBe(404);
          expect(response.body.error).toBe("Expense not found");
        });
      });
    });

    describe("Deleting Expense", () => {
      describe("when expense does not exist", () => {
        it("should return 404 status", async () => {
          
          Expense.findById = jest.fn().mockResolvedValue(null);

          
          const response = await request(app)
            .delete("/api/expenses/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${validToken}`);

          
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

          
          const response = await request(app)
            .get("/api/users")
            .set("Authorization", "Bearer " + validToken);

          
          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
        });
      });
    });

    describe("Getting Single User", () => {
      describe("when user does not exist", () => {
        it("should return 404 status", async () => {
          
          User.findById = jest.fn()
            .mockResolvedValueOnce(mockUser) 
            .mockResolvedValueOnce(null);    

          
          const response = await request(app)
            .get("/api/users/507f1f77bcf86cd799439011")
            .set("Authorization", "Bearer " + validToken);

          
          expect(response.status).toBe(404);
          expect(response.body.error).toBe("User not found");
        });
      });
    });
  });

  describe("Password Boundary Value Analysis", () => {
    describe("User Registration Password Length", () => {
      describe("when password is at minimum boundary (6 chars)", () => {
        it("should accept the password", async () => {
          
          User.findOne = jest.fn().mockResolvedValue(null);
          User.create = jest.fn().mockResolvedValue({
            _id: "123",
            name: "Test User",
            email: "test@example.com",
          });

          const response = await request(app).post("/api/auth/register").send({
            name: "Test User",
            email: "test@example.com",
            password: "123456", 
          });

          
          expect(response.status).toBe(201);
        });
      });

      describe("when password is below minimum boundary (5 chars)", () => {
        it("should reject the password", async () => {
          
          const response = await request(app).post("/api/auth/register").send({
            name: "Test User",
            email: "test@example.com",
            password: "12345", 
          });

          
          expect(response.status).toBe(400);
        });
      });

      describe("when password is above minimum boundary (7 chars)", () => {
        it("should accept the password", async () => {
          
          User.findOne = jest.fn().mockResolvedValue(null);
          User.create = jest.fn().mockResolvedValue({
            _id: "123",
            name: "Test User",
            email: "test@example.com",
          });

          const response = await request(app).post("/api/auth/register").send({
            name: "Test User",
            email: "test@example.com",
            password: "1234567", 
          });

          
          expect(response.status).toBe(201);
        });
      });
    });
  });

  describe("Get Current User (Auth Me)", () => {
    describe("when token is valid", () => {
      it("should return user data", async () => {
        
        User.findById = jest.fn().mockResolvedValue({
          _id: "123",
          name: "John Doe",
          email: "john@example.com",
        });

        
        const response = await request(app)
          .get("/api/auth/me")
          .set("Authorization", `Bearer ${validToken}`);

        
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("name");
        expect(response.body.data).toHaveProperty("email");
      });
    });

    describe("when token is missing", () => {
      it("should return 401 status", async () => {
        
        const response = await request(app).get("/api/auth/me");

        
        expect(response.status).toBe(401);
      });
    });

    describe("when token is invalid", () => {
      it("should return 401 status", async () => {
        
        const response = await request(app)
          .get("/api/auth/me")
          .set("Authorization", "Bearer invalid-token");

        
        expect(response.status).toBe(401);
      });
    });
  });
});
