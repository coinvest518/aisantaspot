// api/create-payment/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  try {
    const { amount, currency = 'usd' } = await req.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        origin: req.headers.get('origin') || 'unknown',
      },
    });

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Payment creation error:', err);
    return new Response(JSON.stringify({
      error: err.message,
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}