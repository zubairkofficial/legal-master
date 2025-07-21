import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "../../components/ui/button";
import Helpers from "../../config/helpers";
import useUserStore from "@/store/useUserStore";
import api from "@/services/api";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

function CardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);

  useEffect(() => {
    const checkExistingCard = async () => {
      try {
        const res = await api.get("/payment");
        const savedMethods = res.data.data;

        if (savedMethods && savedMethods.length > 0) {
          if (user && user.isOld !== false) {
            setUser({ ...user, isOld: false });
          }
          Helpers.showToast("Card already saved, redirecting...", "success");
          navigate("/chat/new", { replace: true });
        }
      } catch (err) {
        console.error("Error checking existing payment methods:", err);
      }
    };

    checkExistingCard();
  }, [navigate, setUser, user]);

  const handleSaveCard = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      Helpers.showToast("Card element not found", "error");
      return;
    }

    setLoading(true);
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { name: user?.name || "Unknown" },
      });

      if (error) {
        Helpers.showToast(error.message || "Failed to save card", "error");
        setLoading(false);
        return;
      }

      const savedRes = await api.get("/payment");
      const savedMethods = savedRes.data.data || [];
      const existingMethod = savedMethods.length > 0 ? savedMethods[0] : null;

      if (existingMethod) {
        await api.put(`/payment/${existingMethod.id}`, {
          stripePaymentMethodId: paymentMethod.id,
          cardholderName: user?.name || "Unknown",
          cardType: paymentMethod.card?.brand?.toUpperCase() || "UNKNOWN",
          lastFourDigits: paymentMethod.card?.last4 || "0000",
          expiryMonth: paymentMethod.card?.exp_month?.toString() || "01",
          expiryYear: paymentMethod.card?.exp_year?.toString() || "2025",
          autoReniew: autoRenew,
        });
      } else {
        await api.post("/payment", {
          userId: user?.id,
          stripePaymentMethodId: paymentMethod.id,
          cardholderName: user?.name || "Unknown",
          cardType: paymentMethod.card?.brand?.toUpperCase() || "UNKNOWN",
          lastFourDigits: paymentMethod.card?.last4 || "0000",
          expiryMonth: paymentMethod.card?.exp_month?.toString() || "01",
          expiryYear: paymentMethod.card?.exp_year?.toString() || "2025",
          autoReniew: autoRenew,
        });
      }

      if (user) {
        setUser({ ...user, isOld: false });
      }

      Helpers.showToast("Card saved successfully!", "success");
      navigate("/chat/new", { replace: true });
    } catch (err) {
      console.error("Card setup error:", err);
      Helpers.showToast("Error saving card", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Save Your Payment Method</h2>
      <CardElement className="p-3 border rounded-md" />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoRenew"
          checked={autoRenew}
          onChange={(e) => setAutoRenew(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="autoRenew" className="text-sm">
          Enable Auto-Renew for this card
        </label>
      </div>

      <Button
        onClick={handleSaveCard}
        disabled={loading}
        className="w-full bg-[#BB8A28] text-white"
      >
        {loading ? "Saving..." : "Save Card"}
      </Button>
    </div>
  );
}

export default function SetupCard() {
  return (
    <Elements stripe={stripePromise}>
      <CardForm />
    </Elements>
  );
}


//
// UPDATE users
// SET "isOld" = TRUE
// WHERE "createdAt" < '2025-07-01';
