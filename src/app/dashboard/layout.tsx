'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { WrenchIcon, UserGroupIcon, ClipboardDocumentListIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Services', href: '/dashboard/services', icon: ClipboardDocumentListIcon },
    { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-racing-red"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="bg-oil-dark/90 border-b border-metal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <WrenchIcon className="h-8 w-8 text-racing-red" />
              <span className="ml-2 text-xl font-bold text-white">
                Pro Garage Manager
              </span>
              {/* Navigation Links */}
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-racing-red text-white'
                          : 'text-metal-300 hover:bg-metal-800 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-racing-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign out
              </button>
            </div>
          </div>
          {/* Mobile Navigation */}
          <div className="md:hidden flex space-x-2 py-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-racing-red text-white'
                      : 'text-metal-300 hover:bg-metal-800 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium flex items-center flex-1 justify-center`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 