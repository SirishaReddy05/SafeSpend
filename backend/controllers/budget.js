import Budget from "../models/Budget.js";

const addBudget = async (req, res) => {
    try {
        const { userId, name, category, amount, period } = req.body;
        const newBudget = new Budget({
            user: userId,
            name,
            category,
            amount,
            period,
        });
        const savedBudget = await newBudget.save();
        res.status(201).json(savedBudget);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding budget", error });
    }
};

const getBudgets = async (req, res) => {
    try {
        const { userId } = req.params;
        const budgets = await Budget.find({ user: userId });
        res.status(200).json(budgets);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching budgets", error });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const { budgetId } = req.params;
        await Budget.findByIdAndDelete(budgetId);
        res.status(200).json({ message: "Budget deleted successfully" });
    }   
    catch (error) {
        res.status(500).json({ message: "Error deleting budget", error });
    }
};

const updateBudget = async (req, res) => {  
    try {
        const { budgetId } = req.params;
        const { name, category, amount, period } = req.body;
        const updatedBudget = await Budget.findByIdAndUpdate(
            budgetId,
            { name, category, amount, period },
            { new: true }
        );
        res.status(200).json(updatedBudget);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating budget", error });
    }
};

export { addBudget, getBudgets, deleteBudget, updateBudget };