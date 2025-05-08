import express from 'express';
import PaymentController from '../controllers/paymentController.js';
import authMiddleware  from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Payment Methods
router.post('/', PaymentController.addPaymentMethod);
router.get('/', PaymentController.getUserPaymentMethods);
router.delete('/:id', PaymentController.deletePaymentMethod);

// Payment Processing
router.post('/process', PaymentController.processPayment);
router.get('/:paymentId', PaymentController.getPayment);
router.get('/customer/:customerId', PaymentController.listCustomerPayments);

export default router; 