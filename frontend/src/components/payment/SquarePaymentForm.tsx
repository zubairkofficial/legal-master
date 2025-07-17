import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";
import useUserStore from "@/store/useUserStore";

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

    setLoading(true);

    try {
      const intentRes: any = await api.post("/payments/process", {
        amount,
        currency: "usd",
        creditAmount,
        planId,
      });

      const clientSecret = intentRes.data.clientSecret;

      // Step 2: Confirm Card Payment
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
        let errorMsg =
          result.error.message || "There was an error processing your payment.";
        if (
          errorMsg.includes(
            "Your card was declined. Your request used a real card while testing"
          )
        ) {
          errorMsg =
            "Your card was declined because you used a real card in test mode. Please use a Stripe test card. See: https://stripe.com/docs/testing";
        } else if (
          result.error.type === "card_error" ||
          result.error.code === "card_declined"
        ) {
          errorMsg =
            "Your card was declined. Please check your card details or use a different card.";
        }
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive",
        });
        onPaymentError(result.error);
        setLoading(false);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        const confirmRes = await api.post("/payment/confirm", {
          paymentIntentId: result.paymentIntent.id,
          planId,
          creditAmount,
        });

        onPaymentSuccess(confirmRes.data.data);
      } else {
        toast({
          title: "Payment Failed",
          description: "Payment not successful.",
          variant: "destructive",
        });
        throw new Error("Payment not successful.");
      }
    } catch (error: any) {
      let errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "There was an error processing your payment. Please check your card details.";
      if (
        errorMsg.includes(
          "Your card was declined. Your request used a real card while testing"
        )
      ) {
        errorMsg =
          "Your card was declined because you used a real card in test mode. Please use a Stripe test card. See: https://stripe.com/docs/testing";
      }
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
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Card Information</Label>
          <div
            className={`border p-3 rounded-md min-h-[40px] ${
              disabled ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            <CardElement />
          </div>
        </div>

        <Button
          onClick={handlePaymentSubmit}
          disabled={loading || disabled}
          className="w-full"
        >
          {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  );
}
