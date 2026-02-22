 import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata = {
  title: "OnWay - Your Journey, Your Way",
  description: "Book rides, travel in comfort, get food delivered, and pay securely — all inside OnWay.",
  icons: {
    icon: "https://i.ibb.co/pBKvRznM/92d917d29a33a23b7c186d8ffc81d4bb-removebg-preview.png",
    shortcut: "https://i.ibb.co/pBKvRznM/92d917d29a33a23b7c186d8ffc81d4bb-removebg-preview.png",
    apple: "https://i.ibb.co/pBKvRznM/92d917d29a33a23b7c186d8ffc81d4bb-removebg-preview.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="onwaytheme">
      <body>
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
