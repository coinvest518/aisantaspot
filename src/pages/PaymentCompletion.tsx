import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '../lib/useUser';
import { AppSidebar } from '../components/AppSidebar';
import { Button } from '@/components/ui/button';
import { PaymentStatus } from '../components/PaymentStatus';
import { usePaymentProcessing } from '../hooks/usePaymentProcessing';
import { Loader2 } from 'lucide-react';

const PaymentCompletion: React.FC = () => {
    const { user } = useUser();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    
    useEffect(() => {
        if (!paymentIntent || !redirectStatus) {
            navigate('/payments');
        }
    }, [paymentIntent, redirectStatus, navigate]);

    const { status, error, paymentAmount, isLoading } = usePaymentProcessing(
        paymentIntent,
        redirectStatus,
        user?.id ?? null
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

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
