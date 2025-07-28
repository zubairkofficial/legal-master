import express from "express";
import TransactionHistoryController from "../controllers/transactionHistory.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get Stripe payment history for the logged-in user
router.get("/my", authMiddleware, TransactionHistoryController.getMyTransactions);

export default router;
