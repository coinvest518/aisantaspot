// api/webhook.ts
import { Request, Response } from 'express';
import { handleStripeWebhook } from './stripe-webhook';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const signature = req.headers['stripe-signature'] as string;

  try {
    const result = await handleStripeWebhook(signature, req.body);
    res.json(result);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}