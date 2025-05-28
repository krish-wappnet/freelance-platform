import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
  timeout: 30000, // 30 seconds timeout
  maxNetworkRetries: 3, // Retry failed requests up to 3 times
});

export default stripe;
