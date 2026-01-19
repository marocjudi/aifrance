'use client'

import { Lock, FileText, Key, AlertCircle, Calendar, CheckCircle, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Document } from '@/lib/types'

interface VaultCredential {
  id: string
  service_name: string
  service_url?: string
  last_used_at?: string
  is_valid: boolean
  created_at: string
}

interface VaultDashboardProps {
  documents: Document[]
  credentials: VaultCredential[]
}

export default function VaultDashboard({ documents, credentials }: VaultDashboardProps) {
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'identity':
        return '🪪'
      case 'tax':
        return '💰'
      case 'health':
        return '🏥'
      case 'social':
        return '🤝'
      default:
        return '📄'
    }
  }

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case 'identity':
        return 'Identité'
      case 'tax':
        return 'Fiscalité'
      case 'health':
        return 'Santé'
      case 'social':
        return 'Social'
      default:
        return 'Autre'
    }
  }

  const identityDocs = documents.filter(d => d.document_type === 'identity')
  const taxDocs = documents.filter(d => d.document_type === 'tax')
  const healthDocs = documents.filter(d => d.document_type === 'health')
  const socialDocs = documents.filter(d => d.document_type === 'social')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Lock className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coffre-fort sécurisé</h1>
              <p className="text-sm text-gray-600">Vos documents et identifiants chiffrés</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Sécurité maximale</h3>
              <p className="text-sm text-blue-700">
                Toutes vos données sont chiffrées avec AES-256-GCM. Mandat.ai ne peut jamais accéder 
                à vos informations sans votre consentement explicite.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Documents administratifs</h2>
              </div>
              <span className="text-sm text-gray-500">{documents.length} documents</span>
            </div>

            <div className="space-y-4">
              {[
                { type: 'identity', docs: identityDocs, label: 'Identité' },
                { type: 'tax', docs: taxDocs, label: 'Fiscalité' },
                { type: 'health', docs: healthDocs, label: 'Santé' },
                { type: 'social', docs: socialDocs, label: 'Social' }
              ].map((category) => (
                <div key={category.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getDocumentIcon(category.type)}</span>
                      <span className="font-medium text-gray-900">{category.label}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {category.docs.length} doc{category.docs.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {category.docs.length > 0 ? (
                    <div className="space-y-2">
                      {category.docs.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="flex items-start justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.filename}
                            </p>
                            {doc.valid_until && (
                              <div className="flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className={`text-xs ${
                                  doc.is_expired ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  {doc.is_expired ? 'Expiré' : `Valide jusqu'au ${formatDate(doc.valid_until)}`}
                                </span>
                              </div>
                            )}
                          </div>
                          {!doc.is_expired && doc.valid_until && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                          )}
                          {doc.is_expired && (
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Aucun document</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Key className="w-6 h-6 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Identifiants sauvegardés</h2>
              </div>
              <span className="text-sm text-gray-500">{credentials.length} services</span>
            </div>

            <div className="space-y-3">
              {credentials.map((cred) => (
                <div key={cred.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-900">{cred.service_name}</p>
                        {cred.is_valid ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Actif
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            À vérifier
                          </span>
                        )}
                      </div>
                      {cred.service_url && (
                        <p className="text-xs text-gray-500 mb-2">{cred.service_url}</p>
                      )}
                      {cred.last_used_at && (
                        <p className="text-xs text-gray-400">
                          Dernière utilisation : {formatDate(cred.last_used_at)}
                        </p>
                      )}
                    </div>
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}

              {credentials.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium mb-1">Aucun identifiant sauvegardé</p>
                  <p className="text-xs">
                    L'agent vous demandera vos identifiants lors de la première action automatique
                  </p>
                </div>
              )}
            </div>

            <button className="w-full mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Ajouter un identifiant
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Bonnes pratiques</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Ne partagez jamais vos identifiants en dehors de cette plateforme</li>
                <li>• Vérifiez régulièrement la validité de vos documents (CNI, passeport)</li>
                <li>• Activez l'authentification à deux facteurs sur vos comptes administratifs</li>
                <li>• L'agent ne se connectera jamais sans votre accord explicite</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
