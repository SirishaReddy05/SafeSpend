import express from 'express';
import { addDebt, getDebts, deleteDebt, updateDebt } from '../controllers/debt.js';

const router = express.Router();

router.post('/addDebt', addDebt);
router.get('/getDebts/:userId', getDebts);
router.delete('/deleteDebt/:debtId', deleteDebt);
router.put('/updateDebt/:debtId', updateDebt);

export default router;
