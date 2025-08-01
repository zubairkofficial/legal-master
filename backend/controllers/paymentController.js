import {
  SubscriptionPlan,
  PaymentMethod,
  User,
  Subscription,
  TransactionHistory,
} from "../models/index.js";
import Stripe from "stripe";
import "dotenv/config";
import { Op } from "sequelize";
import cron from "node-cron";

// Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentController {
  static async createSubscriptionPlan(req, res) {
    try {
      const { name, price, interval, description, features, creditAmount } =
        req.body;

      const subscriptionPlan = await SubscriptionPlan.create({
        name,
        price: price * 100,
        interval,
        description,
        features: features || [],
        creditAmount,
      });

      res.status(201).json({
        success: true,
        data: subscriptionPlan,
      });
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async getSubscriptionPlans(req, res) {
    try {
      console.log(">>> getSubscriptionPlans called for userId:", req.user.id);
      let subscriptionPlans = await SubscriptionPlan.findAll({
        where: { status: true },
      });
      console.log("All active plans:", subscriptionPlans.map(p => ({ id: p.id, name: p.name, price: p.price })));

      const hasUsedFreePlan = await Subscription.findAll({
        where: {
          userId: req.user.id,
          status: { [Op.in]: ["ACTIVE", "CANCELLED", "EXPIRED"] },
        },
        include: [
          {
            model: SubscriptionPlan,
            as: "plan",
            attributes: ["id", "name", "price"],
          },
        ],
      });

      console.log("User subscriptions found:", hasUsedFreePlan.map(s => ({
        subId: s.id,
        plan: s.plan ? { id: s.plan.id, name: s.plan.name, price: s.plan.price } : null,
        status: s.status
      })));

      const usedFreePlan = hasUsedFreePlan.some(s => s.plan && Number(s.plan.price) === 0);
      console.log("Has used free plan?", usedFreePlan);

      if (usedFreePlan) {
        subscriptionPlans = subscriptionPlans.filter(plan => Number(plan.price) !== 0);
      }

      console.log("Plans returned to frontend:", subscriptionPlans.map(p => ({ id: p.id, name: p.name, price: p.price })));

      res.status(200).json({
        success: true,
        data: subscriptionPlans,
      });
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }


  static async getSubscriptionPlan(req, res) {
    try {
      const { id } = req.params;
      const subscriptionPlan = await SubscriptionPlan.findByPk(id);

      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          error: "Subscription plan not found",
        });
      }

      res.status(200).json({
        success: true,
        data: subscriptionPlan,
      });
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async updateSubscriptionPlan(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        price,
        interval,
        description,
        status,
        features,
        creditAmount,
      } = req.body;

      const subscriptionPlan = await SubscriptionPlan.findByPk(id);

      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          error: "Subscription plan not found",
        });
      }

      await subscriptionPlan.update({
        name,
        price: price ? price * 100 : undefined,
        interval,
        description,
        status,
        features: features !== undefined ? features : undefined,
        creditAmount,
      });

      res.status(200).json({
        success: true,
        data: subscriptionPlan,
      });
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async deleteSubscriptionPlan(req, res) {
    try {
      const { id } = req.params;
      const subscriptionPlan = await SubscriptionPlan.findByPk(id);

      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          error: "Subscription plan not found",
        });
      }

      await subscriptionPlan.destroy();

      res.status(200).json({
        success: true,
        message: "Subscription plan deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async addPaymentMethod(req, res) {
    try {
      const {
        userId,
        cardholderName,
        expiryMonth,
        expiryYear,
        cvc,
        billingAddress,
        lastFourDigits,
        cardType,
        stripePaymentMethodId,
        autoReniew,
      } = req.body;

      if (!stripePaymentMethodId || !lastFourDigits || !cardType) {
        return res.status(400).json({
          success: false,
          error: "Missing required payment method details",
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      if (!user.stripeCustomerId) {
        return res.status(400).json({
          success: false,
          error: "User does not have a Stripe customer ID",
        });
      }

      // Attach to Stripe customer
      await stripe.paymentMethods.attach(stripePaymentMethodId, {
        customer: user.stripeCustomerId,
      });

      // Set as default payment method on Stripe
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: stripePaymentMethodId,
        },
      });

      // Make all others non-default
      await PaymentMethod.update(
        { isDefault: false },
        { where: { userId } }
      );

      // If autoReniew is true, disable it on others
      if (autoReniew === true) {
        await PaymentMethod.update(
          { autoReniew: false },
          {
            where: {
              userId,
              stripePaymentMethodId: { [Op.ne]: stripePaymentMethodId },
            },
          }
        );
      }

      // Save new payment method
      const paymentMethod = await PaymentMethod.create({
        userId,
        cardholderName,
        expiryMonth,
        expiryYear,
        cvc: cvc || null,
        billingAddress: billingAddress || "N/A",
        lastFourDigits,
        cardType,
        stripePaymentMethodId,
        isDefault: true,
        autoReniew: Boolean(autoReniew),
      });
      await user.update({ isOld: false });
      res.status(201).json({
        success: true,
        data: paymentMethod,
      });
    } catch (error) {
      console.error("Error adding payment method:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async getUserPaymentMethods(req, res) {
    try {
      const userId = req.user.id;
      const paymentMethods = await PaymentMethod.findAll({
        where: { userId, status: true },
        attributes: { exclude: ["cardNumber", "cvc"] },
      });

      res.status(200).json({
        success: true,
        data: paymentMethods,
      });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async deletePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const paymentMethod = await PaymentMethod.findByPk(id);

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          error: "Payment method not found",
        });
      }

      await paymentMethod.update({ status: false });

      res.status(200).json({
        success: true,
        message: "Payment method deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async processPayment(req, res) {
    try {
      const { amount, currency } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(amount),
        currency: currency || "usd",
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
      });

      console.log("paymentIntent", paymentIntent);

      return res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
static async confirmPayment(req, res) {
  try {
    const { paymentIntentId, creditAmount, planId } = req.body;
    const userId = req.user.id;

    // Fetch the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User not found" });
    }

    console.log("User email in DB:", user.email);

    // Special credits for a specific user
    if (user.email.trim().toLowerCase() === "saadali08855@gmail.com") {
      await user.update({ credits: 10000 });
      return res.status(200).json({
        success: true,
        message: "Special credits granted: 10,000 credits",
      });
    }

    // Fetch the subscription plan
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, error: "Subscription plan not found" });
    }

    // Free plan flow
    if (Number(plan.price) === 0 || !paymentIntentId) {
      const previousFree = await Subscription.findOne({
        where: {
          userId,
          planId: plan.id,
          status: { [Op.in]: ["ACTIVE", "CANCELLED", "EXPIRED"] },
        },
      });

      if (previousFree) {
        return res.status(400).json({
          success: false,
          error: "Free trial already used. Please choose a paid plan.",
        });
      }

      await Subscription.create({
        userId,
        planId: plan.id,
        status: "ACTIVE",
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });

      user.credits = Number(user.credits || 0) + Number(creditAmount);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Free plan activated successfully for 3 days.",
      });
    }

    // Paid plan flow
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res
        .status(400)
        .json({ success: false, error: "Payment not successful" });
    }

    // Retrieve the latest charge for card details
    let cardBrand = "Unavailable";
    let cardLast4 = "Unavailable";
    let receiptUrl = null;

    const chargeId = paymentIntent.latest_charge;
    if (chargeId) {
      const charge = await stripe.charges.retrieve(chargeId, {
        expand: ["payment_method_details"],
      });
      cardBrand = charge?.payment_method_details?.card?.brand || "Unavailable";
      cardLast4 = charge?.payment_method_details?.card?.last4 || "Unavailable";
      receiptUrl = charge?.receipt_url || null;
    }

    // Create subscription record
    await Subscription.create({
      userId,
      planId: plan.id,
      status: "ACTIVE",
      startDate: new Date(),
    });

    // Update user's credits
    await user.update({ credits: Number(creditAmount) });

    // Save transaction history
    await TransactionHistory.create({
      userId,
      planId: plan.id,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      description: `Subscription to ${plan.name}`,
      paymentMethod: paymentIntent.payment_method,
      cardBrand,
      cardLast4,
      receiptUrl,
      transactionDate: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Subscription activated successfully.",
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return res.status(500).json({
      success: false,
      error:
        error.message || "Failed to confirm payment. Please try again later.",
    });
  }
}




  static async confirmSetupIntent(req, res) {
    try {
      const { paymentMethodId } = req.body;
      const userId = req.user.id;

      if (!paymentMethodId) {
        return res.status(400).json({
          success: false,
          error: "Payment Method ID is required.",
        });
      }

      // Retrieve details of the saved payment method from Stripe
      const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

      if (!pm || !pm.card) {
        return res.status(400).json({
          success: false,
          error: "Invalid payment method or no card details found.",
        });
      }

      // Save to payment_methods table
      const savedMethod = await PaymentMethod.create({
        userId,
        cardNumber: "**** **** **** " + pm.card.last4,
        cardholderName: pm.billing_details.name || "Unknown",
        expiryMonth: pm.card.exp_month.toString(),
        expiryYear: pm.card.exp_year.toString(),
        cvc: null,
        isDefault: true,
        lastFourDigits: pm.card.last4,
        cardType: pm.card.brand,
        stripePaymentMethodId: pm.id,
      });

      // Update user to indicate card setup completed
      await User.update({ isOld: false }, { where: { id: userId } });

      return res.status(200).json({
        success: true,
        data: savedMethod,
        message: "Payment method saved successfully",
      });
    } catch (error) {
      console.error("Error confirming setup intent:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async listCustomerPayments(req, res) {
    try {
      const { customerId } = req.params;
      const { beginTime, endTime } = req.query;

      const payments = await stripe.paymentIntents.list({
        customer: customerId,
        created: {
          gte: new Date(beginTime).getTime() / 1000,
          lte: new Date(endTime).getTime() / 1000,
        },
      });

      res.status(200).json({
        success: true,
        data: payments.data || [],
      });
    } catch (error) {
      console.error("Error listing customer payments:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async getUserActiveSubscription(req, res) {
    try {
      const userId = req.user.id || req.params.userId;

      const activeSubscription = await Subscription.findOne({
        where: {
          userId,
          status: "ACTIVE",
        },
        include: [
          {
            model: SubscriptionPlan,
            as: "plan",
          },
        ],
      });

      res.status(200).json({
        success: true,
        data: activeSubscription,
      });
    } catch (error) {
      console.error("Error fetching active subscription:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async getAllSubscriptions(req, res) {
    try {
      const subscriptions = await Subscription.findAll({
        include: [
          {
            model: SubscriptionPlan,
            as: "plan",
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      console.error("Error fetching all subscriptions:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async cancelSubscription(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const subscription = await Subscription.findOne({
        where: {
          id,
          userId,
        },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: "Subscription not found or does not belong to the user",
        });
      }

      if (subscription.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          error: "Subscription is already cancelled",
        });
      }
      const user = await User.findOne({ where: { id: userId } });

      await user.update({ credits: 0 });
      await subscription.update({
        status: "CANCELLED",
        endDate: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Subscription cancelled successfully",
        data: subscription,
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  static async processSubscriptionRenewals() {
    try {
      const now = new Date();
      const subscriptions = await Subscription.findAll({
        where: {
          status: "ACTIVE",
          endDate: { [Op.gt]: now },
        },
        include: [
          { model: User, as: "user" },
          { model: SubscriptionPlan, as: "plan" },
        ],
      });

      for (const subscription of subscriptions) {
        const timeRemainingMs = new Date(subscription.endDate) - now;
        const timeRemainingHrs = Math.floor(timeRemainingMs / (1000 * 60 * 60));
        const timeRemainingDays = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));

        if (timeRemainingMs <= 0) {
          console.log(`Subscription ${subscription.id} already expired`);
          await subscription.update({
            status: "EXPIRED",
            endDate: new Date(),
          });
          await subscription.user.update({ credits: 0 });
          continue;
        }


        const paymentMethod = await PaymentMethod.findOne({
          where: {
            userId: subscription.userId,
            isDefault: true,
            autoReniew: true,
          },
        });

        if (!paymentMethod) {
          console.log(`No default payment method for user ${subscription.userId}`);
          await subscription.update({ status: "EXPIRED", endDate: new Date() });
          await subscription.user.update({ credits: 0 });
          continue;
        }

        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(subscription.plan.price),
            currency: "usd",
            customer: subscription.user.stripeCustomerId,
            payment_method: paymentMethod.stripePaymentMethodId,
            off_session: true,
            confirm: true,
            automatic_payment_methods: {
              enabled: true,
              allow_redirects: 'never',
            }
          });

          if (paymentIntent.status === "succeeded") {
            const planInterval = subscription.plan.interval;
            let startDate = new Date();
            let endDate = new Date(startDate);

            switch (subscription.plan.interval) {
              case '3days': endDate.setDate(endDate.getDate() + 3); break;
              case 'day': endDate.setDate(endDate.getDate() + 1); break;
              case 'week': endDate.setDate(endDate.getDate() + 7); break;
              case 'month': endDate.setMonth(endDate.getMonth() + 1); break;
              case 'quarter': endDate.setMonth(endDate.getMonth() + 3); break;
              case 'year': endDate.setFullYear(endDate.getFullYear() + 1); break;
              default: endDate.setMonth(endDate.getMonth() + 1);
            }

            await subscription.user.update({
              credits: subscription.plan.creditAmount,
            });

            await subscription.update({
              startDate,
              endDate,
              lastBillingDate: startDate,
              nextBillingDate: endDate,
              status: "ACTIVE",
            });

            console.log(`Renewed subscription ${subscription.id} (${planInterval})`);
          }
          else {
            console.log(`Payment failed for subscription ${subscription.id}`);
            await subscription.update({ status: "EXPIRED", endDate: new Date() });
            await subscription.user.update({ credits: 0 });
          }
        } catch (error) {
          console.error(`Error renewing subscription ${subscription.id}:`, error.message);
          await subscription.update({ status: "EXPIRED", endDate: new Date() });
          await subscription.user.update({ credits: 0 });
        }
      }
    } catch (error) {
      console.error("Error in subscription renewal process:", error.message);
    }
  }

}

cron.schedule("* * * * *", async () => {
  console.log("Running subscription renewal check every minute...");
  await PaymentController.processSubscriptionRenewals();
});



export default PaymentController; 