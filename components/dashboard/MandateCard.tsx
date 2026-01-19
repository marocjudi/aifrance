'use client'

import { Shield, FileSignature } from 'lucide-react'

export default function MandateCard() {
  const handleCreateMandate = async () => {
    alert('Fonctionnalité Yousign en cours d\'intégration')
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8" />
            <h2 className="text-xl font-bold">
              Mandat de représentation requis
            </h2>
          </div>
          <p className="text-indigo-100 mb-4 max-w-2xl">
            Pour agir en votre nom sur les portails administratifs (Impôts, CAF, Ameli), 
            l'agent a besoin de votre autorisation légale conformément à l'Article 1984 du Code Civil.
          </p>
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium mb-2">Le mandat vous permet de :</p>
            <ul className="text-sm space-y-1 text-indigo-100">
              <li>✓ Automatiser vos démarches administratives</li>
              <li>✓ Remplir des formulaires en ligne</li>
              <li>✓ Télécharger vos documents officiels</li>
              <li>✓ Suivre l'avancement de vos dossiers</li>
            </ul>
          </div>
        </div>
        <div className="ml-6">
          <button
            onClick={handleCreateMandate}
            className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            <FileSignature className="w-5 h-5" />
            Signer le mandat
          </button>
          <p className="text-xs text-indigo-200 mt-2 text-center">
            Signature électronique sécurisée
          </p>
        </div>
      </div>
    </div>
  )
}
