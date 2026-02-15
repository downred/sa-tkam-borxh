# saTkamBorxh

A solo expense tracking application built with Vue.js and Express.js following the MVC architecture.

## 🏗️ Project Structure

```
/saTkamBorxh
├── /client                    # Vue.js Frontend (View)
│   ├── /src
│   │   ├── App.vue           # Main Vue component
│   │   └── main.js           # Application entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── /server                    # Express Backend (Controller & Model)
│   ├── /config
│   │   └── database.js       # MongoDB configuration
│   ├── /controllers
│   │   └── expenseController.js
│   ├── /models
│   │   └── Expense.js        # Mongoose model
│   ├── /routes
│   │   └── expenseRoutes.js
│   ├── index.js              # Server entry point
│   ├── .env                  # Environment variables
│   └── package.json
│
├── /tests                     # Testing Suite
│   ├── /unit                 # Unit tests
│   └── /integration          # Integration tests
│
├── jest.config.js            # Jest configuration
├── package.json              # Root package.json for tests
└── README.md
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## 🚀 Installation

### 1. Install Client Dependencies

```bash
cd client
npm install
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Testing Dependencies

```bash
npm install
```

## ⚙️ Configuration

### Server Configuration

Edit `server/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/saTkamBorxh
NODE_ENV=development
```

## 🎯 Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Run Backend Server

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

### Run Frontend Client

```bash
cd client
npm run dev
```

Client will run on `http://localhost:3000`

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage report
npm run test:coverage
```

## 🏛️ MVC Architecture

- **Model** (`/server/models`): Data structure and database schema
- **View** (`/client/src`): User interface components
- **Controller** (`/server/controllers`): Business logic and request handling

## 📚 API Endpoints

- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3, Vite
- **Backend**: Express.js, Node.js
- **Database**: MongoDB, Mongoose
- **Testing**: Jest, Supertest

## 📝 Development Scripts

### Client

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server

- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

ISC
