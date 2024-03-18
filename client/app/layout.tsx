import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"
import AuthContextProvider from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/main-nav";
import UserContextProvider from "@/contexts/user-context";
import PomodoroContextProvider from "@/contexts/pomodoro-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background`}>
        <AuthContextProvider>
          <Navbar />
          <UserContextProvider>
            <PomodoroContextProvider>
              {children}
            </PomodoroContextProvider>
          </UserContextProvider>
        </AuthContextProvider>
        <Toaster />
      </body>
    </html>
  )
}
