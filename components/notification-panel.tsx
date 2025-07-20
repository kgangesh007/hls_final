"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const NotificationPanel = ({ notifications, onMarkAsRead, onClearAll, currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      case "info":
        return "ℹ️"
      default:
        return "🔔"
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50"
      case "warning":
        return "border-l-yellow-500 bg-yellow-50"
      case "error":
        return "border-l-red-500 bg-red-50"
      case "info":
        return "border-l-blue-500 bg-blue-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return timestamp.toLocaleDateString()
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-3">
        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2 hover:shadow-lg transition-shadow"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {currentUser?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-gray-800">{currentUser?.name}</div>
              <div className="text-xs text-gray-600">{currentUser?.role}</div>
            </div>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="font-medium text-gray-800">{currentUser?.name}</div>
                <div className="text-sm text-gray-600">{currentUser?.department}</div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  onLogout()
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-all duration-200 ${unreadCount > 0 ? "ring-2 ring-blue-500 ring-opacity-50" : ""}`}
          >
            <svg
              className={`w-6 h-6 ${unreadCount > 0 ? "text-blue-600" : "text-gray-600"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h5m4 0v6m0 0l3-3m-3 3l-3-3"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <div className="flex gap-2">
                  {notifications.length > 0 && (
                    <Button
                      onClick={onClearAll}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      Clear All
                    </Button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h5m4 0v6m0 0l3-3m-3 3l-3-3"
                      />
                    </svg>
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? "bg-opacity-100" : "bg-opacity-50"}`}
                        onClick={() => !notification.read && onMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {notification.robotId && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                  {notification.robotId}
                                </span>
                              )}
                              {!notification.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                            </div>
                            <p className="text-sm text-gray-800 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTime(notification.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationPanel
