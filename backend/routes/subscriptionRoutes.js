import express from 'express';
import PaymentController from '../controllers/paymentController.js';
import authMiddleware  from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
// Subscription Plans
router.post('/',  PaymentController.createSubscriptionPlan);
router.get('/', PaymentController.getSubscriptionPlans);
router.get('/all', PaymentController.getAllSubscriptions);
router.put('/:id', PaymentController.updateSubscriptionPlan);
router.delete('/:id', PaymentController.deleteSubscriptionPlan);


// Payments

export default router; 