import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

function CardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const { clientSecret } = location.state || {};
  const { user, setUser } = useUserStore();

  const [loading, setLoading] = useState(false);

  const handleSaveCard = async () => {
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    try {
      // Confirm card setup with Stripe
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });

      if (result.error) {
        Helpers.showToast(result.error.message || "Failed to save card", "error");
        setLoading(false);
        return;
      }

      // Send payment method ID to backend for saving
      const paymentMethodId = result.setupIntent.payment_method;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/payment/confirm-setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!res.ok) throw new Error("Failed to save payment method");
      await res.json();

      // Update isOld to false in user store
      if (user) {
        setUser({ ...user, isOld: false });
      }

      Helpers.showToast("Card saved successfully!", "success");

      // Redirect to chat after success
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
