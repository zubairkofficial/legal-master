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
  // const [showAddNew, setShowAddNew] = useState(false);
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("direct-payment");
  const [autoRenew, setAutoRenew] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const response = await api.get(`/payment`);
      setPaymentMethods(response.data.data || []);
      // if (response.data.data?.length === 0) {
      //   setShowAddNew(true);
      // }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error loading payment methods.",
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

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: user?.name || "Unknown",
      },
    });

    if (error) {
      toast({
        title: "Payment Method Error",
        description:
          error.message || "There was an error processing your payment.",
        variant: "destructive",
      });
      return;
    }

    try {
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

      onPaymentMethodSelect(paymentMethod.id);
    } catch (err: any) {
      toast({
        title: "Error Saving Payment Method",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "There was an error saving your payment method.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={processingPayment ? undefined : onClose}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="direct-payment"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          {/* Stripe Card Payment Tab */}
          <TabsContent value="direct-payment" className="space-y-4">
            <div className="space-y-2">
              <Label>Card Details</Label>
              <div className="border p-4 rounded bg-white">
                <CardElement options={{ hidePostalCode: true }} />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="autoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="autoRenew">Enable Auto-Renew</Label>
            </div>

            <DialogFooter>
              <Button
                className="w-full"
                onClick={handleDirectPayment}
                disabled={processingPayment}
              >
                {processingPayment ? "Processing..." : "Pay Now"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Optional Saved Cards Section – not used unless Stripe saves them */}
          <TabsContent value="saved-cards">
            <div className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded p-4 cursor-pointer hover:border-primary ${
                      processingPayment ? "opacity-50 pointer-events-none" : ""
                    }`}
                    onClick={() =>
                      !processingPayment && onPaymentMethodSelect(method.id)
                    }
                  >
                    <p className="font-medium">
                      {method.cardType} ending in {method.lastFourDigits}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.cardholderName}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No saved payment methods.
                </p>
              )}
            </div>
          </TabsContent>
          {/* Optional Saved Cards Section – not used unless Stripe saves them */}
          <TabsContent value="saved-cards">
            <div className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded p-4 cursor-pointer hover:border-primary ${
                      processingPayment ? "opacity-50 pointer-events-none" : ""
                    }`}
                    onClick={() =>
                      !processingPayment && onPaymentMethodSelect(method.id)
                    }
                  >
                    <p className="font-medium">
                      {method.cardType} ending in {method.lastFourDigits}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.cardholderName}{" "}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No saved payment methods.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
