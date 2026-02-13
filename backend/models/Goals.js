import mongoose from 'mongoose';
const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    targetAmount: {
        type: Number,
        required: true,
    },
    targetDate: {
        type: Date,
        required: true,
    },
    currentAmount: {
        type: Number,
        required: true,
    },
}, { timestamps: true });