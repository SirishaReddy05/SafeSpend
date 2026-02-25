import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "bills",
        "clothing",
        "education",
        "entertainment",
        "food",
        "gifts",
        "health",
        "furniture",
        "pet",
        "shopping",
        "transport",
        "fitness",
        "travel",
        "others",
      ],
    },

    amount: {
      type: Number,
      required: true,
    },

    period: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
  },
  { timestamps: true }
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
