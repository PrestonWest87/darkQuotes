/**
 * subscriptions.js
 *
 * This module implements recurring subscription functionality using Stripe.
 * It includes endpoints to create a subscription and handle webhook events.
 *
 * To use:
 *  - Install Stripe: npm install stripe
 *  - Set the environment variables STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
 *  - Optionally, set PRICE_ID in your environment.
 *
 * On successful subscription creation or via webhook events, the user record is updated
 * to mark them as paid and store the Stripe customer ID.
 *
 * Author: Preston West <prestonwest87@gmail.com>
 * License: Proprietary – All rights reserved by Preston West.
 */

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const db = require('./db');

// Endpoint to create a new customer and subscription
router.post('/create-subscription', async (req, res) => {
  try {
    const { email, payment_method, priceId } = req.body;
    const subscriptionPriceId = priceId || process.env.PRICE_ID;
    if (!email || !payment_method || !subscriptionPriceId) {
      return res.status(400).json({ error: 'Missing required fields: email, payment_method, and priceId.' });
    }

    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: email,
      payment_method: payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: subscriptionPriceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Update the user in our database (if exists) to mark as paying and store the stripe_customer_id.
    const user = await db.getUserByEmail(email);
    if (user) {
      user.stripe_customer_id = customer.id;
      user.isPaying = true;
      await db.updateUser(user);
    }

    res.json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(400).json({ error: error.message });
  }
});

// Endpoint to handle Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created': {
      const subscription = event.data.object;
      console.log(`Subscription created: ${subscription.id}`);
      try {
        const customer = await stripe.customers.retrieve(subscription.customer);
        const user = await db.getUserByEmail(customer.email);
        if (user) {
          user.stripe_customer_id = customer.id;
          user.isPaying = true;
          await db.updateUser(user);
          console.log(`User ${user.email} marked as paying.`);
        }
      } catch (err) {
        console.error('Error updating user on subscription event:', err);
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      console.log(`Invoice payment succeeded for customer: ${invoice.customer}`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
