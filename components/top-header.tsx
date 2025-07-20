"use client"

import { useState } from "react"
import { Search, Bell, Globe, AlertTriangle } from "lucide-react"

const TopHeader = ({ currentUser, notifications, onMarkAsRead, onClearAll, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

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
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center relative">
              <div className="w-4 h-1 bg-white rounded-full absolute"></div>
              <div className="w-1 h-4 bg-white rounded-full absolute"></div>
            </div>
            <span className="text-xl font-semibold text-gray-900">HospiGo</span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900"
            >
              <Globe className="w-4 h-4" />
              <span>English</span>
            </button>
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">English</button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Spanish</button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">French</button>
              </div>
            )}
          </div>

          {/* User Role */}
          <span className="text-sm text-gray-700 font-medium">{currentUser?.role || "Nurse"}</span>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden z-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <div className="flex gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={onClearAll}
                        className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Clear All
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
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

          {/* Emergency Stop */}
          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors">
            <AlertTriangle className="w-4 h-4" />
            <span>Emergency Stop</span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {currentUser?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </span>
              </div>
              <span>Authorized Staff</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="font-medium text-gray-800">{currentUser?.name}</div>
                  <div className="text-sm text-gray-600">{currentUser?.department}</div>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</button>
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
        </div>
      </div>
    </header>
  )
}

export default TopHeader
