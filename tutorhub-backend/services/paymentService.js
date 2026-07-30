const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('./logger');

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata
    });
    
    return paymentIntent;
  } catch (error) {
    logger.error(`Payment intent creation failed: ${error.message}`);
    throw error;
  }
};

const processRefund = async (paymentIntentId, amount) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined
    });
    
    return refund;
  } catch (error) {
    logger.error(`Refund failed: ${error.message}`);
    throw error;
  }
};

const calculatePlatformFee = (amount) => {
  const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE) / 100 || 0.15;
  return Math.round(amount * commissionRate * 100) / 100;
};

module.exports = { createPaymentIntent, processRefund, calculatePlatformFee };
