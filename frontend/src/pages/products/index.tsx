import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import api from "@/services/api";
import subscriptionService, {
  SubscriptionPlan,
  Subscription,
} from "@/services/subscription.service";

import PaymentMethodModal from "@/components/payment/PaymentMethodModal";
import { useToast } from "@/components/ui/use-toast";
import useUserStore from "@/store/useUserStore";
import chatService from "@/services/chat.service";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

export default function Products() {
  const stripe = useStripe();
  const elements = useElements();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false); // NEW
  const { toast } = useToast();
  const { user } = useUserStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, activeSubData] = await Promise.all([
        subscriptionService.getAllPlans(),
        subscriptionService.getUserActiveSubscription(),
      ]);

      setPlans(plansData);
      setActiveSubscription(activeSubData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description:
          "Failed to load subscription data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = async (plan: SubscriptionPlan) => {
    if (Number(plan.price) === 0) {
      try {
        setProcessingPayment(true);

        const response = await api.post("/payment/confirm", {
          paymentIntentId: null, // no payment needed
          creditAmount: plan.creditAmount,
          planId: plan.id,
        });

        toast({
          title: "Success",
          description:
            response.data.message || "Free plan activated! Credits added.",
        });

        // Update user credits
        const updatedCredits = await chatService.fetchUserCredits();
        useUserStore.getState().updateUser({ credits: updatedCredits });

        // Refresh active subscription state
        const activeSubData =
          await subscriptionService.getUserActiveSubscription();
        setActiveSubscription(activeSubData);
      } catch (error: any) {
        console.error("Error activating free plan:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.error ||
            "Failed to activate free plan. Please try again.",
          variant: "destructive",
        });
      } finally {
        setProcessingPayment(false);
      }
      return;
    }

    // For paid plans, proceed with Stripe modal
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (paymentMethodId: string) => {
    if (!selectedPlan || !user?.id) return;

    try {
      setProcessingPayment(true);

      const stripeCardIntent = await subscriptionService.processPayment({
        amount: Number(selectedPlan.price),
        currency: "USD",
        sourceId: paymentMethodId,
        creditAmount: selectedPlan.creditAmount,
        planId: selectedPlan.id,
      });

      console.log("stripeCardIntent:", stripeCardIntent);

      if (!stripe || !elements) {
        toast({
          title: "Stripe Error",
          description: "Stripe is not initialized properly.",
          variant: "destructive",
        });
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast({
          title: "Card Error",
          description: "Card element not found.",
          variant: "destructive",
        });
        return;
      }

      const clientSecret = stripeCardIntent.clientSecret;
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );
      if (error) {
        console.error("[Stripe confirmCardPayment error]", error);
        toast({
          title: "Payment Error",
          description: error.message || "Stripe payment failed.",
          variant: "destructive",
        });
        return;
      }
      if (paymentIntent.status === "succeeded") {
        await api.post("/payment/confirm", {
          paymentIntentId: paymentIntent.id,
          creditAmount: selectedPlan.creditAmount,
          planId: selectedPlan.id,
        });

        toast({
          title: "Success",
          description: "Your subscription has been activated successfully!",
        });

        // Update user credits
        const updatedCredits = await chatService.fetchUserCredits();
        useUserStore.getState().updateUser({ credits: updatedCredits });

        setShowPaymentModal(false);
        setSelectedPlan(null);

        const activeSubData =
          await subscriptionService.getUserActiveSubscription();
        setActiveSubscription(activeSubData);
      }
    } catch (error) {
      console.error("Error processing subscription:", error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;

    // Ask for confirmation only if it's a free plan
    if (Number(activeSubscription.plan?.price || 0) === 0) {
      setShowCancelModal(true); // Open Tailwind modal
      return;
    }

    await proceedCancelSubscription();
  };

  const proceedCancelSubscription = async () => {
    try {
      setProcessingPayment(true);

      await subscriptionService.cancelSubscription(activeSubscription.id);

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been successfully cancelled.",
      });

      // Update user credits
      const updatedCredits = await chatService.fetchUserCredits();
      useUserStore.getState().updateUser({ credits: updatedCredits });

      // Reload subscription state
      const updatedSub = await subscriptionService.getUserActiveSubscription();
      setActiveSubscription(updatedSub);

      // Hide free trial plan after cancellation
      if (Number(activeSubscription.plan?.price || 0) === 0) {
        setPlans((prevPlans) =>
          prevPlans.filter((p) => p.id !== activeSubscription.planId)
        );
      }
    } catch (error) {
      console.error("Cancel Subscription Error:", error);
      toast({
        title: "Error",
        description: "Unable to cancel your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (activeSubscription) {
    const activePlan = activeSubscription.plan;

    return (
      <>
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your Active Subscription
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                You are currently subscribed to our service
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{activePlan?.name || "Active Plan"}</CardTitle>
                <CardDescription>
                  {activePlan?.description || "Your current subscription"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">
                    $
                    {activePlan?.price
                      ? (activePlan.price / 100).toFixed(2)
                      : "0.00"}
                  </span>
                  <span className="text-muted-foreground">
                    /{activePlan?.interval || "month"}
                  </span>
                </div>

                <div className="space-y-2">
                  <p>
                    <strong>Status:</strong> {activeSubscription.status}
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {new Date(activeSubscription.startDate).toLocaleDateString()}
                  </p>
                  {activeSubscription.nextBillingDate && (
                    <p>
                      <strong>Next Billing:</strong>{" "}
                      {new Date(
                        activeSubscription.nextBillingDate
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {activePlan?.features && (
                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="space-y-2">
                      {activePlan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-[#BB8A28] flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              {activeSubscription && (
                <CardFooter>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    className="w-full"
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Cancel Subscription"
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>

            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Want to change your plan?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                You can cancel your current plan and choose a new one below
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    activeSubscription.planId === plan.id
                      ? "border-[#BB8A28] border-2"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">
                        ${(plan.price / 100).toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">
                        /{plan.interval}
                      </span>
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
                      disabled={
                        processingPayment ||
                        (plan.price === 0 &&
                          activeSubscription?.planId === plan.id &&
                          new Date(activeSubscription.nextBillingDate || "") >
                            new Date())
                      }
                    >
                      {processingPayment && selectedPlan?.id === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : activeSubscription.planId === plan.id ? (
                        "Current Plan"
                      ) : (
                        "Switch to this Plan"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {showCancelModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-semibold mb-4">Cancel Free Trial</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel your free trial? You won’t be able to activate it again.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  disabled={processingPayment}
                >
                  No, Keep It
                </Button>
                <Button
                  variant="destructive"
                  onClick={proceedCancelSubscription}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
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
                  <span className="text-3xl font-bold">
                    ${(plan.price / 100).toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    /{plan.interval}
                  </span>
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
                  disabled={
                    processingPayment ||
                    (plan.price === 0 && activeSubscription?.planId === plan.id)
                  }
                >
                  {processingPayment && selectedPlan?.id === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Get Started"
                  )}
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
            if (!processingPayment) {
              setShowPaymentModal(false);
              setSelectedPlan(null);
            }
          }}
          onPaymentMethodSelect={handlePaymentMethodSelect}
          onDirectPayment={() => {}}
          planId={selectedPlan.id}
          amount={selectedPlan.price}
          processingPayment={processingPayment}
        />
      )}
    </section>
  );
}
