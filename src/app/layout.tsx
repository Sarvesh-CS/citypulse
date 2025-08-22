import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { getEntry } from "../../lib/contentstack-utils";
import Footer from "@/components/Footer";
import LoadingProvider from "@/components/LoadingProvider";
import { PersonalizationProvider } from "../../lib/personlizeContext";

const headerUid = process.env.NEXT_PUBLIC_HEADER_UID || '';
const footerUid = process.env.NEXT_PUBLIC_FOOTER_UID || '';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CityPulse",
  description: "CityPulse is a platform for exploring and discovering the best of your city.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Try to fetch header data, but provide fallback if headerUid is empty or data is not found
  let header = null;
  if (headerUid) {
    try {
      header = await getEntry('header', headerUid);
    } catch (error) {
      console.warn('Failed to fetch header data:', error);
    }
  }
  
  const footer = await getEntry('footer', footerUid);
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LoadingProvider>
          <PersonalizationProvider>
            <Header data={header} />
            {children}
            <Footer data={footer} />
          </PersonalizationProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
