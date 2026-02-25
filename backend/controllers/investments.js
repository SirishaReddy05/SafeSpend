import investments from '../models/Investments.js';

const addInvestment = async (req, res) => {
    try {
        const { userId, name, amount, date, maturityDate } = req.body;
        const newInvestment = new investments({
            userId,
            name,
            amount,
            date,
            maturityDate,
        });
        const savedInvestment = await newInvestment.save();
        res.status(201).json(savedInvestment);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding investment", error });
    }
};

const getInvestments = async (req, res) => {
    try {
        const { userId } = req.params;
        const investmentsList = await investments.find({ userId });
        res.status(200).json(investmentsList);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching investments", error });
    }
};

const deleteInvestment = async (req, res) => {
    try {
        const { id } = req.params;
        await investments.findByIdAndDelete(id);
        res.status(200).json({ message: "Investment deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting investment", error });
    }
};

const updateInvestment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, maturityDate } = req.body;
        const updatedInvestment = await investments.findByIdAndUpdate(
            id,
            { amount, maturityDate },
            { new: true }
        );
        res.status(200).json(updatedInvestment);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating investment", error });
    }
};  

export { addInvestment, getInvestments, deleteInvestment, updateInvestment };