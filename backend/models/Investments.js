import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    date: { 
    type: Date,
    required: true,
  },
  DateOfMaturity: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const Investments = mongoose.model("Investment", investmentSchema);
export default Investments;