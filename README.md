# Koperasi Karya Surya Asri - Pencatatan Delivery Order (DO)

A modern, web-based Delivery Order management system for Koperasi Karya Surya Asri, featuring AI-powered document scanning, real-time cloud synchronization, and comprehensive reporting.

![Dashboard Preview](public/dashboard.png)

## 🚀 Features

- **AI Smart Scan**: Automatically extract data from delivery order photos using AI.
- **Real-time Sync**: Data is instantly synchronized across devices using Firebase.
- **Responsive Design**: Optimized for both mobile and desktop users.
- **Role-based Access**: Secure login and professional admin dashboard.
- **Reporting**: Export history to Excel and print delivery reports.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite
- **Styling**: Vanilla CSS, Lucide Icons
- **Backend**: Firebase Authentication & Firestore
- **Utilities**: AI Integration, Excel/PDF Export

![History Preview](public/history.png)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd pencatatan_do
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Copy your config to `src/firebase.js`.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 👨‍💻 Development

The app uses Vite for HMR (Hot Module Replacement). To start developing:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.
