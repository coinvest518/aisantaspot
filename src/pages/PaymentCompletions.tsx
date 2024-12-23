import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '../lib/useUser';
import { AppSidebar } from '../components/AppSidebar';
import { Button } from '@/components/ui/button';
import { PaymentStatus } from '../components/PaymentStatus';
import { usePaymentProcessing } from '../hooks/usePaymentProcessing';

const PaymentCompletion: React.FC = () => {
    const { user } = useUser();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    
    const { status, error, paymentAmount } = usePaymentProcessing(
      paymentIntent,
      redirectStatus,
      user?.id ?? null
    );

    return (
        <div className="flex">
            <AppSidebar />
            <div className="flex-grow p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PaymentStatus 
                          status={status}
                          error={error}
                          paymentAmount={paymentAmount}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default PaymentCompletion;