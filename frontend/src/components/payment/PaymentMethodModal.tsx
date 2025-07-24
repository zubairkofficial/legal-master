import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import useUserStore from "@/store/useUserStore";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "@/services/api";
import { trackConversion } from "../../tracking/analytics";

interface PaymentMethod {
  id: string;
  cardType: string;
  lastFourDigits: string;
  cardholderName: string;
  isDefault: boolean;
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentMethodSelect: (paymentMethodId: string) => void;
  onDirectPayment: (paymentResult: undefined) => void;
  amount: number;
  planId: string;
  processingPayment?: boolean;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onPaymentMethodSelect,
  processingPayment = false,
}: PaymentMethodModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("direct-payment");
  const [autoRenew, setAutoRenew] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) loadPaymentMethods();
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const response = await api.get(`/payment`);
      setPaymentMethods(response.data.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load payment methods.",
        variant: "destructive",
      });
    }
  };

  const handleDirectPayment = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Stripe Not Ready",
        description: "Please wait for Stripe to load.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Card Element Not Found",
        description: "Please enter your card details.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing Payment",
      description: "Please wait while we save your card...",
    });

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { name: user?.name || "Unknown" },
      });

      if (error) {
        toast({
          title: "Payment Method Error",
          description: error.message || "Error processing your payment.",
          variant: "destructive",
        });
        return;
      }
      onPaymentMethodSelect(paymentMethod.id);
      trackConversion("purchase", paymentMethod.id);

      api
        .post("/payment", {
          userId: user?.id,
          stripePaymentMethodId: paymentMethod.id,
          cardholderName: user?.name || "Unknown",
          cardType: paymentMethod.card?.brand?.toUpperCase() || "UNKNOWN",
          lastFourDigits: paymentMethod.card?.last4 || "0000",
          expiryMonth: paymentMethod.card?.exp_month?.toString() || "01",
          expiryYear: paymentMethod.card?.exp_year?.toString() || "2025",
          autoReniew: autoRenew,
        })
        .catch((err) => {
          console.error("Error saving payment method:", err);
          toast({
            title: "Save Error",
            description: "Card saved but failed to sync with server.",
            variant: "destructive",
          });
        });
    } catch (err: any) {
      toast({
        title: "Payment Failed",
        description: err?.message || "Unable to process payment.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={processingPayment ? undefined : onClose}
    >
      <DialogContent
        className="sm:max-w-[480px] p-6 bg-white rounded-xl shadow-2xl border border-gray-100"
        style={{ fontFamily: "TikTok Sans, sans-serif" }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Make Payment
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="direct-payment"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-4"
        >
          {/* Direct Payment Tab */}
          <TabsContent value="direct-payment" className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Card Details
              </Label>
              <div className="border rounded-lg p-4 focus-within:ring-[#BB8A28] transition-all">
                <CardElement options={{ hidePostalCode: true }} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="w-4 h-4 accent-[#BB8A28]"
              />
              <Label htmlFor="autoRenew" className="text-sm text-gray-600">
                Enable Auto-Renew
              </Label>
            </div>

            <DialogFooter>
              <Button
                className="w-full bg-[#BB8A28] hover:bg-[#a67b23] text-white font-medium rounded-lg py-2 transition-all"
                onClick={handleDirectPayment}
                disabled={processingPayment}
              >
                {processingPayment ? "Processing..." : "Pay Now"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Saved Cards Tab */}
          <TabsContent value="saved-cards" className="space-y-4">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() =>
                    !processingPayment && onPaymentMethodSelect(method.id)
                  }
                  className={`p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${
                    processingPayment ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <p className="font-medium text-gray-800">
                    {method.cardType} ending in {method.lastFourDigits}
                  </p>
                  <p className="text-sm text-gray-500">
                    {method.cardholderName}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No saved payment methods.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
