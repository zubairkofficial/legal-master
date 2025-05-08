import  { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import subscriptionService, { SubscriptionPlan } from '@/services/subscription.service';
import PaymentMethodModal from '@/components/payment/PaymentMethodModal';
import { useToast } from "@/components/ui/use-toast";
import useUserStore from '@/store/useUserStore';

export default function Products() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();
  const { user } = useUserStore();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await subscriptionService.getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (paymentMethodId: string) => {
    if (!selectedPlan || !user?.id) return;

    try {
      // Process the payment using the selected payment method
      await subscriptionService.processPayment({
        amount: Number(selectedPlan.price),
        currency: 'USD',
        sourceId: paymentMethodId // This still uses stored payment methods IDs
      });

      // Create the subscription after successful payment
      await subscriptionService.createSubscription(
        Number(user.id),
        selectedPlan.id
      );

      toast({
        title: "Success",
        description: "Your subscription has been activated successfully!",
      });

      setShowPaymentModal(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDirectPayment = async () => {
    if (!selectedPlan || !user?.id) return;

    try {
      // The payment has already been processed, now create the subscription
      await subscriptionService.createSubscription(
        Number(user.id),
        selectedPlan.id
      );

      toast({
        title: "Success",
        description: "Your subscription has been activated successfully!",
      });

      setShowPaymentModal(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error creating subscription after payment:', error);
      toast({
        title: "Error",
        description: "Payment processed but subscription creation failed. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Select the perfect plan for your legal needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">${((plan.price/ 100)).toFixed(2)}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-[#BB8A28] flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#BB8A28] hover:bg-[#A07923]"
                  onClick={() => handleGetStarted(plan)}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          onPaymentMethodSelect={handlePaymentMethodSelect}
          onDirectPayment={handleDirectPayment}
          planId={selectedPlan.id}
          amount={selectedPlan.price}
        />
      )}
    </section>
  );
} 