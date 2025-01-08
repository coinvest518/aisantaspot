import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe with current supported API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia', // Update to current supported version
});

// Configure API for raw body handling
export const config = {
    api: {
        bodyParser: false,
        externalResolver: true, // Add this for Vercel
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

        req.on('error', reject);
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, stripe-signature'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verify HTTP method
    if (req.method !== 'POST') {
        console.error(`[Webhook] Invalid method: ${req.method}`);
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'This endpoint only accepts POST requests'
        });
    }

    try {
        // Log incoming request
        console.log(`[Webhook] Request received at ${new Date().toISOString()}`, {
            method: req.method,
            headers: {
                'content-type': req.headers['content-type'],
                'stripe-signature': req.headers['stripe-signature'] ? 'present' : 'missing'
            }
        });

        // Get the raw body
        const rawBody = await getRawBody(req);

        // Verify Stripe signature
        const sig = req.headers['stripe-signature'];
        if (!sig) {
            console.error('[Webhook] No Stripe signature found');
            return res.status(400).json({ error: 'No Stripe signature found' });
        }

        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!endpointSecret) {
            console.error('[Webhook] Missing STRIPE_WEBHOOK_SECRET environment variable');
            return res.status(500).json({ error: 'Webhook secret not configured' });
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        } catch (err: any) {
            console.error(`[Webhook] Signature verification failed:`, err.message);
            return res.status(400).json({ error: err.message });
        }

        // Process the event
        console.log(`[Webhook] Processing event: ${event.type}`);
        
        switch (event.type) {
            case 'charge.succeeded':
                const charge = event.data.object as Stripe.Charge;
                await handleChargeSucceeded(charge);
                break;

            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentIntentSucceeded(paymentIntent);
                break;

            case 'payment_intent.created':
                const createdIntent = event.data.object as Stripe.PaymentIntent;
                console.log('[Webhook] Payment intent created:', {
                    intentId: createdIntent.id,
                    amount: createdIntent.amount,
                    currency: createdIntent.currency
                });
                break;

            default:
                console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        // Return success response
        return res.status(200).json({ received: true, type: event.type });

    } catch (err: any) {
        console.error('[Webhook] Unexpected error:', err);
        return res.status(500).json({
            error: 'Internal server error',
            message: err.message
        });
    }
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
    console.log('[Webhook] Processing charge.succeeded:', {
        chargeId: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status
    });
    // Add your charge processing logic here
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('[Webhook] Processing payment_intent.succeeded:', {
        intentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
    });
    // Add your payment intent processing logic here
}