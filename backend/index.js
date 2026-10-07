import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser & CORS Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);

// Base Health-check Route
app.get('/', (req, res) => {
  res.send('Disaster Early Warning System API is running...');
});

// Global Error Handler (must be LAST middleware)
// Express 5 passes async errors here automatically
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err.stack || err.message);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});