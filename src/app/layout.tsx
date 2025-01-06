import React from 'react'
import './globals.css'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'] })

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
      <body className={montserrat.className}>
        <div className="min-h-screen relative">
          {/* Background Image with gradient overlay */}
          <div 
            className="fixed inset-0 bg-gradient-to-b from-black/50 to-black/70"
            style={{
              backgroundImage: 'url(/garage-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              backgroundBlendMode: 'overlay',
            }}
          />
          {/* Content container */}
          <div className="relative z-20 text-white">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
} 