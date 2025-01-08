// src/api/webhook.ts
import express, { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

const app = express();

app.post('/api/webhook', 
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {  // Explicitly type the handler
    const sig = req.headers['stripe-signature'];
    const endpointSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
        console.error('Missing signature or webhook secret');
        res.status(400).send('Missing signature or webhook secret');
        return;  // Make sure to return after sending response
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );

        console.log('✅ Webhook verified:', event.type);

    } catch (err: any) {
        console.error('❌ Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;  // Make sure to return after sending response
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log('💰 PaymentIntent successful:', paymentIntent.id);
                // Handle successful payment
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object as Stripe.PaymentIntent;
                console.log('❌ Payment failed:', failedPayment.id);
                // Handle failed payment
                break;

            case 'charge.succeeded':
                const charge = event.data.object as Stripe.Charge;
                console.log('💵 Charge successful:', charge.id);
                // Handle successful charge
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true, type: event.type });
        return;  // Make sure to return after sending response

    } catch (err: any) {
        console.error('Error processing webhook:', err);
        res.status(500).send(`Server Error: ${err.message}`);
        return;  // Make sure to return after sending response
    }
});

export const webhookHandler = app;