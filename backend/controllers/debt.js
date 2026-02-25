import Debt from '../models/Debt.js';

const addDebt = async (req, res) => {
    try {
        const { userId, name, description, amount, startDate, endDate, walletOfPayment, typeOfDebt, interestRate, dueDate } = req.body;
        const newDebt = new Debt({
            user: userId,
            name,
            description,
            amount,
            startDate,
            endDate,
            walletOfPayment,
            typeOfDebt,
            interestRate,
            dueDate,
        });
        const savedDebt = await newDebt.save();
        res.status(201).json(savedDebt);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding debt", error });
    }
};

const getDebts = async (req, res) => {
    try {
        const { userId } = req.params;
        const debts = await Debt.find({ user: userId });
        res.status(200).json(debts);
    }   
    catch (error) {
        res.status(500).json({ message: "Error fetching debts", error });
    }
};

const deleteDebt = async (req, res) => {
    try {
        const { debtId } = req.params;
        await Debt.findByIdAndDelete(debtId);
        res.status(200).json({ message: "Debt deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting debt", error });
    }
};

const updateDebt = async (req, res) => {
    try {
        const { debtId } = req.params;
        const { endDate, walletOfPayment } = req.body;
        const updatedDebt = await Debt.findByIdAndUpdate(
            debtId,
            { endDate, walletOfPayment },
            { new: true }
        );
        res.status(200).json(updatedDebt);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating debt", error });
    }
};

export { addDebt, getDebts, deleteDebt, updateDebt };