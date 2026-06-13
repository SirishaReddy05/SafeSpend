import Savings from '../models/Savings.js';

const addSavings = async (req, res) => {
    try {
        const { userId, amount, date } = req.body;
        const newSavings = new Savings({
            userId,
            amount,
            date,
        });
        const savedSavings = await newSavings.save();
        res.status(201).json(savedSavings);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding savings", error });
    }
};

const getSavings = async (req, res) => {
    try {
        const { userId } = req.params;
        const savings = await Savings.find({ userId });
        res.status(200).json(savings);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching savings", error });
    }
};

const deleteSavings = async (req, res) => {
    try {
        const { savingsId } = req.params;
        await Savings.findByIdAndDelete(savingsId);
        res.status(200).json({ message: "Savings deleted successfully" });
    }   
    catch (error) {
        res.status(500).json({ message: "Error deleting savings", error });
    }
};

const updateSavings = async (req, res) => { 
    try {
        const { savingsId } = req.params;
        const { amount} = req.body;  
        const updatedSavings = await Savings.findByIdAndUpdate(
            savingsId,
            { amount},   
            { new: true }
        );
        res.status(200).json(updatedSavings);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating savings", error });
    }
};

export { addSavings, getSavings, deleteSavings, updateSavings };
