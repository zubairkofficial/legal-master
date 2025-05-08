import api from "./api";

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    interval: string;
    status: boolean;
    features: string[];
    creditAmount: number;
}

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
    startDate: string;
    endDate?: string;
    lastBillingDate?: string;
    nextBillingDate?: string;
    plan?: SubscriptionPlan;
}

export interface PaymentRequest {
    amount: number;
    currency: string;
    sourceId: string;
}

export interface PaymentMethodRequest {
    userId: number;
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    billingAddress: string;
}

// Subscription Service
const subscriptionService = {
    getAllPlans: async (): Promise<SubscriptionPlan[]> => {
        const response = await api.get("/subscription/");
        return response.data.data || [];
    },

    getPlanById: async (id: string): Promise<SubscriptionPlan> => {
        const response = await api.get(`/subscription/${id}`);
        return response.data.data;
    },

    createPlan: async (planData: Omit<SubscriptionPlan, 'id' | 'status'>): Promise<SubscriptionPlan> => {
        const response = await api.post("/subscription", planData);
        return response.data.data;
    },

    updatePlan: async (id: string, planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
        const response = await api.put(`/subscription/${id}`, planData);
        return response.data.data;
    },

    deletePlan: async (id: string): Promise<void> => {
        await api.delete(`/subscription/${id}`);
    },

    createSubscription: async (userId: number, planId: string): Promise<Subscription> => {
        const response = await api.post("/subscription/sub", { userId, planId });
        return response.data.data;
    },

    cancelSubscription: async (subscriptionId: string): Promise<Subscription> => {
        const response = await api.delete(`/subscription/unsub/${subscriptionId}`);
        return response.data.data;
    },

    getSubscription: async (subscriptionId: string): Promise<Subscription> => {
        const response = await api.get(`/subscription/subscriptions/${subscriptionId}`);
        return response.data.data;
    },

    processPayment: async (paymentData: PaymentRequest): Promise<any> => {
        const response = await api.post("/payment/process", paymentData);
        return response.data.data;
    },

    addPaymentMethod: async (paymentData: PaymentMethodRequest): Promise<void> => {
        const response = await api.post("/payment", paymentData);
        return response.data.data;
    },
};

export default subscriptionService; 