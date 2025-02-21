# FlightTrack - Travel Statistics Dashboard

FlightTrack is a modern web application built with Next.js that helps users track their flights and monitor travel statistics. It provides an intuitive interface for managing flight records and visualizing travel patterns.

## Features

- **Authentication**
  - Secure Google Sign-In integration
  - Persistent authentication state
  - Protected routes

- **Flight Management**
  - Add individual flights with detailed information
  - Batch add multiple flights at once
  - Edit and delete flight records
  - Country selection with flag visualization
  - Automatic date tracking

- **Statistics Dashboard**
  - Visual representation of travel patterns
  - Days spent in different countries
  - Total flights tracking
  - Average stay duration
  - Longest stay records
  - Most visited country statistics

- **Tax Residency Tracking**
  - Singapore tax residency status monitoring
  - Days traveled calculation
  - Remaining travel days indicator
  - Visual progress tracking

- **Data Export**
  - Export flight records as PDF
  - Export flight records as Excel spreadsheet

## Tech Stack

- **Frontend**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - Recharts for data visualization

- **Backend/Services**
  - Firebase Authentication
  - Firebase Firestore
  - Firebase Analytics
  - REST Countries API

- **Development & Deployment**
  - Vercel deployment
  - ESLint
  - Environment variable management

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- A Firebase project
- A Vercel account (for deployment)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/flight-tracker.git
   cd flight-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Google provider
3. Enable Firestore Database
4. Create necessary security rules for Firestore
5. Copy your Firebase configuration to the environment variables

### Deployment

The application is configured for deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy using:
   ```bash
   vercel --prod
   ```

## Project Structure

```
flight-tracker/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── flights/        # Flight-related components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components
│   ├── lib/                # Utilities and services
│   │   ├── services/       # Firebase services
│   │   └── hooks/          # Custom React hooks
│   └── styles/             # Global styles
├── public/                 # Static assets
└── package.json           # Project dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [REST Countries API](https://restcountries.com/)
- [Vercel](https://vercel.com/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
