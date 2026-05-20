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

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_NAME = 'RePlate';

/**
 * Send a donation alert to nearby NGOs
 */
export const sendDonationAlert = async (ngoEmail, donation) => {
  try {
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: ngoEmail,
      subject: `🍽️ New Food Donation Available - ${donation.foodName}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New Food Donation Available!</h2>
          <p>A new food donation has been posted near your area:</p>
          <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px;">${donation.foodName}</h3>
            <p style="margin: 4px 0;">📦 Quantity: ${donation.quantity}</p>
            <p style="margin: 4px 0;">⏰ Expires: ${donation.expiryDate}</p>
            <p style="margin: 4px 0;">📍 Location: ${donation.location}</p>
            <p style="margin: 4px 0;">🟡 Urgency: ${donation.urgencyLevel}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/dashboard/donations/${donation.id}"
             style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Claim This Donation
          </a>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
            You're receiving this because you're registered as an NGO on ${APP_NAME}.
          </p>
        </div>
      `,
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
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: donorEmail,
      subject: `⚠️ Donation Expiring Soon - ${donation.foodName}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">⚠️ Donation Expiring Soon</h2>
          <p>Your donation is expiring soon and hasn't been claimed yet:</p>
          <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px;">${donation.foodName}</h3>
            <p style="margin: 4px 0;">⏰ Expires: ${donation.expiryDate}</p>
            <p style="margin: 4px 0;">📦 Quantity: ${donation.quantity}</p>
          </div>
          <p>Consider updating the listing or reaching out to nearby NGOs.</p>
        </div>
      `,
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
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: donorEmail,
      subject: `✅ Your Donation Was Claimed - ${donation.foodName}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ Donation Claimed!</h2>
          <p>Great news! Your donation "${donation.foodName}" has been claimed by ${claim.ngoName}.</p>
          <p>They will arrange pickup at the scheduled time.</p>
        </div>
      `,
    });

    // Notify NGO
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: ngoEmail,
      subject: `✅ Claim Confirmed - ${donation.foodName}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ Claim Confirmed!</h2>
          <p>You've successfully claimed "${donation.foodName}".</p>
          <p>Please arrange pickup before ${donation.expiryDate}.</p>
          <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;">📍 Pickup Location: ${donation.location}</p>
            <p style="margin: 4px 0;">👤 Donor Contact: ${donation.donorContact || 'Available in app'}</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send claim confirmation:', error.message);
  }
};

export default { sendDonationAlert, sendExpiryWarning, sendClaimConfirmation };
