import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';  // Import the existing client

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export const createPaymentIntent = async (amount: number) => {
  try {

    const amountInCents = Math.round(amount * 100);




      console.log('Creating payment intent for amount (in cents):', amountInCents);
    
    // Get current user from the already imported supabase client
    const { data: { user } } = await supabase.auth.getUser();    
    if (!user) {
      throw new Error('User must be logged in to make a payment');
    }

    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, 
      currency: 'usd',
      metadata: {
        userId: user.id,
        originalAmount: amount.toString(), // Store original amount
        amountInCents: amountInCents.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create a record in the payments table
    const { error: insertError } = await supabase
      .from('payments')
      .insert([
        {
          payment_intent: paymentIntent.id,
          user_id: user.id,
          amount: amount,
          status: 'pending', // Set initial status to pending
        },
      ]);

    if (insertError) {
      console.error('Error inserting payment record:', insertError);
      throw insertError; // Handle the error appropriately
    }

    console.log('Payment intent created:', paymentIntent.id);
    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error; // Re-throw the error for handling in the calling function
  }
};