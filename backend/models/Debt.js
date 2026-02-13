import mongoose from "mongoose";

const debtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,   
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
    amount: {
    type: Number,
    required: true,
},
startDate: {
    type: Date,
    required: true,
},
endDate: {
    type: Date,
    required: true,
},
walletOfPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
},
typeOfDebt: {
    enum: ['payable', 'receivable'],
    type: String,
    required: true,
},
interestRate: {
    type: Number,
    required: true,
},
remainingAmount: {
    type: Number,
    required: true,
},
dueDate: {
    type: Date,
    required: true,
},
}, { timestamps: true });

const Debt = mongoose.model("Debt", debtSchema);

