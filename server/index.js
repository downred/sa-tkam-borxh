const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { apiReference } = require('@scalar/express-api-reference');
require('dotenv').config();

const app = express();

const expenseRoutes = require('./routes/expenseRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const activityRoutes = require('./routes/activityRoutes');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
  
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sa-tkam-borxh';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to saTkamBorxh API' });
});

app.use('/api/auth', authRoutes);

app.use('/api', userRoutes);

app.use('/api/groups', groupRoutes);

app.use('/api', expenseRoutes);

app.use('/api', settlementRoutes);

app.use('/api/activities', activityRoutes);

app.use(
  '/api/docs',
  apiReference({
    spec: {
      url: '/openapi.json',
    },
  })
);

app.get('/openapi.json', (req, res) => {
  res.sendFile(__dirname + '/openapi.json');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
