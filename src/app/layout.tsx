import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "react-hot-toast";
import './globals.css'
import appCSS from './globals.css'
import { ThemeProvider } from "../components/theme-provider";
import { LangProvider } from "../components/lang-provider";
import { AuthSessionProvider } from "../components/session-provider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const links = () => [
  { rel: "stylesheet", href: appCSS },
]; 
export const metadata: Metadata = {
  title: "Learn Hub",
  description:
    "Public timetables and inventory management for our school network.",
  authors: [{ name: "Learn Hub" }],
  openGraph: {
    title: "Learn Hub",
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
    title: "Learn Hub",
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
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`min-h-full flex flex-col ${cairo.variable} h-full antialiased`}>
      <body>
    {/* <QueryClientProvider client={queryClient}> */}
      <AuthSessionProvider>
      <ThemeProvider>
        <LangProvider>
     {children}
     <Toaster position="top-right" />
        </LangProvider>
      </ThemeProvider>
      </AuthSessionProvider>
    {/* </QueryClientProvider> */}

     </body>
    </html>
  
  );
}
