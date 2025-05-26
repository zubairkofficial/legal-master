import {
  SubscriptionPlan,
  PaymentMethod,
  User,
  Subscription,
} from "../models/index.js";
import { SquareClient, SquareEnvironment } from "square";
import "dotenv/config";
import { Op } from "sequelize";

// Use environment variables for Square credentials
const SQUARE_ACCESS_TOKEN =
  "EAAAl0fGitKOGZqZVGwydyJBV_JhGacnWSQXrm02jnMPZ8kf2FQ9DwtzUnNk3wYm";
const SQUARE_ENVIRONMENT = SquareEnvironment.Sandbox;
const SQUARE_LOCATION_ID = "LD90N71X3D44Z";

const squareClient = new SquareClient({
  environment: SQUARE_ENVIRONMENT,
  token: SQUARE_ACCESS_TOKEN,
});

class PaymentController {
  // Create a new subscription plan
  static async createSubscriptionPlan(req, res) {
    try {
      const { name, price, interval, description, features, creditAmount } =
        req.body;

      const subscriptionPlan = await SubscriptionPlan.create({
        name,
        price: price * 100, // Convert to cents
        interval,
        description,
        features: features || [],
        creditAmount, // Convert to cents if provided
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

  // Get all subscription plans
  static async getSubscriptionPlans(req, res) {
    try {
      const subscriptionPlans = await SubscriptionPlan.findAll({
        where: { status: true },
      });

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

  // Get a single subscription plan
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

  // Update a subscription plan
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
        price: price ? price * 100 : undefined, // Convert to cents if provided
        interval,
        description,
        status,
        features: features !== undefined ? features : undefined,
        creditAmount, // Convert to cents if provided
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

  // Delete a subscription plan (soft delete)
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

  // Add a new payment method
  static async addPaymentMethod(req, res) {
    try {
      const {
        userId,
        cardNumber,
        cardholderName,
        expiryMonth,
        expiryYear,
        cvc,
        billingAddress,
      } = req.body;

      // Get last 4 digits of card number
      const lastFourDigits = cardNumber.slice(-4);

      // Determine card type (basic implementation)
      const cardType = cardNumber.startsWith("4")
        ? "VISA"
        : cardNumber.startsWith("5")
        ? "MASTERCARD"
        : cardNumber.startsWith("3")
        ? "AMEX"
        : "OTHER";

      const paymentMethod = await PaymentMethod.create({
        userId,
        cardNumber,
        cardholderName,
        expiryMonth,
        expiryYear,
        cvc,
        billingAddress,
        lastFourDigits,
        cardType,
        isDefault: true, // Set as default if it's the first card
      });

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

  // Get user's payment methods
  static async getUserPaymentMethods(req, res) {
    try {
      const userId = req.user.id;
      const paymentMethods = await PaymentMethod.findAll({
        where: { userId, status: true },
        attributes: { exclude: ["cardNumber", "cvc"] }, // Don't send sensitive data
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

  // Delete a payment method (soft delete)
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

  // Process a payment using stored payment method
  static async processPayment(req, res) {
    try {
      const { amount, currency, sourceId, creditAmount, planId } = req.body;
      const userId = req.user.id;
      // Create payment using Square API
      const response = await squareClient.payments.create({
        idempotencyKey: `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}`,
        amountMoney: {
          amount: BigInt(amount / 100),
          currency: "USD",
        },
        locationId: SQUARE_LOCATION_ID,
        sourceId: "cnon:card-nonce-ok", // The payment token from Web Payments SDK
      });

      if (response.payment.status === "COMPLETED") {
        // Convert the payment object to a plain object and stringify any BigInt values
        const paymentData = JSON.parse(
          JSON.stringify(response.payment, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        );

        // Update user's credits
        const user = await User.findByPk(userId);
        user.credits += parseInt(creditAmount || 0);
        await user.save();

        // If planId is provided, create a new subscription
        if (planId) {
          // Fetch the subscription plan
          const plan = await SubscriptionPlan.findByPk(planId);

          if (!plan) {
            throw new Error("Subscription plan not found");
          }

          // Calculate expiration date based on plan interval
          let expiryDate = new Date();
          switch (plan.interval) {
            case "day":
              expiryDate.setDate(expiryDate.getDate() + 1);
              break;
            case "weekly":
              expiryDate.setDate(expiryDate.getDate() + 7);
              break;
            case "monthly":
              expiryDate.setMonth(expiryDate.getMonth() + 1);
              break;
            case "quarterly":
              expiryDate.setMonth(expiryDate.getMonth() + 3);
              break;
            case "yearly":
              expiryDate.setFullYear(expiryDate.getFullYear() + 1);
              break;
            default:
              expiryDate.setMonth(expiryDate.getMonth() + 1); // Default to monthly
          }

          // Check if there's an existing active subscription
          const existingSubscription = await Subscription.findOne({
            where: {
              userId,
              status: "ACTIVE",
            },
          });

          // If there's an existing subscription, deactivate it
          if (existingSubscription) {
            await existingSubscription.update({ status: "INACTIVE" });
          }

          // Create a new subscription
          const subscription = await Subscription.create({
            userId,
            planId,
            startDate: new Date(),
            endDate: expiryDate,
            status: "ACTIVE",
            paymentId: paymentData.id,
            amount: amount,
          });

          // Add the subscription to the response
          paymentData.subscription = subscription;
        }

        res.status(200).json({
          status: "success",
          data: paymentData,
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Payment failed",
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get payment details
  // static async getPayment(req, res) {
  //     try {
  //         const { paymentId } = req.params;

  //         const response = await squareClient.payments.getPayment(paymentId);

  //         res.status(200).json({
  //             success: true,
  //             data: response.result.payment
  //         });
  //     } catch (error) {
  //         console.error('Error fetching payment:', error);
  //         res.status(500).json({
  //             success: false,
  //             error: error.message
  //         });
  //     }
  // }

  // List all payments for a customer
  static async listCustomerPayments(req, res) {
    try {
      const { customerId } = req.params;
      const { beginTime, endTime } = req.query;

      const response = await squareClient.payments.listPayments({
        customerId,
        beginTime,
        endTime,
      });

      res.status(200).json({
        success: true,
        data: response.payments || [],
      });
    } catch (error) {
      console.error("Error listing customer payments:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get active subscription for a user
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

  // Get all subscriptions
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

  // Cancel a subscription
  static async cancelSubscription(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Find the subscription
      const subscription = await Subscription.findOne({
        where: {
          id,
          userId, // Ensure the subscription belongs to the authenticated user
        },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: "Subscription not found or does not belong to the user",
        });
      }

      // Check if it's already cancelled
      if (subscription.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          error: "Subscription is already cancelled",
        });
      }

      // Update the subscription status to CANCELLED
      await subscription.update({
        status: "CANCELLED",
        endDate: new Date(), // Set the end date to today
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

  // Check and process subscription renewals
  static async processSubscriptionRenewals() {
    try {
      // Find all active subscriptions that are about to expire (within 24 hours)
      const expiringSubscriptions = await Subscription.findAll({
        where: {
          status: "ACTIVE",
          endDate: {
            [Op.lt]: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expiring within 24 hours
            [Op.gt]: new Date(), // Not expired yet
          },
        },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: SubscriptionPlan,
            as: "plan",
          },
        ],
      });

      for (const subscription of expiringSubscriptions) {
        try {
          // Get the user's default payment method
          const paymentMethod = await PaymentMethod.findOne({
            where: {
              userId: subscription.userId,
              isDefault: true,
            },
          });

          if (!paymentMethod) {
            // No payment method found, mark subscription as expired
            await subscription.update({
              status: "EXPIRED",
              endDate: new Date(),
            });
            continue;
          }

          // Process payment using Square
          const response = await squareClient.payments.create({
            idempotencyKey: `${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 15)}`,
            amountMoney: {
              amount: BigInt(subscription.plan.price),
              currency: "USD",
            },
            locationId: SQUARE_LOCATION_ID,
            sourceId: "cnon:card-nonce-ok",
          });

          if (response.payment.status === "COMPLETED") {
            // Calculate new expiry date
            let newExpiryDate = new Date();
            switch (subscription.plan.interval) {
              case "day":
                newExpiryDate.setDate(newExpiryDate.getDate() + 1);
                break;
              case "week":
                newExpiryDate.setDate(newExpiryDate.getDate() + 7);
                break;
              case "month":
                newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
                break;
              case "quarter":
                newExpiryDate.setMonth(newExpiryDate.getMonth() + 3);
                break;
              case "year":
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                break;
              default:
                newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
            }

            // Update user's credits
            await subscription.user.update({
              credits: subscription.plan.creditAmount,
            });

            // Create new subscription period
            await subscription.update({
              startDate: new Date(),
              endDate: newExpiryDate,
              status: "ACTIVE",
            });
          } else {
            // Payment failed, mark subscription as expired
            await subscription.update({
              status: "EXPIRED",
              endDate: new Date(),
            });

            // Reset user credits
            await subscription.user.update({
              credits: 0,
            });
          }
        } catch (error) {
          console.error(
            `Error processing renewal for subscription ${subscription.id}:`,
            error
          );
          // Mark subscription as expired on error
          await subscription.update({
            status: "EXPIRED",
            endDate: new Date(),
          });

          // Reset user credits
          await subscription.user.update({
            credits: 0,
          });
        }
      }
    } catch (error) {
      console.error("Error in subscription renewal process:", error);
    }
  }
}

export default PaymentController;
