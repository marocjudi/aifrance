'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'

const plans = [
  {
    name: 'Gratuit',
    price: '0',
    period: 'pour toujours',
    description: 'Découvrez la magie',
    icon: Sparkles,
    features: [
      'Analyse de courrier illimitée',
      'Détection d\'aides non sollicitées',
      'Traduction du jargon administratif',
      'Coffre-fort sécurisé (5 documents)'
    ],
    notIncluded: [
      'Actions automatiques',
      'Navigation sur portails',
      'Support prioritaire'
    ],
    cta: 'Commencer gratuitement',
    highlight: false,
    gradient: 'from-gray-500 to-gray-600'
  },
  {
    name: 'Sérénité',
    price: '9',
    period: '/ mois',
    description: 'L\'agent s\'occupe de tout',
    icon: Zap,
    features: [
      'Tout du plan Gratuit',
      'Actions automatiques illimitées',
      'Navigation sur tous les portails (Impôts, CAF, Ameli...)',
      'Rédaction de courriers de contestation',
      'Relances automatiques',
      'Coffre-fort illimité',
      'Support prioritaire (< 2h)',
      'Notifications en temps réel'
    ],
    notIncluded: [],
    cta: 'Lancez votre agent',
    highlight: true,
    gradient: 'from-indigo-600 to-purple-600',
    badge: 'Le plus populaire'
  }
]

export default function PricingSection() {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <Crown className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">
              Pricing No-Brainer
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Transparent.</span> Sans surprise.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Commencez gratuitement. Passez à la sérénité totale quand vous êtes prêt.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: plan.highlight ? -10 : -5 }}
                className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 ${
                  plan.highlight
                    ? 'border-transparent shadow-2xl shadow-indigo-500/20 lg:scale-105'
                    : 'border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.highlight && (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5 rounded-3xl`} />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className={`px-4 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${plan.gradient} shadow-lg`}>
                        {plan.badge}
                      </span>
                    </div>
                  </>
                )}

                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-6xl font-bold text-gray-900">
                      {plan.price}€
                    </span>
                    <span className="text-xl text-gray-500">
                      {plan.period}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      plan.highlight
                        ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40`
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </motion.button>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-4">
                      Tout ce dont vous avez besoin :
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700 leading-relaxed">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                      {plan.notIncluded.map((feature, i) => (
                        <li
                          key={`not-${i}`}
                          className="flex items-start gap-3 opacity-40"
                        >
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-gray-500">✕</span>
                          </div>
                          <span className="text-gray-500 leading-relaxed line-through">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-white rounded-2xl px-8 py-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">14 jours d'essai gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Annulation en 1 clic</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            🎁 <span className="font-medium text-gray-700">Offre de lancement :</span> Les 1000 premiers utilisateurs bénéficient du tarif 9€/mois à vie (au lieu de 19€)
          </p>
        </motion.div>
      </div>
    </section>
  )
}
