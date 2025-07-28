import { useEffect, useState } from "react";
import axios from "axios";

interface Plan {
  id: number;
  name: string;
  price: string;
  interval: string;
}

interface Payment {
  id: number;
  plan: Plan | null;
  amount: number;
  currency: string;
  status: string;
  description: string;
  transactionDate: string;
  card: {
    brand: string;
    last4: string;
  };
  receiptUrl?: string | null;
}

function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/transactions/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.transactions)
        ? res.data.transactions
        : [];

      setPayments(data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading your payment history...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-gray-500 text-lg">No payment records found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment History</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-3 px-4 border-b">Date & Time</th>
              <th className="py-3 px-4 border-b">Plan</th>
              <th className="py-3 px-4 border-b">Interval</th>
              <th className="py-3 px-4 border-b">Description</th>
              <th className="py-3 px-4 border-b">Amount</th>
              <th className="py-3 px-4 border-b">Card</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((tx) => (
              <tr key={tx.id} className="border-b">
                <td className="py-2 px-4">{new Date(tx.transactionDate).toLocaleString()}</td>
                <td className="py-2 px-4">{tx.plan?.name || "Unknown Plan"}</td>
                <td className="py-2 px-4">{tx.plan?.interval || "-"}</td>
                <td className="py-2 px-4">{tx.description}</td>
                <td className="py-2 px-4">
                  {tx.amount} {tx.currency}
                </td>
                <td className="py-2 px-4">
                  {tx.card?.brand !== "Unavailable"
                    ? `${tx.card.brand.toUpperCase()} •••• ${tx.card.last4}`
                    : "Unavailable"}
                </td>
                <td className="py-2 px-4">{tx.status}</td>
                <td className="py-2 px-4">
                  {tx.receiptUrl ? (
                    <a
                      href={tx.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentHistory;
