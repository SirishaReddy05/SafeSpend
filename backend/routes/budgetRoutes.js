import express from 'express';
import { addBudget, getBudgets, deleteBudget, updateBudget } from '../controllers/budget.js'; 

const router = express.Router();

router.post('/addBudget', addBudget);
router.get('/getBudgets/:userId', getBudgets);
router.delete('/deleteBudget/:budgetId', deleteBudget);
router.put('/updateBudget/:budgetId', updateBudget);

export default router;