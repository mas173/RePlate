<img width="4320" height="1440" alt="hh26 main poster 2 with sponsors 3x1 (4320 x 1440 px) (2)" src="https://github.com/user-attachments/assets/c698b2cd-da84-4cb0-9276-125c6a7244aa" />

# 🌿 RePlate

> An AI-Powered Food Waste Reduction & Redistribution Platform connecting commercial food donors with shelters and NGOs using voice commands, maps, and vision analysis.

---

## 📌 Problem & Domain

Commercial venues (restaurants, hostels, hotels, event organizers) generate massive volumes of edible surplus food daily. Most of this food goes directly to landfills because:
1. Donors lack a quick, seamless channel to list donation details while managing busy operations.
2. NGOs and shelters struggle to locate available donations in their vicinity in real-time.
3. Evaluating food quality, safety, and expiration urgency is often manual and subjective.

This project addresses this coordination gap by creating an automated, intelligent redistribution pipeline using AI vision analysis for freshness, location mapping, and voice-enabled accessibility.

**Themes Selected (at least one):**
- [ ] Human Experience & Productivity  
- [x] Climate & Sustainability Systems  
- [ ] HealthTech & Bio Platforms  
- [ ] Learning & Knowledge Systems  
- [ ] Work, Finance & Digital Economy  
- [x] Infrastructure, Mobility & Smart Systems  
- [ ] Trust, Identity & Security  
- [ ] Media, Social & Interactive Platforms  
- [X] Public Systems, Governance and Civic Tech  
- [ ] Developer Tools & Software Infrastructure  

---

## 🎯 Objective

RePlate builds an efficient bridge between **food donors** and **NGOs** to ensure surplus food reaches those in need instead of decomposing in landfills.

- **Target Users:** Commercial food donors (hostels, caterers, hotels, restaurants) and NGOs/shelters coordinate distribution.
- **Pain Point:** Complex onboarding forms, language barriers for volunteers, lack of transit tracking, and uncertainty about food freshness.
- **Value Solution Provides:**
  - Immediate food uploading using **Sarvam AI Voice Assistant** (accessible in English & 10 regional Indian languages).
  - Instant freshness analysis via **Google Gemini Vision** models.
  - Interactive regional geolocations powered by **MapTiler** & **React-Leaflet** for easy claim pickup and hotspot auditing.
  - Tangible ecological translation charts (CO₂, water, and land footprint offsets) to motivate stakeholders.

---

## 🧠 Team & Approach

### Team Name:  
`NeuralNexus`

### Team Members:  
- **Vicky Raj**: [[GitHub](https://github.com/mas173)] (Leader)
- **Ankita Kumari**: [[GitHub](https://github.com/Ankita15k)] 

### Our Approach:
- **Why this problem:** Food waste accounts for nearly 8-10% of global greenhouse emissions. Providing a low-barrier-to-entry digital tool is the fastest way to mobilize commercial businesses.
- **Key challenges addressed:** 
  - *Data Extraction from Voice:* Standardizing speech inputs into valid JSON formatting using Gemini intents.
  - *Reliable Geocoding:* Developing an in-memory geocoding cache with interval throttling to query coordinates via MapTiler.
  - *Transactional Rollbacks:* Evicting Supabase storage media if database validation fails.
- **Pivots & Breakthroughs:** Transitioned from text forms to voice-activated assistance to optimize onboarding for workers in busy kitchen environments.

---

## 🛠️ Tech Stack

### Core Technologies Used:
- **Frontend:** React 19, Vite 8, Tailwind CSS 3.4, React Router 7, Recharts, Framer Motion, React-Leaflet
- **Backend:** Node.js, Express.js 4, Clerk Express, Multer, Node-cron
- **Database:** Supabase PostgreSQL (Row-Level Security, Custom RPC Functions)
- **APIs:** Google Gemini AI API, Sarvam AI Voice APIs (Saaras STT, Bulbul TTS), MapTiler Geocoding API, Resend Transactional Mail API
- **Hosting:** Netlify (Client), Render/Railway (Server)

### Additional Technologies Used (Optional):
- [x] AI / ML  
- [ ] Web3 / Blockchain  
- [ ] Cyber Security 
- [x] Cloud  

---

## 🏆 Sponsored Track (Optional)

Select if your project participates in any track:

- [X] **Expo Track** – Built using Expo  
- [ ] **Neo4j Track** – Uses AuraDB as primary database  
- [ ] **Base44 Track** – Prototype/Final Product built using Base44  

Provide a short note on how you used the partner technology:

> We built the RePlate mobile app using **Expo SDK 54** with React Native 0.81.5
> and the New Architecture enabled. **Expo Router 6** powers our file-based
> navigation across Donor, NGO, and Admin flows. We used **expo-image-picker**
> to capture food photos for Gemini Vision AI analysis, **expo-location** for
> real-time GPS-based NGO matching, and **expo-secure-store** with Clerk Expo
> for secure authentication. UI is styled with NativeWind 4 (Tailwind CSS for
> React Native) and **@expo/vector-icons**. The app is shipped via **EAS Build**
> for native binaries and **EAS Update** for OTA(over-the-air) patches - keeping
> Android in sync without full store re-submissions.

---

## ✨ Key Features

- **🗣️ Multilingual Voice Assistant (Sarvam AI)**: Fully integrated voice control using Sarvam AI (`saaras:v3` Speech-to-Text and `bulbul:v3` Text-to-Speech) and Gemini parsing. Enables users to post donations, check claims, and navigate settings in English (Aditya) and 10 regional Indian languages (Meera - Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam, Punjabi, Odia).
- **🧠 Freshness & Urgency Analysis (Google Gemini)**: vision analysis of food images to output an objective freshness score (0-100), shelf life, and safety recommendations, alongside automatic categorization.
- **🗺️ Interactive Geolocation Pickers & Heatmaps**: Built on Leaflet and MapTiler layers. Features current GPS tracking, location picks for donors, listings for NGOs, and supply-vs-demand heatmaps for admins.
- **📊 Ecological Handprints (Recharts)**: Converts surplus weight into gasoline driving mileage offset, phone charges saved, shower minutes conserved, and agricultural area protected.
- **🔔 Resend Alerts & Expiry Crons**: Automated background schedules to expire stale logs and send emails via Resend to nearby NGOs when a donation is posted in their city.

### 🖥️ Landing Page 
<img width="1785" height="908" alt="Screenshot 2026-06-07 141324" src="https://github.com/user-attachments/assets/ec120730-61e8-4e93-9914-00cf29e11d2b" />

### 📊 Donor Dashboard 
<img width="1917" height="910" alt="Screenshot 2026-06-07 144608" src="https://github.com/user-attachments/assets/d447730d-5513-4277-959b-be1772801ac1" />

### 📈 Analytics & Environmental Handprint
<img width="1918" height="921" alt="Screenshot 2026-06-07 144731" src="https://github.com/user-attachments/assets/5d842ecf-e111-4cf0-96af-664b072b64b8" />

### 🗺️ Geographic Hotspot Heatmap & Admin Panel 
<img width="1914" height="904" alt="Screenshot 2026-06-07 141913" src="https://github.com/user-attachments/assets/30218eec-fecd-4d79-99ee-95213982044f" />

---

## 📽️ Demo & Deliverables

- **Demo Video Link (Mandatory):** [Paste link]  
- **Deployment Link (Recommended):** [Here](https://www.getreplate.qzz.io/)  
- **Pitch Deck / PPT (Optional):** [Paste link]

---

## ✅ Tasks & Bonus Checklist

- [ ] All team members completed the mandatory social task  
- [ ] Bonus Task 1 – Badge sharing  
- [ ] Bonus Task 2 – Blog/article  

---

## 🧪 How to Run the Project

### Requirements:
- **Node.js** >= 18.x
- **npm** >= 9.x
- Accounts on Clerk, Supabase, Google AI Studio, Resend, and MapTiler.

### Environment Setup:
Make a copy of env templates for client and server:
```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```
Fill in the parameters (Clerk publishable keys, Supabase credentials, API keys for Gemini, Sarvam, MapTiler, and Resend).

### Database Initialization:
1. Copy the contents of `supabase/migrations/001_initial_schema.sql` into the **SQL Editor** on your Supabase dashboard and run it.
2. In Supabase **Storage**, create a new public bucket called `donation-images`.
3. Set Storage policies: SELECT (allow public `true`) and INSERT (allow `auth.role() = 'authenticated'`).

### Local Setup:
```bash
# Install all dependencies for root, client, and server
npm run install:all

# Run development servers concurrently
npm run dev

# Client page opens on http://localhost:5173
# Server routes map to http://localhost:5000
```

---

## 🧬 Future Scope

- 📈 **Logistics Aggregators**: Integrating local delivery route APIs (e.g. Dunzo, Porter) to automate NGO pickups.
- 🛡️ **Verification Controls**: Linking government organization databases for automated NGO credential validation.
- 🌐 **Enhanced Translations**: Localizing the interface to additional dialects and regional voice navigation tools.

---

## 📎 Resources / Credits

- **Google Gemini API** — Multi-modal vision and text intent classification models.
- **Sarvam AI (Saaras & Bulbul)** — Speech-to-Text-Translate and Text-to-Speech engines.
- **MapTiler Geocoding & Maps** — Vector map tiles and location geocoding API.
- **Resend** — Transactional HTML notification emails.
- **Leaflet & React-Leaflet** — Open-source map wrappers.

---

## 🏁 Final Words

RePlate is built to create an accessible, zero-waste food logistics system. Building this under time pressure taught us more than any classroom could. Handling regional speech variations across 10+ Indian languages, synchronizing live maps with donation state, and ensuring AI safety checks don't slow down urgent pickups - each challenge forced us to think like engineers simultaneously. A special thanks to Google (Gemini), Sarvam AI, MapTiler, Supabase, Clerk, and
Expo for making these tools and features available for us to work with.

---

<div align="center">

✨ **Collaborating for a sustainable, zero-waste future.** 💫

</div>
