import express from 'express';
import { addInvestment, getInvestments, deleteInvestment, updateInvestment } from '../controllers/investments.js';

const router = express.Router();

router.post('/addInvestment', addInvestment);
router.get('/getInvestments/:userId', getInvestments);
router.delete('/deleteInvestment/:id', deleteInvestment);
router.put('/updateInvestment/:id', updateInvestment);

export default router;