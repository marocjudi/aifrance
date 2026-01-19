'use client'

import { formatDateTime } from '@/lib/utils'
import { Activity } from 'lucide-react'
import type { ActivityFeedItem } from '@/lib/types'

interface ActivityFeedProps {
  activities: ActivityFeedItem[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Activité récente
        </h2>
      </div>

      <div className="space-y-4">
        {activities.slice(0, 10).map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              {activity.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {activity.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(activity.created_at)}
              </p>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucune activité pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
