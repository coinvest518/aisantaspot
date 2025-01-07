// /api/webhook/index.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe with correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

// Disable body parsing, need raw body for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to get raw body as buffer
async function getRawBody(req: VercelRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        req.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        req.on('error', (err) => {
            reject(err);
        });
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Log incoming request
        console.log(`[${new Date().toISOString()}] Webhook received:`, {
            method: req.method,
            url: req.url,
            headers: {
                'content-type': req.headers['content-type'],
                'stripe-signature': req.headers['stripe-signature'] ? 'present' : 'missing'
            }
        });

        // Verify HTTP method
        if (req.method !== 'POST') {
            console.log('Method not allowed:', req.method);
            return res.status(405).json({
                error: 'Method not allowed',
                message: 'This endpoint only accepts POST requests'
            });
        }

        // Get the raw body
        const rawBody = await getRawBody(req);

        // Verify Stripe signature
        const sig = req.headers['stripe-signature'];
        if (!sig) {
            console.error('No Stripe signature found');
            return res.status(400).json({ error: 'No Stripe signature found' });
        }

        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!endpointSecret) {
            console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
            return res.status(500).json({ error: 'Webhook secret not configured' });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                sig,
                endpointSecret
            );
        } catch (err: any) {
            console.error(`Webhook signature verification failed:`, err.message);
            return res.status(400).json({
                error: 'Invalid signature',
                message: err.message
            });
        }

        // Handle different event types
        try {
            switch (event.type) {
                case 'charge.succeeded':
                    const charge = event.data.object as Stripe.Charge;
                    console.log('Charge succeeded:', {
                        chargeId: charge.id,
                        amount: charge.amount,
                        currency: charge.currency,
                        status: charge.status
                    });
                    
                    await handleChargeSucceeded(charge);
                    break;

                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    console.log('Payment intent succeeded:', {
                        intentId: paymentIntent.id,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        status: paymentIntent.status
                    });
                    
                    await handlePaymentIntentSucceeded(paymentIntent);
                    break;

                case 'payment_intent.created':
                    const createdIntent = event.data.object as Stripe.PaymentIntent;
                    console.log('Payment intent created:', {
                        intentId: createdIntent.id,
                        amount: createdIntent.amount,
                        currency: createdIntent.currency
                    });
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            // Return a response to acknowledge receipt of the event
            return res.json({ received: true, type: event.type });

        } catch (err: any) {
            console.error('Error processing webhook:', err);
            return res.status(500).json({
                error: 'Webhook processing failed',
                message: err.message
            });
        }

    } catch (err: any) {
        console.error('Unexpected error:', err);
        return res.status(500).json({
            error: 'Internal server error',
            message: err.message
        });
    }
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
    // Implement your charge.succeeded logic here
    console.log('Processing charge.succeeded:', charge.id);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Implement your payment_intent.succeeded logic here
    console.log('Processing payment_intent.succeeded:', paymentIntent.id);
}