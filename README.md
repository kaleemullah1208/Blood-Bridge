# 🩸 BloodBridge - Real-Time Emergency Blood Donation & Request Hub

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v10_Modular_SDK-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**BloodBridge** is a modern, full-stack, real-time emergency blood donation web application designed to bridge critical gaps between emergency patients and voluntary blood donors in sub-second real time.

---

## 🌟 Key Features

### 1. 🚨 Live Emergency Broadcast Feed
- **Sub-Second Real-Time Updates**: Powered by Google Cloud Firestore `onSnapshot` queries.
- **Urgency Levels**: Color-coded badges for `Critical`, `Urgent`, and `Normal` cases with pulsating emergency beacons.
- **Instant Response Triggers**: One-click **Direct Phone Call** (`tel:`) and **WhatsApp** chat initiation for immediate contact between donors and families.
- **Smart Filtering**: Filter by blood group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) and search by hospital name or city.

### 2. 🩸 Voluntary Donors Directory
- **Searchable Donor Database**: Search by city/location and filter by specific blood group.
- **Live Availability Indicator**: Green pulsating status badge for active donors ready to donate immediately.
- **Verified Donor Badges**: Community verification and donation history tracking.

### 3. 🔐 Authentication & Role-Based Workflows
- **1-Click Google Sign-In & Sign-Up**: Powered by Firebase `GoogleAuthProvider` and `signInWithPopup`.
- **Role Selection on Registration**:
  - **Voluntary Blood Donor**: Set blood group, donation readiness switch, and last donation date.
  - **Patient / Seeker**: Set hospital/clinic name and default required blood group.
- **Non-Registered User Detection**: Intelligent detection when an unregistered email attempts sign-in, with a 1-click prompt redirecting to registration.
- **Profile Onboarding Wizard**: Automated modal to complete contact details and city right after social authentication.

### 4. 🎛️ Dynamic Role-Based User Dashboard
- **Donor Mode View**:
  - Top interactive banner with live **"Available to Donate" / "Currently Busy"** switch.
  - Primary default tab: **Emergency Requests Feed** (view patients in need).
  - Last donation date logger.
- **Patient / Seeker Mode View**:
  - Primary default tab: **Find Available Donors** directory with search.
  - Dedicated **"My Active Requests"** management tab to mark broadcasts as **Fulfilled** or delete them.
- **1-Click Mode Switcher**: Seamlessly switch between Donor and Requester roles anytime.

### 5. 🛡️ Dedicated Admin Control Hub
- **Discreet Admin Access Button & Modal**: Dedicated administrator popup gate on both Navbar and Login page.
- **New Tab Execution**: Admin portal opens in an isolated, secure **new browser tab** (`window.open('/admin', '_blank')`).
- **Real-Time Moderation**:
  - Live table of all registered accounts (Google & Email signups) with authentication tags.
  - Manage voluntary donor availability, verification badges, and role promotions.
  - Real-time emergency request moderation with status controls (`Active`, `Fulfilled`, `Cancelled`, `Delete`).

---

## 🛠️ Technology Stack

- **Frontend**: [React.js](https://react.dev/) (Hooks, Context API, React Router DOM v6)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend & Database**: [Google Firebase](https://firebase.google.com/) (Modular SDK v10)
  - **Authentication**: Email/Password + Google OAuth
  - **Cloud Firestore**: Real-time NoSQL document database with live query subscriptions
  - **Firebase Analytics**: User activity measurement
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Folder Structure

```
Blood_Bridge Project/
├── src/
│   ├── components/
│   │   ├── AdminLoginModal.jsx       # Admin login popup modal
│   │   ├── BloodRequestCard.jsx      # Emergency blood request card with Call/WhatsApp
│   │   ├── DonorCard.jsx             # Voluntary donor card
│   │   ├── Footer.jsx                # Global footer with hotlines & admin link
│   │   ├── LoadingSpinner.jsx        # Animated loading spinner
│   │   ├── Navbar.jsx                # Sticky responsive navbar with alerts & admin trigger
│   │   ├── OnboardingModal.jsx       # Profile completion modal for new signups
│   │   ├── ProtectedRoute.jsx        # Route guard for authenticated dashboard
│   │   ├── StatsCounter.jsx          # Dynamic live impact metrics
│   │   └── Toast.jsx                 # Custom animated toast notifications
│   ├── context/
│   │   ├── AuthContext.jsx           # Global user authentication & Firestore profile sync
│   │   └── ToastContext.jsx          # Global toast notifications context
│   ├── firebase/
│   │   ├── config.js                 # Firebase Modular SDK initialization
│   │   └── services.js               # Real-time Firestore subscriptions & CRUD operations
│   ├── pages/
│   │   ├── AdminDashboardPage.jsx    # Real-time administrative moderation hub
│   │   ├── AdminLoginPage.jsx        # Standalone admin authorization portal
│   │   ├── DashboardPage.jsx         # Role-based interactive user/donor hub
│   │   ├── FindDonorsPage.jsx        # Public directory of voluntary blood donors
│   │   ├── HomePage.jsx              # Hero section, impact statistics, and live request feed
│   │   ├── LoginPage.jsx             # Dual-tab Sign In (User/Donor vs Admin)
│   │   ├── PostRequestPage.jsx       # Emergency request broadcaster with live preview
│   │   └── RegisterPage.jsx          # Role-oriented Sign Up (Donor vs Patient)
│   ├── App.jsx                       # Global router configuration
│   ├── main.jsx                      # React application root
│   └── index.css                     # Design tokens & Tailwind imports
├── .env                              # Firebase configuration environment variables
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** / **pnpm**

### 2. Clone the Repository
```bash
git clone https://github.com/kaleemullah1208/Blood-Bridge.git
cd Blood-Bridge
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Firebase Environment Variables
Create a `.env` file in the root directory and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production
```bash
npm run build
```

---

## 🔒 Default Administrator Credentials
- **Admin Email**: `admin@gmail.com`
- **Admin Password**: `admin123`

*(You can also promote any registered user to administrator directly inside the Admin Hub).*

---

## 🤝 Contributing
Contributions, bug reports, and feature requests are welcome! Feel free to check the [issues page](https://github.com/kaleemullah1208/Blood-Bridge/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
