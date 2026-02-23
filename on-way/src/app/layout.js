import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthProvider from "./AuthProvider/AuthProvider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "OnWay - Your Journey, Your Way",
  description:
    "Book rides, travel in comfort, get food delivered, and pay securely — all inside OnWay.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="onwaytheme">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster position="top-center" reverseOrder={false} />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
