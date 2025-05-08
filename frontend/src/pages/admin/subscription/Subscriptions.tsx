import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import subscriptionService, { Subscription } from '../../../services/subscription.service';

const Subscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        try {
            const response = await fetch('/api/payments/subscriptions');
            const data = await response.json();
            setSubscriptions(data.data || []);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        }
    };

    const handleCancelSubscription = async (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setOpenDialog(true);
    };

    const confirmCancel = async () => {
        if (!selectedSubscription) return;

        try {
            await subscriptionService.cancelSubscription(selectedSubscription.id);
            setOpenDialog(false);
            loadSubscriptions();
        } catch (error) {
            console.error('Error canceling subscription:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'text-green-600';
            case 'CANCELLED':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
        }
    };

    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Next Billing</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                            <TableCell>{subscription.userId}</TableCell>
                            <TableCell>{subscription.plan?.name}</TableCell>
                            <TableCell>
                                <span className={getStatusColor(subscription.status)}>
                                    {subscription.status}
                                </span>
                            </TableCell>
                            <TableCell>{formatDate(subscription.startDate)}</TableCell>
                            <TableCell>
                                {subscription.nextBillingDate
                                    ? formatDate(subscription.nextBillingDate)
                                    : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {subscription.status === 'ACTIVE' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleCancelSubscription(subscription)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this subscription? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCancel}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Yes, Cancel Subscription
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Subscriptions; 