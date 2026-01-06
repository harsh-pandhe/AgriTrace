# 🌱 AgriTrace - Agricultural Waste Tracking & Recycling Platform

A modern, full-stack web application for tracking agricultural waste and connecting farmers with recycling agents. Built with Next.js, Firebase, and AI-powered features.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Security](#-security)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔑 Core Features
- **User Authentication** - Firebase Auth with email/password and password reset
- **Role-Based Access Control** - Farmer, Agent, Recycler, and Admin roles
- **Waste Tracking Dashboard** - Real-time waste reporting and tracking
- **Recycling Management** - Organize and manage waste collection
- **AI-Powered Analysis** - Integration with Google Genkit for waste analysis
- **Payment Integration** - Razorpay integration for transactions

### 📊 User Dashboards
- **Farmer Dashboard** - View and manage waste reports, track collection status
- **Agent Dashboard** - Monitor collections, update waste status, view analytics
- **Admin Dashboard** - Platform oversight, user management, system analytics

### 🎨 UI/UX
- **Modern, Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support** - Full light/dark theme toggle
- **Beautiful Components** - Radix UI components with custom styling
- **Smooth Animations** - Framer Motion for fluid interactions

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 15.5 with App Router
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS 3.0
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend & Services
- **Runtime:** Node.js
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Authentication
- **File Storage:** Firebase Storage
- **AI/ML:** Google Genkit with Generative AI API
- **Payments:** Razorpay

### DevOps & Tools
- **Package Manager:** npm
- **Linting:** ESLint + TypeScript
- **Build Tool:** Turbopack
- **Deployment:** Firebase Hosting / Vercel

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Google Genkit API key (for AI features)
- Razorpay API keys (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/agritrace.git
   cd agritrace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your Firebase and API credentials

4. **Run the development server**
   ```bash
   npm run dev
   # Open http://localhost:9002 in your browser
   ```

5. **Start the Genkit AI server** (in another terminal)
   ```bash
   npm run genkit:dev
   ```

### Available Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run genkit:dev      # Start Genkit AI server
npm run genkit:watch    # Start Genkit with file watching

# Building
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting errors
npm run typecheck       # Type check with TypeScript
npm run check           # Run lint + typecheck
```

---

## 📁 Project Structure

```
agritrace/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes (Razorpay, webhooks)
│   │   ├── dashboard/            # Dashboards (Agent, Farmer, Admin)
│   │   ├── login/                # Login page
│   │   ├── signup/               # Sign up page
│   │   ├── tracking/             # Waste tracking pages
│   │   ├── recycling/            # Recycling management
│   │   ├── reporting/            # Waste reporting
│   │   └── layout.tsx            # Root layout
│   ├── components/               # Reusable components
│   │   ├── ui/                   # Base UI components (Radix)
│   │   ├── dashboard/            # Dashboard components
│   │   ├── layout/               # Layout components (Header, Sidebar)
│   │   ├── tracking/             # Tracking-related components
│   │   └── reporting/            # Reporting-related components
│   ├── context/                  # React Context (Auth, etc.)
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and helpers
│   │   ├── firebase.ts           # Firebase config
│   │   ├── firebase-service.ts   # Firebase service layer
│   │   ├── types.ts              # TypeScript types
│   │   └── utils.ts              # Helper functions
│   └── ai/                       # AI/Genkit integration
│       ├── genkit.ts             # Genkit configuration
│       └── dev.ts                # Development AI tools
├── public/                       # Static assets
├── firestore.rules               # Firestore security rules
├── firebase.json                 # Firebase configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server-only (never expose to client)
GOOGLE_GENAI_API_KEY=your_genkit_api_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Important:** 
- Keep server-only keys in `.env.local` (gitignored)
- Use `NEXT_PUBLIC_` prefix only for safe, client-side values
- Never commit `.env.local` to version control
- Rotate keys immediately if accidentally exposed

---

## 🔒 Security

### Firestore Security Rules
Access control is role-based with the following rules:

- **`users/{uid}`** - Only owner and agents can read/update; deletion blocked
- **`wasteReports/{id}`** - Created by authenticated farmers; readable by owner and agents; updates/deletes by agents only
- **`listings/{id}`** - Authenticated users can read; owners manage their own

### Best Practices
- All user inputs are validated on client and server
- TypeScript enforces type safety
- ESLint catches potential security issues
- Firebase rules restrict unauthorized access
- Sensitive operations require authentication

### Testing Security
```bash
# Test Firestore rules locally
firebase emulators:start

# Type checking (catches many security issues)
npm run typecheck

# Lint for security issues
npm run lint
```

---

## 🏗 Development

### Architecture

**Client-Server Communication:**
- React components use Firebase SDK directly
- API routes handle backend operations (payments, webhooks)
- Context API manages global state (Auth)
- React hooks encapsulate reusable logic

**Data Flow:**
- Firestore as single source of truth
- Real-time updates via Firebase listeners
- Optimistic UI updates for better UX

### Adding Features

1. **New Page/Route:** Add to `src/app/`
2. **New Component:** Add to `src/components/`
3. **New Hook:** Add to `src/hooks/`
4. **New Type:** Update `src/lib/types.ts`
5. **API Route:** Add to `src/app/api/`

### Code Quality

```bash
# Type check before committing
npm run check

# Fix linting issues
npm run lint:fix

# Watch for issues during development
npm run genkit:watch
```

---

## 🚢 Deployment

### Deploy to Firebase Hosting

```bash
# Build the project
npm run build

# Deploy
firebase deploy
```

### Deploy to Vercel

```bash
# Connect your GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Automatic deployments on push to main
```

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Firestore rules reviewed and tested
- [ ] No console errors or warnings
- [ ] Type checking passes: `npm run typecheck`
- [ ] ESLint passes: `npm run lint`
- [ ] Tested on multiple devices and browsers

---

## 📝 Contributing

1. Create a new branch for your feature: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -am 'Add your feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

**Code Style:**
- Follow ESLint configuration
- Use TypeScript for type safety
- Write clear, descriptive commit messages
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Support

For issues, feature requests, or questions:
- Create an issue on GitHub
- Check the [Implementation Status](./IMPLEMENTATION_STATUS.md) for known issues
- See [Blueprint](./docs/blueprint.md) for architecture details

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Genkit](https://github.com/firebase/genkit)

