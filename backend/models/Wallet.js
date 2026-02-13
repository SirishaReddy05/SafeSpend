import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,   
    ref: "User",
    required: true,
  },
  incomeType: {
    type: String,
    required: true,
  },
    amount: {   
    type: Number,
    required: true,
},
}, { timestamps: true });

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;