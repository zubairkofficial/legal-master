import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";
import useUserStore from "@/store/useUserStore";
import { trackConversion } from "../../tracking/analytics";

interface StripePaymentFormProps {
  amount: number;
  planId?: string;
  creditAmount?: number;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: any) => void;
  disabled?: boolean;
}

export default function StripePaymentForm({
  amount,
  planId,
  creditAmount,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUserStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePaymentSubmit = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Stripe Not Ready",
        description: "Please wait for Stripe to load.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true); // Instant feedback

    try {
      // Create PaymentIntent
      const intentRes = await api.post("/payments/process", {
        amount,
        currency: "usd",
        creditAmount,
        planId,
      });

      const clientSecret = intentRes.data.clientSecret;

      // Confirm Payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: user?.name || "Unknown User",
            email: user?.email || "",
          },
        },
      });

      if (result.error) {
        toast({
          title: "Payment Failed",
          description: result.error.message || "Error processing payment.",
          variant: "destructive",
        });
        onPaymentError(result.error);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        const confirmRes = await api.post("/payment/confirm", {
          paymentIntentId: result.paymentIntent.id,
          planId,
          creditAmount,
        });
        onPaymentSuccess(confirmRes.data.data);
        trackConversion("purchase", result.paymentIntent.id);
      } else {
        throw new Error("Payment not successful.");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "There was an error processing your payment.";
      toast({
        title: "Payment Failed",
        description: errorMsg,
        variant: "destructive",
      });
      onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="w-full max-w-lg mx-auto"
      style={{ fontFamily: "TikTok Sans, sans-serif" }}
    >
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Card Information</Label>
          <div
            className={`border p-3 rounded-md min-h-[40px] transition-all ${
              disabled ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            <CardElement />
          </div>
        </div>

        <Button
          onClick={handlePaymentSubmit}
          disabled={loading || disabled}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="white"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Processing...
            </>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
