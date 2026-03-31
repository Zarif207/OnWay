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
import ScrollProgress from "./components/ScrollProgress";
import { RideProvider } from "@/context/RideContext";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideNavbarFooter = pathname === "/login" || pathname === "/register" || pathname.startsWith("/dashboard");

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
            <RideProvider>
              <ScrollProgress>
                {!hideNavbarFooter && <Navbar />}
                <main>
                  {children}
                  <ChatSupport />
                  <FloatingSOSButton />
                </main>

                <Toaster position="top-center" reverseOrder={false} />

                {!hideNavbarFooter && <Footer />}
              </ScrollProgress>
            </RideProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

