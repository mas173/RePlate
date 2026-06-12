/**
 * Email Service - Handles sending emails via Resend
 *
 * Templates:
 * - Donation alerts (new food available)
 * - Claim confirmations
 * - Expiry warnings
 * - Welcome emails
 */

import resend from '../config/resend.js';
import {
  donationAlertTemplate,
  expiryWarningTemplate,
  claimConfirmationDonorTemplate,
  claimConfirmationNgoTemplate,
  welcomeTemplate
} from '../templates/emailTemplates.js';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_NAME = 'RePlate';

/**
 * Send a welcome email to a newly signed up user after role onboarding
 */
export const sendWelcomeEmail = async (userEmail, userProfile) => {
  try {
    const html = welcomeTemplate(userProfile);
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: userEmail,
      subject: `👋 Welcome to RePlate - Let's Reduce Food Waste Together!`,
      html,
    });
    console.log(`Welcome email successfully sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
    throw error; // Propagate to caller so metadata isn't marked sent prematurely
  }
};

/**
 * Send a donation alert to nearby NGOs
 */
export const sendDonationAlert = async (ngoEmail, donation) => {
  try {
    const html = donationAlertTemplate(donation);
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: ngoEmail,
      subject: `🌿 New Food Donation Available: ${donation.foodName}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send donation alert:', error.message);
  }
};

/**
 * Send an expiry warning to the donor
 */
export const sendExpiryWarning = async (donorEmail, donation) => {
  try {
    const html = expiryWarningTemplate(donation);
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: donorEmail,
      subject: `⚠️ Listing Expiring Soon: ${donation.foodName}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send expiry warning:', error.message);
  }
};

/**
 * Send claim confirmation to both donor and NGO
 */
export const sendClaimConfirmation = async (donorEmail, ngoEmail, donation, claim) => {
  try {
    // Notify donor
    const donorHtml = claimConfirmationDonorTemplate(donation, claim);
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: donorEmail,
      subject: `✅ Your Donation Was Claimed - ${donation.foodName}`,
      html: donorHtml,
    });

    // Notify NGO
    const ngoHtml = claimConfirmationNgoTemplate(donation, claim);
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: ngoEmail,
      subject: `✅ Claim Confirmed - ${donation.foodName}`,
      html: ngoHtml,
    });
  } catch (error) {
    console.error('Failed to send claim confirmation:', error.message);
  }
};

export default { sendDonationAlert, sendExpiryWarning, sendClaimConfirmation, sendWelcomeEmail };

