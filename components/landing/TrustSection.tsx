'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Server, Scale, Eye, Award } from 'lucide-react'

const trustBadges = [
  {
    icon: Shield,
    title: 'Identité Protégée',
    description: 'Chiffrement AES-256 de bout en bout',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Scale,
    title: 'Mandat Légal',
    description: 'Article 1984 du Code Civil',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Server,
    title: 'Hébergé en France',
    description: 'Infrastructure souveraine RGPD',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Lock,
    title: 'Données Sécurisées',
    description: 'Aucun accès sans votre accord',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Eye,
    title: 'Transparence Totale',
    description: 'Logs consultables à tout moment',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Award,
    title: 'Conforme ISO 27001',
    description: 'Audit sécurité annuel',
    color: 'from-yellow-500 to-orange-500'
  }
]

export default function TrustSection() {
  return (
    <section className="py-32 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 mb-6">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Sécurité & Conformité
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">confiance</span> est notre priorité
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pas de blabla technique. Juste des garanties concrètes pour protéger vos données.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {badge.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {badge.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]" />
          
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Révocable en 1 clic
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Vous gardez 100% du contrôle. Annulez le mandat à tout moment depuis votre espace.
              <br />
              <span className="text-sm text-gray-400 mt-2 block">
                Conformément à l'Article 2007 du Code Civil : "Le mandat peut être révoqué à tout moment"
              </span>
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Aucun engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Annulation immédiate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Aucune relance</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 max-w-3xl mx-auto">
            Mandat.ai SAS • RCS Paris 123 456 789 • Hébergement: OVH Cloud (Roubaix, France) • 
            DPO: privacy@mandat.ai • Numéro CNIL: DEC-123456
          </p>
        </motion.div>
      </div>
    </section>
  )
}
