'use client'

import { useState } from 'react'
import { 
  FileText, 
  Upload, 
  Shield, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Lock,
  TrendingUp
} from 'lucide-react'
import { formatDateTime, getUrgencyColor, getUrgencyLabel } from '@/lib/utils'
import type { Document, ActivityFeedItem, AgentTask, Mandate } from '@/lib/types'
import DocumentUploader from './DocumentUploader'
import ActivityFeed from './ActivityFeed'
import MandateCard from './MandateCard'

interface DashboardProps {
  user: any
  documents: Document[]
  activities: ActivityFeedItem[]
  tasks: AgentTask[]
  mandate?: Mandate | null
}

export default function Dashboard({ user, documents, activities, tasks, mandate }: DashboardProps) {
  const [showUploader, setShowUploader] = useState(false)

  const urgentDocs = documents.filter(d => 
    d.urgency_level === 'high' || d.urgency_level === 'critical'
  )

  const activeTasks = tasks.filter(t => t.status === 'running')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg trust-gradient flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mandat.ai</h1>
                <p className="text-sm text-gray-600">Votre agent administratif</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.first_name || user.email}
                </p>
                <p className="text-xs text-gray-500">
                  {mandate ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Mandat actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      Mandat requis
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                </div>
              </div>
            </div>
            {urgentDocs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-amber-600 font-medium">
                  {urgentDocs.length} document{urgentDocs.length > 1 ? 's' : ''} urgent{urgentDocs.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Loader2 className={`w-6 h-6 text-purple-600 ${activeTasks.length > 0 ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tâches actives</p>
                  <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
                </div>
              </div>
            </div>
            {activeTasks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-purple-600 font-medium">
                  L'agent travaille pour vous
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sérénité</p>
                  <p className="text-2xl font-bold text-green-600">98%</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                Tout est sous contrôle
              </p>
            </div>
          </div>
        </div>

        {!mandate && <MandateCard />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Déposer un problème
                </h2>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                   onClick={() => setShowUploader(true)}>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Courrier, email, notification ?
                </p>
                <p className="text-xs text-gray-500">
                  Déposez votre document et laissez l'agent s'en occuper
                </p>
              </div>

              {showUploader && (
                <DocumentUploader onClose={() => setShowUploader(false)} />
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Documents récents
              </h2>
              <div className="space-y-3">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.analysis_status === 'completed' ? 'bg-green-100' : 
                      doc.analysis_status === 'processing' ? 'bg-blue-100' : 
                      'bg-gray-100'
                    }`}>
                      {doc.analysis_status === 'processing' ? (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      ) : (
                        <FileText className={`w-5 h-5 ${
                          doc.analysis_status === 'completed' ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getUrgencyColor(doc.urgency_level)}`}>
                          {getUrgencyLabel(doc.urgency_level)}
                        </span>
                        {doc.deadline_date && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(doc.deadline_date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucun document pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Coffre-fort
                </h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">CNI</p>
                  <p className="text-xs text-gray-500 mt-1">Valide jusqu'au 12/2028</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Avis d'imposition</p>
                  <p className="text-xs text-gray-500 mt-1">Année 2023</p>
                </div>
                <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2">
                  Voir tout →
                </button>
              </div>
            </div>

            <ActivityFeed activities={activities} />
          </div>
        </div>
      </main>
    </div>
  )
}
