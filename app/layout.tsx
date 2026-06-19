// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "@/context/AuthContext";
import { CacheProvider } from "@/context/CacheContext";
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
} from 'react-icons/fi';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrediSure - Credit Intelligence Platform",
  description: "Get your credit score and funding readiness assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning // ✅ Add this to prevent hydration mismatch warnings
    >
      <body 
        className="min-h-full flex flex-col"
        suppressHydrationWarning // ✅ Add this to prevent hydration mismatch warnings
      >
        <CacheProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#004051',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
                success: {
                  duration: 3000,
                  icon: <FiCheckCircle className="w-5 h-5 text-white" />,
                  style: {
                    background: '#1EA537',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                },
                error: {
                  duration: 4000,
                  icon: <FiXCircle className="w-5 h-5 text-white" />,
                  style: {
                    background: '#dc2626',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                },
                loading: {
                  duration: 2000,
                  icon: <FiAlertCircle className="w-5 h-5 text-white animate-spin" />,
                  style: {
                    background: '#004051',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                },
              }}
            />
          </AuthProvider>
        </CacheProvider>
      </body>
    </html>
  );
}