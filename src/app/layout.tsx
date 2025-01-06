import React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Garage Management System',
  description: 'Modern garage management system with real-time updates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen relative">
          {/* Background Image */}
          <Image
            src="/garage-bg.jpg"
            alt="Garage Background"
            fill
            priority
            className="object-cover"
            quality={100}
          />
          {/* Dark overlay for better readability */}
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
          {/* Content container */}
          <div className="relative z-20">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
} 