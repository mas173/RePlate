# RePlate Mobile App - Development Roadmap

This document outlines the step-by-step implementation phases for the RePlate mobile application built using Expo and React Native.

---

## Phase 1 - Mobile Foundation & Architecture

Set up the Expo application and connect it to the existing RePlate backend.

| Task ID | Task Description                   | Status    | Details / Location                |
| :------ | :--------------------------------- | :-------- | :-------------------------------- |
| 1.1     | Create Expo application            | Completed | Initialize Expo Router project    |
| 1.2     | Configure TypeScript               | Completed | Shared type safety                |
| 1.3     | Set up NativeWind                  | Completed | Tailwind support for React Native |
| 1.4     | Configure environment variables    | Completed | API URLs and keys                 |
| 1.5     | Configure Clerk Expo SDK           | Completed | Authentication                    |
| 1.6     | Build authentication screens       | Completed | Sign in, sign up, forgot password |
| 1.7     | Build protected route system       | Completed | Mobile auth guards                |
| 1.8     | Configure API service layer        | Completed | Fetch client setup                |
| 1.9     | Configure global state management  | Completed | Zustand store                     |
| 1.10    | Create mobile design system        | Completed | Colors, typography, spacing       |
| 1.11    | Create reusable UI components      | Completed | Buttons, inputs, cards            |
| 1.12    | Configure splash screen & branding | Completed | RePlate branding                  |

---

## Phase 2 - Donor Mobile Experience

Complete donor workflow for mobile users.

| Task ID | Task Description               | Status  | Details / Location          |
| :------ | :----------------------------- | :------ | :-------------------------- |
| 2.1     | Build Donor Dashboard          | Pending | Stats and recent donations  |
| 2.2     | Build food upload flow         | Pending | Multi-step donation form    |
| 2.3     | Integrate camera capture       | Pending | Take food photos            |
| 2.4     | Integrate gallery upload       | Pending | Select existing images      |
| 2.5     | Build AI analysis screen       | Pending | Gemini freshness results    |
| 2.6     | Build My Donations screen      | Pending | Donation history            |
| 2.7     | Build Donation Details screen  | Pending | Full donation information   |
| 2.8     | Build edit donation flow       | Pending | Update donation details     |
| 2.9     | Build donation status timeline | Pending | Track progress              |
| 2.10    | Build impact widget cards      | Pending | Personal contribution stats |

---

## Phase 3 - NGO Mobile Experience

Mobile tools for NGOs.

| Task ID | Task Description                 | Status  | Details / Location           |
| :------ | :------------------------------- | :------ | :--------------------------- |
| 3.1     | Build NGO Dashboard              | Pending | Available donations overview |
| 3.2     | Build donation discovery screen  | Pending | Browse nearby food           |
| 3.3     | Add search and filtering         | Pending | Food categories and urgency  |
| 3.4     | Build claim flow                 | Pending | Claim available donations    |
| 3.5     | Build My Claims screen           | Pending | Claimed donations            |
| 3.6     | Build pickup confirmation flow   | Pending | Pickup verification          |
| 3.7     | Build delivery confirmation flow | Pending | Final delivery step          |
| 3.8     | Build NGO impact dashboard       | Pending | Meals served and metrics     |
| 3.9     | Add offline data caching         | Pending | Better field usability       |
| 3.10    | Optimize low-network experience  | Pending | Rural area support           |

---

## Phase 4 - Maps & Location Intelligence

Mobile-first location features.

| Task ID | Task Description                  | Status  | Details / Location      |
| :------ | :-------------------------------- | :------ | :---------------------- |
| 4.1     | Integrate React Native Maps       | Pending | Mobile maps             |
| 4.2     | Configure GPS permissions         | Pending | Location access         |
| 4.3     | Implement live location detection | Pending | Current user position   |
| 4.4     | Show nearby donations             | Pending | Donation markers        |
| 4.5     | Build donation map view           | Pending | Interactive map         |
| 4.6     | Add urgency-based markers         | Pending | Color-coded priorities  |
| 4.7     | Build route navigation            | Pending | Open directions         |
| 4.8     | Calculate distance metrics        | Pending | Nearby donation ranking |
| 4.9     | Build pickup tracking             | Pending | Live movement tracking  |
| 4.10    | Optimize map performance          | Pending | Marker clustering       |

---

## Phase 5 - Sarvam AI Voice Assistant

Mobile-first conversational AI.

| Task ID | Task Description                   | Status  | Details / Location           |
| :------ | :--------------------------------- | :------ | :--------------------------- |
| 5.1     | Integrate Sarvam APIs              | Pending | Voice services               |
| 5.2     | Create floating AI assistant       | Pending | Global mobile assistant      |
| 5.3     | Implement speech-to-text           | Pending | Voice transcription          |
| 5.4     | Implement language detection       | Pending | Automatic language selection |
| 5.5     | Build conversational donation flow | Pending | Voice-driven form filling    |
| 5.6     | Auto-extract food details          | Pending | Quantity, expiry, location   |
| 5.7     | Auto-fill donation forms           | Pending | Structured output            |
| 5.8     | Implement multilingual support     | Pending | Indian languages             |
| 5.9     | Add text-to-speech responses       | Pending | Voice feedback               |
| 5.10    | Build NGO voice queries            | Pending | Voice search for donations   |
| 5.11    | Add accessibility mode             | Pending | Low-literacy support         |
| 5.12    | Test multilingual workflows        | Pending | QA and validation            |

---

## Phase 6 - Notifications, Analytics & Impact

Complete mobile engagement layer.

| Task ID | Task Description                | Status  | Details / Location            |
| :------ | :------------------------------ | :------ | :---------------------------- |
| 6.1     | Configure Expo Notifications    | Pending | Push notifications            |
| 6.2     | Build notification center       | Pending | Mobile inbox                  |
| 6.3     | Add donation alerts             | Pending | Nearby donation notifications |
| 6.4     | Add claim alerts                | Pending | NGO updates                   |
| 6.5     | Build personal analytics screen | Pending | User impact metrics           |
| 6.6     | Build charts and graphs         | Pending | Mobile analytics              |
| 6.7     | Build leaderboard screens       | Pending | Top donors and NGOs           |
| 6.8     | Build profile management        | Pending | User settings                 |
| 6.9     | Build preferences screen        | Pending | Notification settings         |
| 6.10    | Add dark mode support           | Pending | Theme switching               |

---

## Phase 7 - Production Readiness

Prepare for Play Store launch.

| Task ID | Task Description            | Status  | Details / Location     |
| :------ | :-------------------------- | :------ | :--------------------- |
| 7.1     | Add loading skeletons       | Pending | Better UX              |
| 7.2     | Add empty states            | Pending | Better UX              |
| 7.3     | Add error boundaries        | Pending | Crash prevention       |
| 7.4     | Optimize performance        | Pending | Faster app startup     |
| 7.5     | Test Android devices        | Pending | Multiple screen sizes  |
| 7.6     | Test authentication flows   | Pending | Security validation    |
| 7.7     | Test AI workflows           | Pending | Sarvam & Gemini QA     |
| 7.8     | Test maps workflows         | Pending | Location validation    |
| 7.9     | Conduct accessibility audit | Pending | Inclusive design       |
| 7.10    | End-to-end testing          | Pending | Full system validation |

---

## Phase 8 - Mobile Deployment

Release the app.

| Task ID | Task Description              | Status  | Details / Location       |
| :------ | :---------------------------- | :------ | :----------------------- |
| 8.1     | Configure EAS Build           | Pending | Expo build service       |
| 8.2     | Generate Android APK          | Pending | Internal testing         |
| 8.3     | Generate Android AAB          | Pending | Play Store package       |
| 8.4     | Create Play Store listing     | Pending | Screenshots and metadata |
| 8.5     | Configure privacy policy      | Pending | Store compliance         |
| 8.6     | Internal testing release      | Pending | Closed testing           |
| 8.7     | Fix beta feedback             | Pending | Improvements             |
| 8.8     | Submit to Play Store          | Pending | Production release       |
| 8.9     | Monitor crashes and analytics | Pending | Post-launch              |
| 8.10    | Plan future iOS release       | Pending | Apple App Store          |

---

## Technical Feasibility & Gotchas

### 1. API Base URL on Mobile Devices
Unlike web browsers using Vite proxies, mobile apps must connect directly to the backend.
- **Android Emulator**: Use `http://10.0.2.2:5000` instead of `localhost:5000`.
- **Physical Devices**: Must use the host machine's LAN IP (e.g., `http://192.168.1.50:5000`).
- Ensure the backend server binds to `0.0.0.0` rather than `127.0.0.1`.

### 2. Clerk Authentication on Expo
- Clerk requires `@clerk/clerk-expo` and `expo-secure-store` to maintain session persistence.
- A deep link scheme (e.g. `replate://` or configured via Expo Router) is required for OAuth redirect callbacks.

### 3. Voice Recording and Playback (`expo-av`)
- Recording audio for Sarvam voice queries requires runtime permission requests (`Audio.requestPermissionsAsync()`).
- Audio files must be encoded in a format supported by Sarvam (e.g., WAV or base64 encoded PCM).

### 4. NativeWind Configuration
- NativeWind v2 utilizes Tailwind CSS v3. Make sure configuration files mapping `tailwind.config.js` content correctly capture all component paths (`./app/**/*.{js,jsx,ts,tsx}` and `./components/**/*.{js,jsx,ts,tsx}`).

