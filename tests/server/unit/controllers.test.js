const User = require("../../../server/models/User");
const Group = require("../../../server/models/Group");
const Expense = require("../../../server/models/Expense");
const Settlement = require("../../../server/models/Settlement");
const Activity = require("../../../server/models/Activity");
const bcrypt = require("bcryptjs");

jest.mock("../../../server/models/User");
jest.mock("../../../server/models/Group");
jest.mock("../../../server/models/Expense");
jest.mock("../../../server/models/Settlement");
jest.mock("../../../server/models/Activity");
jest.mock("bcryptjs");

const jwt = require("../../../server/node_modules/jsonwebtoken");
jest.mock("../../../server/node_modules/jsonwebtoken");

const authController = require("../../../server/controllers/authController");
const userController = require("../../../server/controllers/userController");
const groupController = require("../../../server/controllers/groupController");
const expenseController = require("../../../server/controllers/expenseController");
const settlementController = require("../../../server/controllers/settlementController");

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

      
      it("should return 400 when email has no domain (EC3)", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "user@",
          password: "password123",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Please provide a valid email address",
        });
      });

      
      it("should return 400 when email is empty string (EC4)", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "",
          password: "password123",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Please provide name, email and password",
        });
      });

      
      it("should return 400 when email contains spaces (EC5)", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "user @example.com",
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

      
      it("should return 400 when password is empty string (EC8)", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "test@example.com",
          password: "",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Please provide name, email and password",
        });
      });

      
      it("should register successfully when passwords match (EC9)", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          confirmPassword: "password123",
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
        jwt.sign.mockReturnValue("token");

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should return 400 when passwords do not match (EC10)", async () => {
        const req = mockRequest({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          confirmPassword: "different123",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Passwords do not match",
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

        
        const mockQuery = {
          select: jest.fn().mockResolvedValue(mockUserWithPassword),
        };
        User.findOne = jest.fn().mockReturnValue(mockQuery);
        
        
        bcrypt.compare = jest.fn().mockResolvedValue(true);
        
        
        jwt.sign = jest.fn().mockReturnValue("test-token");

        await authController.login(req, res);

        
        expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
        
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
          members: ["u2", "u3"], 
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
          to: "u2", 
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
          to: "u1", 
          from: { name: "Alice", email: "alice@test.com" },
          group: "g1",
          amount: 50,
          deleteOne: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockImplementation(function() {
            
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
          members: ["u2", "u3"], 
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
            paidBy: [{ user: "u1", amount: 50 }], 
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

      
      it("should return 400 when amount is zero (EC12)", async () => {
        const req = mockRequest(
          { description: "Dinner", amount: 0, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Amount must be greater than 0",
        });
      });

      
      it("should return 400 when amount is negative (EC13)", async () => {
        const req = mockRequest(
          { description: "Dinner", amount: -25, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Amount must be greater than 0",
        });
      });

      
      it("should return 400 when amount is non-numeric text (EC14)", async () => {
        const req = mockRequest(
          { description: "Dinner", amount: "abc", groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Amount must be a valid number",
        });
      });

      
      it("should return 400 when amount is empty string (EC15)", async () => {
        const req = mockRequest(
          { description: "Dinner", amount: "", groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Amount is required",
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

  
  
  
  describe("GroupController", () => {
    describe("getTotalBalance", () => {
      it("should calculate total balance across all user's groups", async () => {
        const mockGroups = [
          { _id: "group1", name: "Group 1" },
          { _id: "group2", name: "Group 2" },
        ];

        Group.find.mockResolvedValue(mockGroups);

        
        
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
            balance: 20, 
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

        
        Expense.find.mockResolvedValue([
          {
            paidBy: [{ user: "userId", amount: 100 }],
            splits: [{ user: "userId", amount: 50 }],
          },
        ]);

        
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

    
    describe("createGroup", () => {
      const validGroupBody = {
        name: "Shpenzime Pushimesh",
        type: "Trip",
        members: [],
      };

      const mockCreatedGroup = {
        _id: "g1",
        name: "Shpenzime Pushimesh",
        type: "Trip",
        members: ["u1"],
        populate: jest.fn().mockResolvedValue({
          _id: "g1",
          name: "Shpenzime Pushimesh",
          type: "Trip",
          members: [{ _id: "u1", name: "Alice" }],
        }),
      };

      
      it("should create group when name and type are valid (EC19)", async () => {
        Group.create.mockResolvedValue(mockCreatedGroup);

        const req = mockRequest(validGroupBody, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should return 400 when group name is empty string (EC20)", async () => {
        const req = mockRequest({ ...validGroupBody, name: "" }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Group name is required",
        });
      });

      
      it("should return 400 when group name is whitespace only (EC21)", async () => {
        const req = mockRequest({ ...validGroupBody, name: "   " }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Group name is required",
        });
      });

      
      it("should create group with type Trip (EC22)", async () => {
        Group.create.mockResolvedValue(mockCreatedGroup);

        const req = mockRequest({ ...validGroupBody, type: "Trip" }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should create group with type Home (EC23)", async () => {
        const homeGroup = {
          ...mockCreatedGroup,
          type: "Home",
          populate: jest.fn().mockResolvedValue({
            _id: "g1",
            name: "Shpenzime Pushimesh",
            type: "Home",
            members: [{ _id: "u1", name: "Alice" }],
          }),
        };
        Group.create.mockResolvedValue(homeGroup);

        const req = mockRequest({ ...validGroupBody, type: "Home" }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should return 400 when group type is invalid (EC24)", async () => {
        const req = mockRequest(
          { ...validGroupBody, type: "InvalidType" },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Invalid group type",
        });
      });

      it("should return 400 when group type is null (EC24 - null)", async () => {
        const req = mockRequest(
          { ...validGroupBody, type: null },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Invalid group type",
        });
      });

      
      it("should return 400 for empty group name - 0 chars (BV12)", async () => {
        const req = mockRequest({ ...validGroupBody, name: "" }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      
      it("should create group with 1-char name (BV13)", async () => {
        Group.create.mockResolvedValue({
          ...mockCreatedGroup,
          name: "A",
          populate: jest.fn().mockResolvedValue({ _id: "g1", name: "A", members: [] }),
        });

        const req = mockRequest({ ...validGroupBody, name: "A" }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should create group with 2-char name (BV14)", async () => {
        Group.create.mockResolvedValue({
          ...mockCreatedGroup,
          name: "AB",
          populate: jest.fn().mockResolvedValue({ _id: "g1", name: "AB", members: [] }),
        });

        const req = mockRequest({ ...validGroupBody, name: "AB" }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should create group with 49-char name (BV15)", async () => {
        const name49 = "A".repeat(49);
        Group.create.mockResolvedValue({
          ...mockCreatedGroup,
          name: name49,
          populate: jest.fn().mockResolvedValue({ _id: "g1", name: name49, members: [] }),
        });

        const req = mockRequest({ ...validGroupBody, name: name49 }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should create group with 50-char name (BV16 - max boundary)", async () => {
        const name50 = "A".repeat(50);
        Group.create.mockResolvedValue({
          ...mockCreatedGroup,
          name: name50,
          populate: jest.fn().mockResolvedValue({ _id: "g1", name: name50, members: [] }),
        });

        const req = mockRequest({ ...validGroupBody, name: name50 }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should return 400 for group name with 51 chars (BV17 - above max)", async () => {
        const name51 = "A".repeat(51);
        const req = mockRequest({ ...validGroupBody, name: name51 }, {}, { _id: "u1" });
        const res = mockResponse();

        await groupController.createGroup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Group name cannot exceed 50 characters",
        });
      });
    });

    
    describe("addMember", () => {
      const makeGroupWithMembers = (count) => ({
        _id: "g1",
        members: Array.from({ length: count }, (_, i) => `user${i}`),
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      });

      
      it("should add member when group has 1 existing member (BV19)", async () => {
        const group = makeGroupWithMembers(1);
        Group.findById.mockResolvedValue(group);

        const req = mockRequest({ userId: "newUser" }, { id: "g1" }, { _id: "u1" });
        const res = mockResponse();

        await groupController.addMember(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: true })
        );
      });

      
      it("should add member when group has 2 existing members (BV20)", async () => {
        const group = makeGroupWithMembers(2);
        Group.findById.mockResolvedValue(group);

        const req = mockRequest({ userId: "newUser" }, { id: "g1" }, { _id: "u1" });
        const res = mockResponse();

        await groupController.addMember(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: true })
        );
      });

      
      it("should add member when group has 49 members (BV21)", async () => {
        const group = makeGroupWithMembers(49);
        Group.findById.mockResolvedValue(group);

        const req = mockRequest({ userId: "newUser" }, { id: "g1" }, { _id: "u1" });
        const res = mockResponse();

        await groupController.addMember(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: true })
        );
      });

      
      it("should return 400 when group already has 50 members (BV22)", async () => {
        const group = makeGroupWithMembers(50);
        Group.findById.mockResolvedValue(group);

        const req = mockRequest({ userId: "newUser" }, { id: "g1" }, { _id: "u1" });
        const res = mockResponse();

        await groupController.addMember(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Group has reached the maximum of 50 members",
        });
      });

      
      it("should return 400 when group has 51 members (BV23)", async () => {
        const group = makeGroupWithMembers(51);
        Group.findById.mockResolvedValue(group);

        const req = mockRequest({ userId: "newUser" }, { id: "g1" }, { _id: "u1" });
        const res = mockResponse();

        await groupController.addMember(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Group has reached the maximum of 50 members",
        });
      });
    });
  });

  
  describe("ExpenseController - additional EC & BV", () => {
    describe("createExpense - description validation", () => {
      
      it("should pass description validation with a valid description (EC16)", async () => {
        
        Group.findById.mockResolvedValue(null);

        const req = mockRequest(
          { description: "Dreka në restorant", amount: 30, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
      });

      
      it("should return 400 when description is empty string (EC17)", async () => {
        const req = mockRequest(
          { description: "", amount: 30, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Description is required",
        });
      });

      
      it("should return 400 when description is whitespace only (EC18)", async () => {
        const req = mockRequest(
          { description: "   ", amount: 30, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Description is required",
        });
      });
    });

    describe("createExpense - amount boundary values", () => {
      
      it("should return 400 for amount -1 (BV6)", async () => {
        const req = mockRequest(
          { description: "Test", amount: -1, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Amount must be greater than 0",
        });
      });

      
      it("should return 400 for amount 0 (BV7)", async () => {
        const req = mockRequest(
          { description: "Test", amount: 0, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Amount must be greater than 0",
        });
      });

      
      it("should pass amount validation for 0.01 (BV8 - minimum valid)", async () => {
        Group.findById.mockResolvedValue(null);

        const req = mockRequest(
          { description: "Test", amount: 0.01, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
      });

      
      it("should pass amount validation for 1 (BV9)", async () => {
        Group.findById.mockResolvedValue(null);

        const req = mockRequest(
          { description: "Test", amount: 1, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
      });

      
      it("should pass amount validation for 9999.99 (BV10)", async () => {
        Group.findById.mockResolvedValue(null);

        const req = mockRequest(
          { description: "Test", amount: 9999.99, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
      });

      
      it("should pass amount validation for 10000 (BV11)", async () => {
        Group.findById.mockResolvedValue(null);

        const req = mockRequest(
          { description: "Test", amount: 10000, groupId: "g1", paidBy: [] },
          {},
          { _id: "u1" }
        );
        const res = mockResponse();

        await expenseController.createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Group not found" });
      });
    });
  });

  
  describe("AuthController - password length BVA", () => {
    describe("register - password boundary values", () => {
      
      it("should return 400 for password with 4 chars (BV1)", async () => {
        const req = mockRequest({
          name: "Test",
          email: "test@example.com",
          password: "pass",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Password must be at least 6 characters",
        });
      });

      
      it("should return 400 for password with 5 chars (BV2)", async () => {
        const req = mockRequest({
          name: "Test",
          email: "test@example.com",
          password: "passw",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Password must be at least 6 characters",
        });
      });

      
      it("should accept password with exactly 6 chars (BV3 - min boundary)", async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashed");
        User.create.mockResolvedValue({ _id: "u1", name: "Test", email: "test@example.com" });
        jwt.sign.mockReturnValue("token");

        const req = mockRequest({
          name: "Test",
          email: "test@example.com",
          password: "passwo",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should accept password with 7 chars (BV4)", async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashed");
        User.create.mockResolvedValue({ _id: "u1", name: "Test", email: "test@example.com" });
        jwt.sign.mockReturnValue("token");

        const req = mockRequest({
          name: "Test",
          email: "test@example.com",
          password: "passwor",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      
      it("should accept password with 8 chars (BV5)", async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashed");
        User.create.mockResolvedValue({ _id: "u1", name: "Test", email: "test@example.com" });
        jwt.sign.mockReturnValue("token");

        const req = mockRequest({
          name: "Test",
          email: "test@example.com",
          password: "password",
        });
        const res = mockResponse();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });
    });
  });

  
  describe("UserController - addFriend email validation", () => {
    
    it("should return 400 when friend email has invalid format (EC28)", async () => {
      const req = mockRequest({ email: "not-an-email" }, {}, { id: "u1" });
      const res = mockResponse();

      await userController.addFriend(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please provide a valid email address",
      });
    });
  });
});
