import "./globals.css";
import { Header, Footer } from "../components/Shell";
import { LanguageProvider } from "../components/Language";
export const metadata = {
  title: "CyberSahay | Cybercrime Complaint Assistance",
  description: "Prepare and review a multilingual cybercrime complaint.",
};
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <a className="skip" href="#content">
            Skip to content
          </a>
          <Header />
          <div id="content" tabIndex={-1}>{children}</div>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
