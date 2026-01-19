'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  AlertTriangle, 
  DollarSign,
  Settings,
  LogOut,
  Shield,
  Radio
} from 'lucide-react'
import SystemHealthHeader from '@/components/admin/SystemHealthHeader'

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Vue d\'ensemble', href: '/admin', icon: LayoutDashboard },
  { name: 'Flux des Agents', href: '/admin/agents', icon: Radio },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Litiges', href: '/admin/disputes', icon: AlertTriangle },
  { name: 'Finances', href: '/admin/finances', icon: DollarSign },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      <div className="flex">
        <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Command Center</h1>
                  <p className="text-xs text-gray-400">Mandat.ai Admin</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Retour utilisateur
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex-1 ml-64">
          <SystemHealthHeader />
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
