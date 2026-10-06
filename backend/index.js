import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser & CORS Middleware
app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/v1/auth', authRoutes);

// Base Health-check Route
app.get('/', (req, res) => {
  res.send('Disaster Early Warning System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});