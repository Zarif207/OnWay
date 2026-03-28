"use client";

import "./globals.css";
import Navbar from "./root-components/Navbar";
import Footer from "./root-components/Footer";
import AuthProvider from "./AuthProvider/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import ChatSupport from "./components/ChatBot/ChatSupport";
import FloatingSOSButton from "@/components/FloatingSOSButton";
import { RideProvider } from "@/context/RideContext";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/login" || pathname === "/register" || pathname.startsWith("/dashboard");
  const hideFooter = hideNavbar || pathname === "/onway-book";

  return (
    <html lang="en" data-theme="onwaytheme">
      <head>
        <title>OnWay - Your Journey, Your Way</title>
        <meta name="description" content="Book rides, travel in comfort, get food delivered, and pay securely — all inside OnWay." />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>
            {!hideNavbar && <Navbar />}

            <RideProvider>
              <main>
                {children}
                <ChatSupport />
                <FloatingSOSButton />
              </main>
            </RideProvider>

            <Toaster position="top-center" reverseOrder={false} />

            {!hideFooter && <Footer />}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}