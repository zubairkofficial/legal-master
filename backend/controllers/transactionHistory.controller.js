import { TransactionHistory, SubscriptionPlan } from "../models/index.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class TransactionHistoryController {
  // Fetch payment history for logged-in user
  static async getMyTransactions(req, res) {
    try {
      const userId = req.user.id;

      const transactions = await TransactionHistory.findAll({
        where: { userId },
        include: [{ model: SubscriptionPlan, as: "plan" }],
        order: [["transactionDate", "DESC"]],
      });

      const formatted = transactions.map((tx) => ({
        id: tx.id,
        plan: tx.plan
          ? {
              id: tx.plan.id,
              name: tx.plan.name,
              price: tx.plan.price,
              interval: tx.plan.interval,
            }
          : null,
        amount: tx.amount,
        currency: tx.currency.toUpperCase(),
        status: tx.status,
        description: tx.description,
        transactionDate: tx.transactionDate,
        card: {
          brand: tx.cardBrand || "Unavailable",
          last4: tx.cardLast4 || "Unavailable",
        },
        receiptUrl: tx.receiptUrl || null,
      }));

      res.status(200).json({ transactions: formatted });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  }

  // Save a transaction after payment succeeds
  static async saveTransaction(paymentIntentId, userId, planId, description) {
    try {
      // Retrieve details from Stripe and expand card details
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ["charges.data.payment_method_details"],
      });

      let cardBrand = null;
      let cardLast4 = null;

      const charge = paymentIntent.charges?.data?.[0];
      if (charge?.payment_method_details?.card) {
        cardBrand = charge.payment_method_details.card.brand;
        cardLast4 = charge.payment_method_details.card.last4;
      }

      // Fallback: fetch PaymentMethod if card info is missing
      if ((!cardBrand || !cardLast4) && paymentIntent.payment_method) {
        const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
        if (pm?.card) {
          cardBrand = pm.card.brand;
          cardLast4 = pm.card.last4;
        }
      }

      await TransactionHistory.create({
        userId,
        planId,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        description: description || `Subscription to ${planId}`,
        cardBrand: cardBrand || null,
        cardLast4: cardLast4 || null,
        receiptUrl: charge?.receipt_url || null,
        transactionDate: new Date(),
      });

      console.log("Transaction saved successfully");
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  }
}

export default TransactionHistoryController;
