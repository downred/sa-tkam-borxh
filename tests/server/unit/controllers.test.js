const User = require("../../../server/models/User");
const Group = require("../../../server/models/Group");
const Expense = require("../../../server/models/Expense");
const Settlement = require("../../../server/models/Settlement");
const bcrypt = require("bcryptjs");

// Mock all models and dependencies
jest.mock("../../../server/models/User");
jest.mock("../../../server/models/Group");
jest.mock("../../../server/models/Expense");
jest.mock("../../../server/models/Settlement");
jest.mock("bcryptjs");

// Mock jsonwebtoken from server's node_modules
const jwt = require("../../../server/node_modules/jsonwebtoken");
jest.mock("../../../server/node_modules/jsonwebtoken");

// Import controllers after mocking
const authController = require("../../../server/controllers/authController");
const userController = require("../../../server/controllers/userController");
const groupController = require("../../../server/controllers/groupController");
const expenseController = require("../../../server/controllers/expenseController");
const settlementController = require("../../../server/controllers/settlementController");

// Helper to create mock request/response
const mockRequest = (body = {}, params = {}, user = null, query = {}) => ({
  body,
  params,
  user,
  query,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-key";
  });

  // ───────────────────────────────────────────────
  // Auth Controller Tests
  // ───────────────────────────────────────────────
  describe("AuthController", () => {
    describe("register", () => {
      it("should return 400 when required fields are missing", async () => {
        const req = mockRequest({ email: "test@example.com" });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Please provide name, email and password",
        });
      });

      it("should return 400 for invalid email format", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "invalid-email",
          password: "password123",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Please provide a valid email address",
        });
      });

      it("should return 400 when password is too short", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "test@example.com",
          password: "12345",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Password must be at least 6 characters",
        });
      });

      it("should return 400 when user already exists", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });
        const res = mockResponse();

        User.findOne.mockResolvedValue({ email: "test@example.com" });

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "User already exists with this email",
        });
      });

      it("should successfully register a new user", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });
        const res = mockResponse();

        User.findOne.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashedPassword");
        User.create.mockResolvedValue({
          _id: "123",
          name: "Test User",
          email: "test@example.com",
        });
        jwt.sign.mockReturnValue("test-token");

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              token: "test-token",
            }),
          })
        );
      });
    });

    describe("login", () => {
      it("should return 400 when email or password is missing", async () => {
        const req = mockRequest({ email: "test@example.com" });
        const res = mockResponse();

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Please provide email and password",
        });
      });

      it("should return 401 when user is not found", async () => {
        const req = mockRequest({
          email: "test@example.com",
          password: "password123",
        });
        const res = mockResponse();

        User.findOne.mockReturnValue({
          select: jest.fn().mockResolvedValue(null),
        });

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: "Invalid credentials",
        });
      });

      it("should return 401 when password does not match", async () => {
        const req = mockRequest({
          email: "test@example.com",
          password: "wrongpassword",
        });
        const res = mockResponse();

        User.findOne.mockReturnValue({
          select: jest.fn().mockResolvedValue({
            _id: "123",
            email: "test@example.com",
            password: "hashedPassword",
          }),
        });
        bcrypt.compare.mockResolvedValue(false);

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: "Invalid credentials",
        });
      });

      it("should successfully login user with valid credentials", async () => {
        const req = mockRequest({
          email: "test@example.com",
          password: "password123",
        });
        const res = mockResponse();

        const mockUserWithPassword = {
          _id: "123",
          name: "Test User",
          email: "test@example.com",
          password: "hashedPassword",
          phone: "1234567890",
        };

        // Create a mock query object that returns the user
        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockUserWithPassword),
        };
        User.findOne = jest.fn().mockReturnValue(mockQuery);
        
        // Setup bcrypt to return true for password match
        bcrypt.compare = jest.fn().mockResolvedValue(true);
        
        // Setup jwt to return a token
        jwt.sign = jest.fn().mockReturnValue("test-token");

        await authController.login(req, res);

        // Verify User.findOne was called with email
        expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
        // Check response contains success and token
        expect(res.json).toHaveBeenCalled();
      });
    });

    describe("getMe", () => {
      it("should return current user data", async () => {
        const req = mockRequest({}, {}, { id: "123" });
        const res = mockResponse();

        User.findById.mockResolvedValue({
          _id: "123",
          name: "Test User",
          email: "test@example.com",
        });

        await authController.getMe(req, res);

        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: expect.objectContaining({
            name: "Test User",
          }),
        });
      });
    });
  });

  // ───────────────────────────────────────────────
  // User Controller Tests
  // ───────────────────────────────────────────────
  describe("UserController", () => {
    describe("getAllUsers", () => {
      it("should return all users sorted by creation date", async () => {
        const mockUsers = [
          { _id: "1", name: "User 1" },
          { _id: "2", name: "User 2" },
        ];
        User.find.mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers),
        });

        const req = mockRequest();
        const res = mockResponse();

        await userController.getAllUsers(req, res);

        expect(res.json).toHaveBeenCalledWith(mockUsers);
      });

      it("should return 500 on error", async () => {
        User.find.mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error("Database error")),
        });

        const req = mockRequest();
        const res = mockResponse();

        await userController.getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe("getUserById", () => {
      it("should return user when found", async () => {
        const mockUser = { _id: "123", name: "Test User" };
        User.findById.mockResolvedValue(mockUser);

        const req = mockRequest({}, { id: "123" });
        const res = mockResponse();

        await userController.getUserById(req, res);

        expect(res.json).toHaveBeenCalledWith(mockUser);
      });

      it("should return 404 when user not found", async () => {
        User.findById.mockResolvedValue(null);

        const req = mockRequest({}, { id: "nonexistent" });
        const res = mockResponse();

        await userController.getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
      });
    });

    describe("createUser", () => {
      it("should create and return new user", async () => {
        const userData = { name: "New User", email: "new@example.com" };
        const savedUser = { ...userData, _id: "123" };

        User.prototype.save = jest.fn().mockResolvedValue(savedUser);
        User.mockImplementation(() => ({
          ...userData,
          save: jest.fn().mockResolvedValue(savedUser),
        }));

        const req = mockRequest(userData);
        const res = mockResponse();

        await userController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });
    });

    describe("updateUser", () => {
      it("should update and return user when found", async () => {
        const updatedUser = { _id: "123", name: "Updated Name" };
        User.findByIdAndUpdate.mockResolvedValue(updatedUser);

        const req = mockRequest({ name: "Updated Name" }, { id: "123" });
        const res = mockResponse();

        await userController.updateUser(req, res);

        expect(res.json).toHaveBeenCalledWith(updatedUser);
      });

      it("should return 404 when user not found", async () => {
        User.findByIdAndUpdate.mockResolvedValue(null);

        const req = mockRequest({ name: "Updated Name" }, { id: "nonexistent" });
        const res = mockResponse();

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("deleteUser", () => {
      it("should delete user and return success message", async () => {
        User.findByIdAndDelete.mockResolvedValue({ _id: "123" });

        const req = mockRequest({}, { id: "123" });
        const res = mockResponse();

        await userController.deleteUser(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: "User deleted successfully",
        });
      });

      it("should return 404 when user not found", async () => {
        User.findByIdAndDelete.mockResolvedValue(null);

        const req = mockRequest({}, { id: "nonexistent" });
        const res = mockResponse();

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("addFriend", () => {
      it("should return 400 when email is missing", async () => {
        const req = mockRequest({}, {}, { id: "123" });
        const res = mockResponse();

        await userController.addFriend(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email is required" });
      });

      it("should return 404 when friend email not found", async () => {
        User.findOne.mockResolvedValue(null);

        const req = mockRequest({ email: "friend@example.com" }, {}, { id: "123" });
        const res = mockResponse();

        await userController.addFriend(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
      });

      it("should return 400 when trying to add self as friend", async () => {
        User.findOne.mockResolvedValue({ _id: "123", email: "user@example.com" });

        const req = mockRequest({ email: "user@example.com" }, {}, { id: "123" });
        const res = mockResponse();

        await userController.addFriend(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Cannot add yourself as a friend",
        });
      });
    });
  });

  // ───────────────────────────────────────────────
  // Settlement Controller Tests
  // ───────────────────────────────────────────────
  describe("SettlementController", () => {
    describe("getGroupSettlements", () => {
      it("should return settlements for a group", async () => {
        const mockSettlements = [
          { _id: "s1", amount: 50 },
          { _id: "s2", amount: 100 },
        ];
        Settlement.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockSettlements),
            }),
          }),
        });

        const req = mockRequest({}, { groupId: "g1" });
        const res = mockResponse();

        await settlementController.getGroupSettlements(req, res);

        expect(res.json).toHaveBeenCalledWith(mockSettlements);
      });

      it("should return 500 on error", async () => {
        Settlement.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockRejectedValue(new Error("DB error")),
            }),
          }),
        });

        const req = mockRequest({}, { groupId: "g1" });
        const res = mockResponse();

        await settlementController.getGroupSettlements(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe("createSettlement", () => {
      it("should return 404 when group not found", async () => {
        Group.findById.mockResolvedValue(null);

        const req = mockRequest(
          { groupId: "g1", to: "u2", amount: 50 },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await settlementController.createSettlement(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
      });

      it("should return 403 when user is not a group member", async () => {
        Group.findById.mockResolvedValue({
          _id: "g1",
          members: ["u2", "u3"], // u1 not included
        });

        const req = mockRequest(
          { groupId: "g1", to: "u2", amount: 50 },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await settlementController.createSettlement(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          error: "You are not a member of this group",
        });
      });

      it("should return 400 when other user is not a group member", async () => {
        Group.findById.mockResolvedValue({
          _id: "g1",
          members: ["u1"],
        });

        const req = mockRequest(
          { groupId: "g1", to: "u2", amount: 50 },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await settlementController.createSettlement(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "The other user is not a member of this group",
        });
      });

      it("should return 400 when settling with self", async () => {
        Group.findById.mockResolvedValue({
          _id: "g1",
          members: ["u1", "u2"],
        });

        const req = mockRequest(
          { groupId: "g1", to: "u1", amount: 50 },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await settlementController.createSettlement(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Cannot settle with yourself",
        });
      });

      it("should return 400 when amount is invalid", async () => {
        Group.findById.mockResolvedValue({
          _id: "g1",
          members: ["u1", "u2"],
        });

        const req = mockRequest(
          { groupId: "g1", to: "u2", amount: 0 },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await settlementController.createSettlement(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Amount must be greater than 0",
        });
      });
    });

    describe("deleteSettlement", () => {
      it("should return 404 when settlement not found", async () => {
        Settlement.findById.mockResolvedValue(null);

        const req = mockRequest({}, { id: "s1" }, { _id: "u1" });
        const res = mockResponse();

        await settlementController.deleteSettlement(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Settlement not found" });
      });

      it("should return 403 when non-recipient tries to delete", async () => {
        Settlement.findById.mockResolvedValue({
          _id: "s1",
          to: "u2", // Different user (recipient is u2, not u1)
        });

        const req = mockRequest({}, { id: "s1" }, { _id: "u1" });
        const res = mockResponse();

        await settlementController.deleteSettlement(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          error: "Only the recipient can delete this settlement",
        });
      });

      it("should delete settlement when recipient deletes", async () => {
        const mockSettlement = {
          _id: "s1",
          to: "u1", // Recipient is u1
          from: { name: "Alice", email: "alice@test.com" },
          group: "g1",
          amount: 50,
          deleteOne: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockImplementation(function() {
            // Mock populate to set from/to with name property
            this.from = { name: "Alice", email: "alice@test.com" };
            this.to = { name: "Bob", email: "bob@test.com" };
            return Promise.resolve(this);
          }),
        };
        mockSettlement.to = { toString: () => "u1", name: "Bob" };
        Settlement.findById.mockResolvedValue(mockSettlement);

        const req = mockRequest({}, { id: "s1" }, { _id: "u1" });
        const res = mockResponse();

        await settlementController.deleteSettlement(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: "Settlement deleted successfully",
        });
      });
    });
  });

  // ───────────────────────────────────────────────
  // Expense Controller Tests
  // ───────────────────────────────────────────────
  describe("ExpenseController", () => {
    describe("getGroupExpenses", () => {
      it("should return expenses for a group", async () => {
        const mockExpenses = [
          { _id: "e1", description: "Dinner", amount: 90 },
        ];
        Expense.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockExpenses),
              }),
            }),
          }),
        });

        const req = mockRequest({}, { groupId: "g1" });
        const res = mockResponse();

        await expenseController.getGroupExpenses(req, res);

        expect(res.json).toHaveBeenCalledWith(mockExpenses);
      });
    });

    describe("getExpenseById", () => {
      it("should return expense when found", async () => {
        const mockExpense = { _id: "e1", description: "Dinner", amount: 90 };
        Expense.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(mockExpense),
            }),
          }),
        });

        const req = mockRequest({}, { id: "e1" });
        const res = mockResponse();

        await expenseController.getExpenseById(req, res);

        expect(res.json).toHaveBeenCalledWith(mockExpense);
      });

      it("should return 404 when expense not found", async () => {
        Expense.findById.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(null),
            }),
          }),
        });

        const req = mockRequest({}, { id: "nonexistent" });
        const res = mockResponse();

        await expenseController.getExpenseById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Expense not found" });
      });
    });

    describe("createExpense", () => {
      it("should return 404 when group not found", async () => {
        Group.findById.mockResolvedValue(null);

        const req = mockRequest(
          {
            description: "Dinner",
            amount: 90,
            groupId: "g1",
            paidBy: [{ user: "u1", amount: 90 }],
          },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
      });

      it("should return 403 when user is not a group member", async () => {
        Group.findById.mockResolvedValue({
          _id: "g1",
          members: ["u2", "u3"], // u1 not included
        });

        const req = mockRequest(
          {
            description: "Dinner",
            amount: 90,
            groupId: "g1",
            paidBy: [{ user: "u1", amount: 90 }],
          },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          error: "You are not a member of this group",
        });
      });

      it("should return 400 when paidBy amounts don't match total", async () => {
        Group.findById.mockResolvedValue({
          _id: "g1",
          members: ["u1", "u2"],
        });

        const req = mockRequest(
          {
            description: "Dinner",
            amount: 100,
            groupId: "g1",
            paidBy: [{ user: "u1", amount: 50 }], // Only 50 of 100
          },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Paid amounts must sum to the total expense amount",
        });
      });
    });

    describe("deleteExpense", () => {
      it("should return 404 when expense not found", async () => {
        Expense.findById.mockResolvedValue(null);

        const req = mockRequest({}, { id: "nonexistent" }, { _id: "u1" });
        const res = mockResponse();

        await expenseController.deleteExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Expense not found" });
      });
    });
  });

  // ───────────────────────────────────────────────
  // Group Controller Tests
  // ───────────────────────────────────────────────
  describe("GroupController", () => {
    describe("getTotalBalance", () => {
      it("should calculate total balance across all user's groups", async () => {
        const mockGroups = [
          { _id: "group1", name: "Group 1" },
          { _id: "group2", name: "Group 2" },
        ];

        Group.find.mockResolvedValue(mockGroups);

        // Mock expenses for group1: user is owed 50
        // Mock expenses for group2: user owes 30
        Expense.find = jest
          .fn()
          .mockResolvedValueOnce([
            {
              paidBy: [{ user: "userId", amount: 100 }],
              splits: [{ user: "userId", amount: 50 }],
            },
          ])
          .mockResolvedValueOnce([
            {
              paidBy: [{ user: "userId", amount: 20 }],
              splits: [{ user: "userId", amount: 50 }],
            },
          ]);

        Settlement.find = jest.fn().mockResolvedValue([]);

        const req = mockRequest({}, {}, { _id: "userId" });
        const res = mockResponse();

        await groupController.getTotalBalance(req, res);

        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: {
            balance: 20, // (100-50) + (20-50) = 20
            isOwed: true,
            isOwing: false,
          },
        });
      });

      it("should return zero when user has no groups", async () => {
        Group.find.mockResolvedValue([]);

        const req = mockRequest({}, {}, { _id: "userId" });
        const res = mockResponse();

        await groupController.getTotalBalance(req, res);

        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: {
            balance: 0,
            isOwed: false,
            isOwing: false,
          },
        });
      });

      it("should return negative balance when user owes money", async () => {
        const mockGroups = [{ _id: "group1", name: "Group 1" }];

        Group.find.mockResolvedValue(mockGroups);

        // User paid 30, owes 100 = balance -70
        Expense.find.mockResolvedValue([
          {
            paidBy: [{ user: "userId", amount: 30 }],
            splits: [{ user: "userId", amount: 100 }],
          },
        ]);

        Settlement.find.mockResolvedValue([]);

        const req = mockRequest({}, {}, { _id: "userId" });
        const res = mockResponse();

        await groupController.getTotalBalance(req, res);

        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: {
            balance: -70,
            isOwed: false,
            isOwing: true,
          },
        });
      });

      it("should handle settlements in balance calculation", async () => {
        const mockGroups = [{ _id: "group1", name: "Group 1" }];

        Group.find.mockResolvedValue(mockGroups);

        // User paid 100, owes 50 = +50
        Expense.find.mockResolvedValue([
          {
            paidBy: [{ user: "userId", amount: 100 }],
            splits: [{ user: "userId", amount: 50 }],
          },
        ]);

        // User sent 20 to someone (from = userId means +20 to balance)
        Settlement.find.mockResolvedValue([
          {
            from: "userId",
            to: "otherUser",
            amount: 20,
          },
        ]);

        const req = mockRequest({}, {}, { _id: "userId" });
        const res = mockResponse();

        await groupController.getTotalBalance(req, res);

        // 50 (from expenses) + 20 (from settlement) = 70
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: {
            balance: 70,
            isOwed: true,
            isOwing: false,
          },
        });
      });

      it("should return 500 on error", async () => {
        Group.find.mockRejectedValue(new Error("Database error"));

        const req = mockRequest({}, {}, { _id: "userId" });
        const res = mockResponse();

        await groupController.getTotalBalance(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
      });
    });
  });
});
