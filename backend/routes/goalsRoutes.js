import express from 'express';
import { addGoal, getGoals, deleteGoal, updateGoal } from '../controllers/goals.js';

const router = express.Router();

router.post('/addGoal', addGoal);
router.get('/getGoals/:userId', getGoals);
router.delete('/deleteGoal/:goalId', deleteGoal);
router.put('/updateGoal/:goalId', updateGoal);

export default router;