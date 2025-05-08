import { SubscriptionPlan, PaymentMethod, User } from '../models/index.js';
import { SquareClient, SquareEnvironment } from "square";
import 'dotenv/config';

// Use environment variables for Square credentials
const SQUARE_ACCESS_TOKEN = "EAAAl0fGitKOGZqZVGwydyJBV_JhGacnWSQXrm02jnMPZ8kf2FQ9DwtzUnNk3wYm";
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
            const { name, price, interval, description, features, creditAmount } = req.body;

            const subscriptionPlan = await SubscriptionPlan.create({
                name,
                price: price * 100, // Convert to cents
                interval,
                description,
                features: features || [],
                creditAmount // Convert to cents if provided
            });

            res.status(201).json({
                success: true,
                data: subscriptionPlan
            });
        } catch (error) {
            console.error('Error creating subscription plan:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get all subscription plans
    static async getSubscriptionPlans(req, res) {
        try {
            const subscriptionPlans = await SubscriptionPlan.findAll({
                where: { status: true }
            });

            res.status(200).json({
                success: true,
                data: subscriptionPlans
            });
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            res.status(500).json({
                success: false,
                error: error.message
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
                    error: 'Subscription plan not found'
                });
            }

            res.status(200).json({
                success: true,
                data: subscriptionPlan
            });
        } catch (error) {
            console.error('Error fetching subscription plan:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Update a subscription plan
    static async updateSubscriptionPlan(req, res) {
        try {
            const { id } = req.params;
            const { name, price, interval, description, status, features, creditAmount } = req.body;

            const subscriptionPlan = await SubscriptionPlan.findByPk(id);

            if (!subscriptionPlan) {
                return res.status(404).json({
                    success: false,
                    error: 'Subscription plan not found'
                });
            }

            await subscriptionPlan.update({
                name,
                price: price ? price * 100 : undefined, // Convert to cents if provided
                interval,
                description,
                status,
                features: features !== undefined ? features : undefined,
                creditAmount // Convert to cents if provided
            });

            res.status(200).json({
                success: true,
                data: subscriptionPlan
            });
        } catch (error) {
            console.error('Error updating subscription plan:', error);
            res.status(500).json({
                success: false,
                error: error.message
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
                    error: 'Subscription plan not found'
                });
            }

            await subscriptionPlan.destroy();

            res.status(200).json({
                success: true,
                message: 'Subscription plan deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting subscription plan:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Add a new payment method
    static async addPaymentMethod(req, res) {
        try {
            const { userId, cardNumber, cardholderName, expiryMonth, expiryYear, cvc, billingAddress } = req.body;

            // Get last 4 digits of card number
            const lastFourDigits = cardNumber.slice(-4);

            // Determine card type (basic implementation)
            const cardType = cardNumber.startsWith('4') ? 'VISA' :
                cardNumber.startsWith('5') ? 'MASTERCARD' :
                    cardNumber.startsWith('3') ? 'AMEX' : 'OTHER';

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
                isDefault: true // Set as default if it's the first card
            });

            res.status(201).json({
                success: true,
                data: paymentMethod
            });
        } catch (error) {
            console.error('Error adding payment method:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get user's payment methods
    static async getUserPaymentMethods(req, res) {
        try {
            const userId = req.user.id;
            const paymentMethods = await PaymentMethod.findAll({
                where: { userId, status: true },
                attributes: { exclude: ['cardNumber', 'cvc'] } // Don't send sensitive data
            });

            res.status(200).json({
                success: true,
                data: paymentMethods
            });
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            res.status(500).json({
                success: false,
                error: error.message
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
                    error: 'Payment method not found'
                });
            }

            await paymentMethod.update({ status: false });

            res.status(200).json({
                success: true,
                message: 'Payment method deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting payment method:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Process a payment using stored payment method
    static async processPayment(req, res) {
        try {
            const { amount, currency, sourceId } = req.body;
            // Create payment using Square API
            const response = await squareClient.payments.create({
                idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                amountMoney: {
                    amount: BigInt(amount / 100),
                    currency: "USD",
                },
                locationId: SQUARE_LOCATION_ID,
                sourceId: "cnon:card-nonce-ok", // The payment token from Web Payments SDK
            });

            if (response.payment.status === "COMPLETED") {
                // Convert the payment object to a plain object and stringify any BigInt values
                const paymentData = JSON.parse(JSON.stringify(response.payment, (key, value) => 
                    typeof value === 'bigint' ? value.toString() : value
                ));
                
                res.status(200).json({
                    status: "success",
                    data: paymentData
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: "Payment failed"
                });
            }

        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get payment details
    static async getPayment(req, res) {
        try {
            const { paymentId } = req.params;

            const response = await squareClient.payments.getPayment(paymentId);

            res.status(200).json({
                success: true,
                data: response.result.payment
            });
        } catch (error) {
            console.error('Error fetching payment:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // List all payments for a customer
    static async listCustomerPayments(req, res) {
        try {
            const { customerId } = req.params;
            const { beginTime, endTime } = req.query;

            const response = await squareClient.payments.listPayments({
                customerId,
                beginTime,
                endTime
            });

            res.status(200).json({
                success: true,
                data: response.payments || []
            });
        } catch (error) {
            console.error('Error listing customer payments:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default PaymentController;
