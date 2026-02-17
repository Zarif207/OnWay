
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="onwaytheme">
      <body>
        {children}
      </body>
    </html>
  );
}
