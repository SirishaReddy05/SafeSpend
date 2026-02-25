import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import budgetRoutes from './routes/budgetRoutes.js';
import debtRoutes from './routes/debtRoutes.js';
import goalsRoutes from './routes/goalsRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import { connectDB } from './config/db.js';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api/users', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/debt', debtRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/wallet', walletRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
