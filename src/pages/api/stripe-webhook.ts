import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
);
export async function handleStripeWebhook(signature: string, rawBody: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || ''
    );
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const amount = paymentIntent.amount / 100; // Convert from cents to dollars
      const userId = paymentIntent.metadata.userId;
      
      // Start a Supabase transaction to handle both operations
      const { data: user, error: userError } = await supabase
        .from('users') // Assuming you have a users table
        .select('earnings')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        throw userError;
      }

      // Insert contribution
      const { error: contributionError } = await supabase
        .from('pot_contributions')
        .insert([
          {
            amount: amount,
            user_id: userId,
            stripe_payment_id: paymentIntent.id,
            status: 'completed'
          }
        ]);

      if (contributionError) {
        console.error('Error inserting contribution:', contributionError);
        throw contributionError;
      }

      // Update user's earnings
      const newEarnings = (user?.earnings || 0) + amount;
      const { error: updateError } = await supabase
        .from('users')
        .update({ earnings: newEarnings })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating earnings:', updateError);
        throw updateError;
      }

      console.log(`Payment successful: ${paymentIntent.id}`);
      return { received: true };
    }
    return { received: true };
  } catch (err) {
    console.error('Error processing webhook:', err);
    throw err;
  }
}