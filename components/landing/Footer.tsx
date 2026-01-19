'use client'

import Link from 'next/link'
import { Shield, Twitter, Linkedin, Github, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Mandat.ai</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              L'agent mandataire qui gère votre administration française en toute sérénité.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Github className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Produit</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Démo</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">CGU</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">CGV</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              <li>
                <a href="mailto:contact@mandat.ai" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  contact@mandat.ai
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>
              © 2026 Mandat.ai SAS. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <span>🇫🇷 Conçu et hébergé en France</span>
              <span>RGPD Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
