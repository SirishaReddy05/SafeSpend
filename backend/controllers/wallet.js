import Wallet from "../models/Wallet.js";

const addWallet = async (req, res) => {
    try {
        const { userId, incomeType, amount } = req.body;

        const newWallet = new Wallet({
            user: userId,
            incomeType,
            amount,
        });
        const savedWallet = await newWallet.save();
        res.status(201).json(savedWallet);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding wallet", error });
    }
};

const getWallets = async (req, res) => {
    try {
        const { userId } = req.params;
        const wallets = await Wallet.find({ user: userId });
        res.status(200).json(wallets);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching wallets", error });
    }
};

const deleteWallet = async (req, res) => {
    try {
        const { walletId } = req.params;
        await Wallet.findByIdAndDelete(walletId);
        res.status(200).json({ message: "Wallet deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting wallet", error });
    }
};

const updateWallet = async (req, res) => {
    try {
        const { walletId } = req.params;    
        const { incomeType, amount } = req.body;
        const updatedWallet = await Wallet.findByIdAndUpdate(
            walletId,
            { incomeType, amount },
            { new: true }
        );
        res.status(200).json(updatedWallet);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating wallet", error });
    }
};

export { addWallet, getWallets, deleteWallet, updateWallet };
