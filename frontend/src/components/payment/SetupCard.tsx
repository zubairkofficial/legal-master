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

const cardStyle = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": { color: "#a0aec0" },
    },
    invalid: { color: "#e53e3e" },
  },
  hidePostalCode: true,
};

function CardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    const checkExistingCard = async () => {
      try {
        const res = await api.get("/payment");
        if (res.data?.data?.length > 0 && !toastShown) {
          if (user) setUser({ ...user, isOld: false });
          setToastShown(true);
          Helpers.showToast("Card already saved, redirecting...", "success");
          navigate("/chat/new", { replace: true });
        }
      } catch (err) {
        console.error("Error checking existing payment methods:", err);
      }
    };
    checkExistingCard();
  }, [navigate, setUser, user, toastShown]);

  const handleSaveCard = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      Helpers.showToast("Card element not found", "error");
      return;
    }

    setLoading(true);
    Helpers.showToast("Saving your card, please wait...", "info"); // Instant feedback

    try {
      // 1. Create Stripe Payment Method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { name: user?.name || "Unknown" },
      });

      if (error) {
        Helpers.showToast(error.message || "Failed to save card", "error");
        return;
      }

      // 2. Save to backend in background (no blocking UI)
      const savePromise = api.post("/payment", {
        userId: user?.id,
        stripePaymentMethodId: paymentMethod.id,
        cardholderName: user?.name || "Unknown",
        cardType: paymentMethod.card?.brand?.toUpperCase() || "UNKNOWN",
        lastFourDigits: paymentMethod.card?.last4 || "0000",
        expiryMonth: paymentMethod.card?.exp_month?.toString() || "01",
        expiryYear: paymentMethod.card?.exp_year?.toString() || "2025",
      });

      // 3. Update UI immediately
      if (user) setUser({ ...user, isOld: false });
      Helpers.showToast("Card saved successfully!", "success");
      navigate("/chat/new", { replace: true });

      // 4. Wait for backend to finish quietly
      savePromise.catch((err) => {
        console.error("Card save error:", err);
        Helpers.showToast("Error saving card to server", "error");
      });
    } catch (err) {
      console.error("Card setup error:", err);
      Helpers.showToast("Error saving card", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-200"
      style={{ fontFamily: "TikTok Sans, sans-serif" }}
    >
      <h2 className="text-xl font-semibold mb-6 text-gray-900 text-center">
        Save Your Card
      </h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Add your card details securely. No charges will be made.
      </p>
      <div className="p-4 border rounded-md focus-within:ring-2 focus-within:ring-[#BB8A28] transition-all">
        <CardElement options={cardStyle} />
      </div>
      <Button
        onClick={handleSaveCard}
        disabled={loading}
        className="mt-6 w-full bg-[#BB8A28] hover:bg-[#a67b23] text-white font-medium rounded-lg py-2.5 transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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
            Saving...
          </span>
        ) : (
          "Save Card"
        )}
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
