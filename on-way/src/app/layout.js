"use client";

import "./globals.css";
import Navbar from "./root-components/Navbar";
import Footer from "./root-components/Footer";
import AuthProvider from "./AuthProvider/AuthProvider";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideNavbarFooter = pathname === "/login" || pathname === "/register";

  return (
    <html lang="en" data-theme="onwaytheme">
      <head>
        <title>OnWay - Your Journey, Your Way</title>
        <meta name="description" content="Book rides, travel in comfort, get food delivered, and pay securely — all inside OnWay." />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <AuthProvider>
          {!hideNavbarFooter && <Navbar />}

          <main>{children}</main>

          <Toaster position="top-center" reverseOrder={false} />

          {!hideNavbarFooter && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}