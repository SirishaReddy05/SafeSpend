import express from 'express';
import { addSavings, getSavings, deleteSavings, updateSavings } from '../controllers/savings.js';

const router = express.Router();

router.post('/addSavings', addSavings);
router.get('/getSavings/:userId', getSavings);
router.delete('/deleteSavings/:savingsId', deleteSavings);
router.put('/updateSavings/:savingsId', updateSavings);

export default router;