import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    },
    amount: {   
    type: Number,
    required: true,
},
usedAmount: {
    type: Number,
    required: true,
},
category: {
    type: String,
    required: true,
},
periodOfReoccurence: {
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    type: String,
    required: true,
},
}, { timestamps: true });