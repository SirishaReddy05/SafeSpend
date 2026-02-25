import express from 'express';
import {addWallet, getWallets, deleteWallet, updateWallet} from '../controllers/wallet.js';

const router = express.Router();

router.post('/addWallet', addWallet);
router.get('/getWallets/:userId', getWallets);
router.delete('/deleteWallet/:walletId', deleteWallet);
router.put('/updateWallet/:walletId', updateWallet);

export default router;