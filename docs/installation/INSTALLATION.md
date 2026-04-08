# AgriTrace - Installation Guide

This guide provides step-by-step instructions for setting up the AgriTrace project locally for development and production.

## Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: Version 18.0 or higher
- **npm**: (Included with Node.js)
- **Git**: For cloning the repository

## External Services Setup

You will need accounts and API keys for the following services:

### 1. Firebase Setup
1. Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Enable **Cloud Firestore** in test mode or production (with rules).
4. Enable **Cloud Storage**.
5. Add a **Web App** to your project to obtain the Firebase configuration object.
6. (Optional) Setup Firebase Admin SDK if you plan on using server-side features.

### 2. Google GenAI (Genkit)
1. Obtain an API key from the [Google AI Studio](https://aistudio.google.com/).
2. This is required for the intelligently waste classification features.

### 3. Razorpay Setup
1. Register for a Razorpay account and get your **Key ID** and **Key Secret** from the Settings > API Keys section.

---

## Local Installation

### 1. Clone the Repository
```bash
git clone https://github.com/harsh-pandhe/AgriTrace.git
cd AgriTrace
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and populate it based on `.env.local.example`:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Optional for some features)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Google GenAI
GOOGLE_GENAI_API_KEY=your_google_ai_key
```

### 4. Setup Firestore Rules
Deploy the rules provided in `firestore.rules` and `storage.rules` via the Firebase CLI or copy-paste them into the Firebase Console.

### 5. Running for Development
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### 6. Building for Production
```bash
npm run build
npm run start
```

---

## Troubleshooting
- If you encounter issues with `genkit`, ensure you have the `genkit-cli` installed: `npm install -g genkit`
- For Firebase connection issues, double-check your API keys and project ID in `.env.local`.
