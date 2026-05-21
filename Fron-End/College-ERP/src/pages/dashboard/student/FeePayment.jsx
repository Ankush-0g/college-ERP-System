import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button, Input } from "@material-tailwind/react";
import { getStudentFeeHistory, payFees } from "../../../API/ApiStore";

const BASE_BALANCE = 5000;

export default function FeePayment() {
  const [amount, setAmount] = useState(BASE_BALANCE);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setMessage("");
    try {
      const payments = await getStudentFeeHistory(1);
      setHistory(payments || []);
    } catch (err) {
      setMessage(err?.toString() || "Unable to load fee history.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      setMessage("Enter a valid payment amount.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const payment = await payFees({
        studentId: 1,
        amount: paymentAmount,
        paymentMethod: "Online",
      });
      setHistory((prev) => [...prev, payment]);
      setAmount(BASE_BALANCE - history.reduce((sum, item) => sum + (item.amount || 0), 0) - paymentAmount);
      setMessage("Payment processed successfully.");
    } catch (error) {
      setMessage(error?.toString() || "Failed to process payment.");
    } finally {
      setSaving(false);
    }
  };

  const totalPaid = history.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const outstanding = Math.max(BASE_BALANCE - totalPaid, 0);

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Fee Payment & Receipts</Typography>

      <Card className="border shadow-sm">
        <CardBody>
          <Typography className="font-medium">Outstanding Balance</Typography>
          <Typography variant="h4" className="mt-2">
            ₹{outstanding}
          </Typography>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              type="number"
              label="Amount to pay"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button disabled={saving} onClick={handlePayNow}>
              {saving ? "Processing..." : "Pay Now"}
            </Button>
          </div>
          {message && <Typography color={message.includes("Failed") ? "red" : "green"}>{message}</Typography>}
        </CardBody>
      </Card>

      <Card className="border shadow-sm">
        <CardBody>
          <Typography variant="h6" className="mb-4">
            Payment History
          </Typography>
          {loading && <Typography>Loading history...</Typography>}
          {!loading && history.length === 0 && <Typography>No payments made yet.</Typography>}
          <div className="space-y-3">
            {history.map((receipt) => (
              <div key={receipt.id} className="rounded-xl border p-4">
                <Typography className="font-medium">Receipt #{receipt.id}</Typography>
                <Typography variant="small" className="text-gray-500">
                  ₹{receipt.amount} • {receipt.paymentDate}
                </Typography>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
