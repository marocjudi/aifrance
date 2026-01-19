'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Receipt, 
  Baby, 
  Building2, 
  Package,
  CheckCircle,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react'

const problems = [
  {
    id: 'amende',
    icon: Receipt,
    title: 'Amende injustifiée',
    description: 'PV de stationnement ou excès de vitesse',
    solution: {
      title: "L'agent analyse votre PV",
      steps: [
        'Vérifie la légalité du contrôle (signalisation, radar homologué)',
        'Identifie les vices de forme juridiques',
        'Rédige automatiquement la contestation Article L121-3',
        'Envoie le courrier recommandé avec AR'
      ],
      success: '73% de PV annulés ou réduits',
      time: '5 minutes'
    }
  },
  {
    id: 'caf',
    icon: Baby,
    title: 'Aide CAF non reçue',
    description: 'APL, RSA, Prime d\'activité',
    solution: {
      title: "L'agent récupère votre dû",
      steps: [
        'Se connecte à votre compte CAF (mandat sécurisé)',
        'Détecte les aides non sollicitées auxquelles vous avez droit',
        'Remplit automatiquement les formulaires de demande',
        'Relance la CAF en cas de retard de traitement'
      ],
      success: '450€ en moyenne récupérés',
      time: '48 heures'
    }
  },
  {
    id: 'permis',
    icon: Building2,
    title: 'Permis de construire',
    description: 'Déclaration préalable ou permis',
    solution: {
      title: "L'agent suit votre dossier",
      steps: [
        'Vérifie que votre dossier est complet (pièces obligatoires)',
        'Surveille les délais d\'instruction (2 mois)',
        'Détecte le silence valant acceptation',
        'Vous alerte en cas de demande de complément'
      ],
      success: 'Délai réduit de 40%',
      time: 'Suivi continu'
    }
  },
  {
    id: 'colis',
    icon: Package,
    title: 'Litige colis perdu',
    description: 'Colissimo, Chronopost, DPD',
    solution: {
      title: "L'agent obtient le remboursement",
      steps: [
        'Récupère la preuve d\'expédition et le suivi',
        'Rédige la réclamation selon la Convention de Varsovie',
        'Relance tous les 7 jours (obligation légale transporteur)',
        'Escalade au médiateur postal si nécessaire'
      ],
      success: '91% de remboursements obtenus',
      time: '14 jours max'
    }
  }
]

export default function ProblemSelector() {
  const [selectedProblem, setSelectedProblem] = useState(problems[0])

  return (
    <section className="py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Quel est votre <span className="text-indigo-600">problème</span> aujourd'hui ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cliquez sur votre situation et découvrez comment l'agent la résout automatiquement
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            {problems.map((problem, index) => {
              const Icon = problem.icon
              const isSelected = selectedProblem.id === problem.id

              return (
                <motion.button
                  key={problem.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProblem(problem)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-indigo-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white/20' : 'bg-indigo-50'
                    }`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{problem.title}</h3>
                      <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {problem.description}
                      </p>
                    </div>
                    <ArrowRight className={`w-5 h-5 transition-transform ${
                      isSelected ? 'text-white translate-x-1' : 'text-gray-400'
                    }`} />
                  </div>
                </motion.button>
              )
            })}
          </div>

          <div className="lg:sticky lg:top-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProblem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedProblem.solution.title}
                  </h3>
                </div>

                <div className="space-y-4 mb-8">
                  {selectedProblem.solution.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="flex gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{step}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">{selectedProblem.solution.success}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{selectedProblem.solution.time}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Résoudre ce problème maintenant
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
