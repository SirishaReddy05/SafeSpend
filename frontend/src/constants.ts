import type { Notification } from "./types";

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Large Deposit Received",
    message: "You received a deposit of $2,750.00 to your main wallet.",
    timestamp: "Today, 10:30 AM",
    type: "success",
    read: false,
  },
  {
    id: "2",
    title: "Monthly Budget Alert",
    message: 'Your "Dining Out" budget is at 85% of its limit for this month.',
    timestamp: "Yesterday, 3:45 PM",
    type: "alert",
    read: false,
  },
  {
    id: "3",
    title: "Bill Payment Reminder",
    message: "Your electricity bill is due in 3 days. Set up autopay to avoid late fees.",
    timestamp: "Mar 24, 2026",
    type: "transaction",
    read: true,
  },
  {
    id: "4",
    title: "Savings Goal Achieved",
    message: 'Congratulations! You reached your "Emergency Fund" goal of $10,000.',
    timestamp: "Mar 19, 2026",
    type: "success",
    read: true,
  },
];
