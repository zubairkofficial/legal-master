import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import api from '@/services/api';
import useUserStore from '@/store/useUserStore';
import SquarePaymentForm from './SquarePaymentForm';
import CardIcon from './CardIcon';

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
  onDirectPayment,
  amount,
  processingPayment = false
}: PaymentMethodModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const {user} = useUserStore();
  const [formData, setFormData] = useState({
    userId: user?.id,
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    billingAddress: ''
  });
  const [activeTab, setActiveTab] = useState('saved-cards');

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const response = await api.get(`/payment`);
      setPaymentMethods(response.data.data || []);
      if (response.data.data?.length === 0) {
        setShowAddNew(true);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setLoading(true);
       await api.post('/payment', formData);
      await loadPaymentMethods();
      setShowAddNew(false);
      setFormData({
        userId: user?.id,
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        billingAddress: ''
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddPaymentMethod();
  };

  const handlePaymentSuccess = (paymentResult: undefined) => {
    onDirectPayment(paymentResult);
    onClose();
  };

  const handlePaymentError = (error: unknown) => {
    console.error('Payment error:', error);
  };

  return (
    <Dialog open={isOpen} onOpenChange={processingPayment ? undefined : onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="direct-payment" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          {/* <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct-payment" disabled={processingPayment}>Pay with Card</TabsTrigger>
            <TabsTrigger value="saved-cards" disabled={processingPayment}>Saved Cards</TabsTrigger>
          </TabsList> */}
          
          <TabsContent value="direct-payment" className="space-y-4">
            <SquarePaymentForm 
              amount={amount} 
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              disabled={processingPayment}
            />
          </TabsContent>
          
          <TabsContent value="saved-cards">
            {!showAddNew ? (
              <div className="space-y-4">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer hover:border-primary ${processingPayment ? 'opacity-70 pointer-events-none' : ''}`}
                      onClick={() => !processingPayment && onPaymentMethodSelect(method.id)}
                    >
                      <CardContent className="p-4 flex items-center space-x-4">
                        <CardIcon cardType={method.cardType} />
                        <div>
                          <p className="font-medium">{method.cardType} ending in {method.lastFourDigits}</p>
                          <p className="text-sm text-muted-foreground">{method.cardholderName}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No saved payment methods</p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAddNew(true)}
                  disabled={processingPayment}
                >
                  Add New Payment Method
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Input
                      id="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                      placeholder="MM"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Year</Label>
                    <Input
                      id="expiryYear"
                      value={formData.expiryYear}
                      onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                      placeholder="YY"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      value={formData.cvc}
                      onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                      placeholder="123"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Input
                    id="billingAddress"
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddNew(false)}
                    disabled={loading || processingPayment}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || processingPayment}>
                    {loading ? 'Adding...' : 'Add Payment Method'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 