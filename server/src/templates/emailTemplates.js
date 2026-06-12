/**
 * RePlate Premium Email Templates
 * Standardized inline CSS styling for high cross-client compatibility (Gmail, Outlook, Apple Mail)
 */

const APP_NAME = 'RePlate';

/**
 * Wraps HTML content in a premium, responsive frame.
 */
export const generateEmailWrapper = (contentHtml, preheaderText = '') => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${APP_NAME}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #FAFAF8;
            color: #111827;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          a {
            color: #10b981;
            text-decoration: none;
          }
          .btn:hover {
            background-color: #047857 !important;
          }
        </style>
      </head>
      <body style="background-color: #FAFAF8; color: #111827; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px 10px;">
        <!-- Hidden Preheader Text for Email Client Previews -->
        <div style="display: none; max-height: 0px; overflow: hidden;">
          ${preheaderText}
        </div>
        
        <!-- Main Email Container -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" max-width="600px" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin: 0 auto;">
          <!-- Top Accent Line -->
          <tr>
            <td height="6" style="background-color: #10b981; line-height: 6px; font-size: 6px;">&nbsp;</td>
          </tr>
          
          <!-- Header Area -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <!-- Custom Premium HTML Logo -->
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <span style="display: inline-block; background-color: #10b981; color: #ffffff; width: 44px; height: 44px; line-height: 44px; text-align: center; border-radius: 12px; font-weight: bold; font-size: 22px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);">🌿</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 700; color: #1F5A3A; letter-spacing: -0.5px;">RePlate</span>
                          <div style="font-size: 10px; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px;">Nourish & Save</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider Line -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="border-top: 1px solid #F3F4F6;"></div>
            </td>
          </tr>
          
          <!-- Main Body Content -->
          <tr>
            <td style="padding: 24px 32px 32px 32px;">
              ${contentHtml}
            </td>
          </tr>
          
          <!-- Footer Area -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 24px 32px; border-top: 1px solid #F3F4F6; text-align: center;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1F5A3A;">🌿 RePlate Sustainability Network</p>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #6B7280; line-height: 18px;">
                Connecting commercial surplus food with local shelters and NGOs. Together, we mitigate greenhouse emissions and protect communities.
              </p>
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                <tr>
                  <td style="font-size: 12px; color: #9CA3AF;">
                    Need help? Contact support or manage notifications in your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/settings" style="color: #10b981; font-weight: 500;">Settings</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

/**
 * Urgency color badge generator helper
 */
const getUrgencyBadge = (level) => {
  const normalized = String(level).toLowerCase();
  let bg = '#eff6ff';
  let color = '#2563eb';
  let label = 'Low';

  if (normalized === 'critical') {
    bg = '#fef2f2';
    color = '#dc2626';
    label = '🚨 Critical';
  } else if (normalized === 'high') {
    bg = '#fff7ed';
    color = '#ea580c';
    label = '⚠️ High';
  } else if (normalized === 'medium') {
    bg = '#fefce8';
    color = '#ca8a04';
    label = '🟡 Medium';
  } else {
    bg = '#f0fdf4';
    color = '#16a34a';
    label = '🟢 Low';
  }

  return `<span style="display: inline-block; background-color: ${bg}; color: ${color}; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${label}</span>`;
};

/**
 * Storage condition display label helper
 */
const getStorageLabel = (condition) => {
  switch (condition) {
    case 'room_temp': return '🌡️ Room Temp';
    case 'refrigerated': return '❄️ Refrigerated';
    case 'frozen': return '🥶 Frozen';
    case 'heated': return '🔥 Heated';
    default: return '📦 Standard';
  }
};

/**
 * Template 1: Donation Alert (NGO)
 */
export const donationAlertTemplate = (donation) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const claimUrl = `${clientUrl}/donations/${donation.id}`;
  
  // Format freshness score
  const freshnessScore = donation.aiFreshnessScore;
  const scoreHtml = freshnessScore !== undefined && freshnessScore !== null
    ? `
      <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="vertical-align: middle; width: 42px;">
              <span style="display: inline-block; background-color: #14b8a6; color: white; width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 50%; font-weight: bold; font-size: 13px;">AI</span>
            </td>
            <td style="vertical-align: middle;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #0f766e;">Gemini Vision Quality Audit Passed</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #115e59;">Freshness Score: <strong>${freshnessScore}/100</strong></p>
            </td>
          </tr>
        </table>
      </div>
    `
    : '';

  return generateEmailWrapper(`
    <h2 style="color: #1F5A3A; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.2px;">🌿 New Food Donation Nearby!</h2>
    <p style="font-size: 14px; line-height: 22px; color: #4B5563; margin-top: 0; margin-bottom: 20px;">
      A commercial food donor has just posted a surplus food listing near your area. Details are listed below:
    </p>

    ${scoreHtml}

    <div style="background-color: #FAFAF8; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin-top: 0; margin-bottom: 14px; font-size: 16px; font-weight: 700; color: #111827;">${donation.foodName}</h3>
      
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280; width: 120px;">📦 Quantity</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827;">${donation.quantity}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">🏷️ Category</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #111827; text-transform: capitalize;">${String(donation.category || 'other').replace('_', ' ')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">🌡️ Storage</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #111827;">${getStorageLabel(donation.storageCondition)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">⏰ Expires</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #b91c1c;">${donation.expiryDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">📍 Location</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 500; color: #4B5563; line-height: 18px;">${donation.location}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0 0 0; font-size: 13px; color: #6B7280;">⚡ Urgency</td>
          <td style="padding: 10px 0 0 0;">${getUrgencyBadge(donation.urgencyLevel)}</td>
        </tr>
      </table>
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="${claimUrl}" class="btn" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: background-color 0.2s;">
            Claim This Donation
          </a>
        </td>
      </tr>
    </table>
  `, `🍽️ New food donation available: ${donation.foodName} (${donation.quantity})`);
};

/**
 * Template 2: Expiry Warning (Donor)
 */
export const expiryWarningTemplate = (donation) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const donationUrl = `${clientUrl}/donations/${donation.id}`;

  return generateEmailWrapper(`
    <h2 style="color: #ea580c; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.2px;">⚠️ Listing Expiring Soon</h2>
    <p style="font-size: 14px; line-height: 22px; color: #4B5563; margin-top: 0; margin-bottom: 20px;">
      Your active food listing hasn't been claimed yet and is approaching its expiration window. To avoid waste, consider sharing details with nearby shelters or updating your listing.
    </p>

    <div style="background-color: #fffbeb; border: 1px solid #fef08a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin-top: 0; margin-bottom: 14px; font-size: 16px; font-weight: 700; color: #854d0e;">${donation.foodName}</h3>
      
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #854d0e; width: 120px;">⏰ Expires</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #b91c1c;">${donation.expiryDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #854d0e;">📦 Quantity</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827;">${donation.quantity}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #854d0e;">📍 Pickup Location</td>
          <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">${donation.location}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0 0 0; font-size: 13px; color: #854d0e;">⚡ Urgency</td>
          <td style="padding: 10px 0 0 0;">${getUrgencyBadge(donation.urgencyLevel || 'high')}</td>
        </tr>
      </table>
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="${donationUrl}" class="btn" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2); transition: background-color 0.2s;">
            Manage Your Listing
          </a>
        </td>
      </tr>
    </table>
  `, `⚠️ Warning: Your listing "${donation.foodName}" is expiring soon.`);
};

/**
 * Template 3: Claim Confirmation (Donor)
 */
export const claimConfirmationDonorTemplate = (donation, claim) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const donationUrl = `${clientUrl}/donations/${donation.id}`;
  
  // Eco Handprints Box
  let ecoHtml = '';
  if (donation.metrics) {
    const { mealsSaved, co2Reduced, waterSaved } = donation.metrics;
    ecoHtml = `
      <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">🌱 Your Environmental Handprint Impact</h4>
        <p style="margin: 0 0 16px 0; font-size: 12px; color: #14532d;">By donating this food, you will prevent valuable resources from going to landfills:</p>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="width: 33%;">
              <div style="font-size: 20px; margin-bottom: 4px;">🍽️</div>
              <div style="font-size: 14px; font-weight: 700; color: #15803d;">${mealsSaved}</div>
              <div style="font-size: 10px; color: #166534;">Meals Rescued</div>
            </td>
            <td align="center" style="width: 33%; border-left: 1px solid #bbf7d0; border-right: 1px solid #bbf7d0;">
              <div style="font-size: 20px; margin-bottom: 4px;">🌳</div>
              <div style="font-size: 14px; font-weight: 700; color: #15803d;">${co2Reduced} kg</div>
              <div style="font-size: 10px; color: #166534;">CO₂ Saved</div>
            </td>
            <td align="center" style="width: 33%;">
              <div style="font-size: 20px; margin-bottom: 4px;">💧</div>
              <div style="font-size: 14px; font-weight: 700; color: #15803d;">${waterSaved} L</div>
              <div style="font-size: 10px; color: #166534;">Water Saved</div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  return generateEmailWrapper(`
    <h2 style="color: #1F5A3A; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.2px;">✅ Donation Successfully Claimed!</h2>
    <p style="font-size: 14px; line-height: 22px; color: #4B5563; margin-top: 0; margin-bottom: 20px;">
      Great news! The NGO <strong>${claim.ngoName}</strong> has claimed your food listing. They are coordinates to pick it up.
    </p>

    <div style="background-color: #FAFAF8; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin-top: 0; margin-bottom: 14px; font-size: 16px; font-weight: 700; color: #111827;">${donation.foodName}</h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280; width: 120px;">🤝 Claimed By</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #1F5A3A;">${claim.ngoName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">📦 Quantity</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #111827;">${donation.quantity || 'Available'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">⏰ Best Before</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #b91c1c;">${donation.expiryDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">📍 Pickup Location</td>
          <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">${donation.location}</td>
        </tr>
      </table>
    </div>

    ${ecoHtml}

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="${donationUrl}" class="btn" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: background-color 0.2s;">
            View Donation Status
          </a>
        </td>
      </tr>
    </table>
  `, `🎉 Great news! Your donation "${donation.foodName}" has been claimed.`);
};

/**
 * Template 4: Claim Confirmation (NGO)
 */
export const claimConfirmationNgoTemplate = (donation, claim) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const claimUrl = `${clientUrl}/claims`;

  // Eco Handprints Box
  let ecoHtml = '';
  if (donation.metrics) {
    const { mealsSaved, co2Reduced, waterSaved } = donation.metrics;
    ecoHtml = `
      <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">🌿 Environmental Handprint Impact</h4>
        <p style="margin: 0 0 16px 0; font-size: 12px; color: #14532d;">Rescuing this food prevents carbon emissions and conserves natural water resources:</p>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="width: 33%;">
              <div style="font-size: 20px; margin-bottom: 4px;">🍽️</div>
              <div style="font-size: 14px; font-weight: 700; color: #15803d;">${mealsSaved}</div>
              <div style="font-size: 10px; color: #166534;">Meals Rescued</div>
            </td>
            <td align="center" style="width: 33%; border-left: 1px solid #bbf7d0; border-right: 1px solid #bbf7d0;">
              <div style="font-size: 20px; margin-bottom: 4px;">🌳</div>
              <div style="font-size: 14px; font-weight: 700; color: #15803d;">${co2Reduced} kg</div>
              <div style="font-size: 10px; color: #166534;">CO₂ Offset</div>
            </td>
            <td align="center" style="width: 33%;">
              <div style="font-size: 20px; margin-bottom: 4px;">💧</div>
              <div style="font-size: 14px; font-weight: 700; color: #15803d;">${waterSaved} L</div>
              <div style="font-size: 10px; color: #166534;">Water Saved</div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  return generateEmailWrapper(`
    <h2 style="color: #1F5A3A; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.2px;">✅ Claim Confirmation</h2>
    <p style="font-size: 14px; line-height: 22px; color: #4B5563; margin-top: 0; margin-bottom: 20px;">
      You have successfully claimed <strong>${donation.foodName}</strong>. Please coordinate pickup and ensure the food is collected before it expires.
    </p>

    <div style="background-color: #FAFAF8; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin-top: 0; margin-bottom: 14px; font-size: 16px; font-weight: 700; color: #111827;">${donation.foodName}</h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280; width: 120px;">📍 Pickup Location</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827; line-height: 18px;">${donation.location}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">👤 Donor Contact</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #10b981;"><a href="mailto:${donation.donorContact}" style="color: #10b981; font-weight: 600; text-decoration: underline;">${donation.donorContact}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6B7280;">⏰ Expires By</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #b91c1c;">${donation.expiryDate}</td>
        </tr>
      </table>
    </div>

    ${ecoHtml}

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="${claimUrl}" class="btn" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: background-color 0.2s;">
            Manage Your Claims
          </a>
        </td>
      </tr>
    </table>
  `, `✅ Claim Confirmed: ${donation.foodName}`);
};

/**
 * Template 5: Welcome Email (New User onboarding)
 */
export const welcomeTemplate = (profile) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const isDonor = String(profile.role).toLowerCase() === 'donor';
  
  // Custom Flow Content based on role
  let roleTitle = '';
  let flowDescription = '';
  let flowSteps = '';
  let ctaText = '';
  let ctaPath = '';

  if (isDonor) {
    roleTitle = 'Food Hero (Donor)';
    ctaText = 'Donate Surplus Food';
    ctaPath = `${clientUrl}/donate`;
    flowDescription = `
      As a donor, you are now equipped to redirect surplus food from landfills directly to those who need it. 
      Your dashboard lets you list food quickly, run quality reports using AI, and track your ecological handprints.
    `;
    flowSteps = `
      <li style="margin-bottom: 12px; font-size: 14px; line-height: 20px; color: #4B5563;">
        🎙️ <strong>Voice Listing:</strong> Tap the Microphone icon to list your food with natural voice commands in English or 10 regional Indian languages.
      </li>
      <li style="margin-bottom: 12px; font-size: 14px; line-height: 20px; color: #4B5563;">
        🧠 <strong>AI Freshness Audits:</strong> Upload a photo of the food. Google Gemini AI will inspect the photo to generate an objective freshness score (0-100) and shelf-life estimates.
      </li>
      <li style="margin-bottom: 12px; font-size: 14px; line-height: 20px; color: #4B5563;">
        📊 <strong>Impact Logs:</strong> Watch your dashboard convert saved weight into tangible environmental offsets, like CO₂ reduced and water saved!
      </li>
    `;
  } else {
    roleTitle = 'Food Rescue Partner (NGO)';
    ctaText = 'Find Food Near You';
    ctaPath = `${clientUrl}/available`;
    flowDescription = `
      As an NGO/shelter, you represent the essential link that delivers rescued food to communities in need. 
      Your dashboard features live maps and filters to quickly track down and claim available food.
    `;
    flowSteps = `
      <li style="margin-bottom: 12px; font-size: 14px; line-height: 20px; color: #4B5563;">
        🗺️ <strong>Interactive Map:</strong> Open the "Find Food" tab to view active donations visually on our regional map with live navigation instructions.
      </li>
      <li style="margin-bottom: 12px; font-size: 14px; line-height: 20px; color: #4B5563;">
        🔔 <strong>Real-time Alerts:</strong> Receive instant browser and email alerts whenever food is listed within your city limits.
      </li>
      <li style="margin-bottom: 12px; font-size: 14px; line-height: 20px; color: #4B5563;">
        📋 <strong>Easy Claim Scheduling:</strong> Claim listings with a single click and organize convenient pickup times directly with the donor.
      </li>
    `;
  }

  const nameGreeting = profile.firstName ? ` ${profile.firstName}` : '';

  return generateEmailWrapper(`
    <h2 style="color: #1F5A3A; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 8px; letter-spacing: -0.3px;">Welcome to RePlate,${nameGreeting}! 👋</h2>
    <span style="display: inline-block; background-color: #ecfdf5; color: #047857; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 20px;">Role: ${roleTitle}</span>
    
    <p style="font-size: 14px; line-height: 22px; color: #4B5563; margin-top: 0; margin-bottom: 20px;">
      ${flowDescription}
    </p>

    <div style="background-color: #FAFAF8; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px 20px 8px 20px; margin-bottom: 28px;">
      <h4 style="margin-top: 0; margin-bottom: 14px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">🚀 Getting Started Quick Tips</h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${flowSteps}
      </ul>
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="${ctaPath}" class="btn" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: background-color 0.2s;">
            ${ctaText}
          </a>
        </td>
      </tr>
    </table>
  `, `Welcome to RePlate! Get started on your path to save food waste.`);
};
