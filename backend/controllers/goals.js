import Goal from '../models/Goals.js';

const addGoal = async (req, res) => {
    try {
        const { userId, name, targetAmount, targetDate, currentAmount, deadline } = req.body;
        const newGoal = new Goal({
            user: userId,
            name,
            targetAmount,   
            targetDate,
            currentAmount,
        }); 
        const savedGoal = await newGoal.save();
        res.status(201).json(savedGoal);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding goal", error });
    }   
};

const getGoals = async (req, res) => {
    try {
        const { userId } = req.params;
        const goals = await Goal.find({ user: userId });
        res.status(200).json(goals);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching goals", error });
    }
};

const deleteGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        await Goal.findByIdAndDelete(goalId);
        res.status(200).json({ message: "Goal deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting goal", error });
    }
};

const updateGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { targetAmount, targetDate, currentAmount, name } = req.body;
        const updatedGoal = await Goal.findByIdAndUpdate(
            goalId,
            { targetAmount, targetDate, currentAmount, name },
            { new: true }
        );
        res.status(200).json(updatedGoal);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating goal", error });
    }
};

export { addGoal, getGoals, deleteGoal, updateGoal };
