import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css'
import appCSS from './globals.css'
import { ThemeProvider } from "../components/theme-provider";
import { LangProvider } from "../components/lang-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const links = () => [
  { rel: "stylesheet", href: appCSS },
]; 
export const metadata = {
  title: "School Hub",
  description:
    "Public timetables and inventory management for our school network.",
  authors: [{ name: "School Hub" }],
  openGraph: {
    title: "School Hub",
    description:  
      "Public timetables and inventory management for our school network.",
    type: "website",
    images: [
      {
        url: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/01b6e323-a4f2-43b5-9801-6a4a01a5d9cf/id-preview-aee7fa90--2c84c454-2376-422c-9534-b596746d00ee.lovable.app-1783004693264.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "School Hub",
    description:
      "Public timetables and inventory management for our school network.",
    images: [
      {
        url: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/01b6e323-a4f2-43b5-9801-6a4a01a5d9cf/id-preview-aee7fa90--2c84c454-2376-422c-9534-b596746d00ee.lovable.app-1783004693264.png",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`min-h-full flex flex-col ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body>
    {/* <QueryClientProvider client={queryClient}> */}
      <ThemeProvider>
        <LangProvider>
     {children}
        </LangProvider>
      </ThemeProvider>
    {/* </QueryClientProvider> */}

     </body>
    </html>
  
  );
}
