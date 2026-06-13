import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import budgetRoutes from './routes/budgetRoutes.js';
import debtRoutes from './routes/debtRoutes.js';
import goalsRoutes from './routes/goalsRoutes.js';
import investmentsRoutes from './routes/investmentsRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import pythonEngineRoutes from './routes/pythonEngineRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import { connectDB } from './config/db.js';
import cors from 'cors';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_URLS ?? 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '25mb' }));
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/users', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/debt', debtRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/python', pythonEngineRoutes);
app.use('/api/agent', geminiRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
