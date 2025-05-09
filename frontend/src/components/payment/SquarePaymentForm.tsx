//@ts-nocheck
import  { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from '@/services/api';
import useUserStore from '@/store/useUserStore';
import squareConfig from '@/config/square';

declare global {
  interface Window {
    Square: any;
  }
}

interface SquarePaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: any) => void;
  disabled?: boolean;
}

export default function SquarePaymentForm({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError,
  disabled = false 
}: SquarePaymentFormProps) {
  const [card, setCard] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const { toast } = useToast();

  useEffect(() => {
    // Load the Square Web Payments SDK
    const script = document.createElement('script');
    const sdkUrl = squareConfig.environment === 'production' 
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.src = sdkUrl;
    script.onload = initializeSquare;
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const initializeSquare = async () => {
    if (!window.Square) {
      console.error('Square SDK failed to load');
      return;
    }

    try {
      const payments = window.Square.payments(squareConfig.appId, squareConfig.locationId);
      const card = await payments.card();
      await card.attach('#card-container');
      
      setCard(card);
      setPayments(payments);
    } catch (error) {
      console.error('Failed to initialize Square payments:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSubmit = async () => {
    if (!card) {
      toast({
        title: "Error",
        description: "Payment form not initialized properly.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get the buyer's billing information to use for SCA verification
      const billingContact = {
        givenName: user?.name || '',
        familyName: user?.lastName || '',
        email: user?.email || '',
      };

      // Create verification details for tokenization
      const verificationDetails = {
        amount: amount.toString(),
        billingContact,
        currencyCode: 'USD',
        intent: 'CHARGE',
        customerInitiated: true,
        sellerKeyedIn: false
      };

      // Tokenize the card with verification details
      const tokenResult = await card.tokenize(verificationDetails);

      if (tokenResult.status === 'OK') {
        // Send the source ID to your server to create the payment
        const paymentResponse = await api.post('/payment/process', {
          sourceId: tokenResult.token,
          amount: amount,
          currency: 'USD'
        });

        onPaymentSuccess(paymentResponse.data.data);
      } else {
        let errorMessage = `Tokenization failed: ${tokenResult.status}`;
        if (tokenResult.errors) {
          errorMessage += ` - ${JSON.stringify(tokenResult.errors)}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Card Information</Label>
            <div id="card-container" className={`border p-3 rounded-md min-h-[40px] ${disabled ? 'opacity-70 pointer-events-none' : ''}`}></div>
          </div>

          <Button 
            onClick={handlePaymentSubmit} 
            disabled={loading || disabled} 
            className="w-full"
          >
            {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 