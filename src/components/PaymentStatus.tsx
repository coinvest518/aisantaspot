import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type PaymentStatusProps = {
  status: 'success' | 'processing' | 'failed' | 'checking';
  error: string | null;
  paymentAmount: number | null;
};

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, error, paymentAmount }) => {


    const displayAmount = paymentAmount ? (paymentAmount / 100).toFixed(2) : null;



  return (
    <>
      {status === 'checking' && (
        <Alert>
          <div className="flex items-center">
            <Loader2 className="mr-2 animate-spin" />
            <AlertDescription>Checking payment status...</AlertDescription>
          </div>
        </Alert>
      )}
      {status === 'success' && (
        <Alert variant="default">
          <div className="flex items-center">
            <CheckCircle2 className="mr-2 text-green-500"/>
            <AlertDescription>
              Payment of ${displayAmount} completed successfully!
            </AlertDescription>
          </div>
        </Alert>
      )}
      {status === 'processing' && (
        <Alert variant="default">
          <div className="flex items-center">
            <Loader2 className="mr-2 animate-spin" />
            <AlertDescription>Your payment is still processing...</AlertDescription>
          </div>
        </Alert>
      )}
      {status === 'failed' && (
        <Alert variant="destructive">
          <div className="flex items-center">
            <XCircle className="mr-2" />
            <AlertDescription>{error || 'Payment failed. Please try again.'}</AlertDescription>
          </div>
        </Alert>
      )}
    </>
  );
};