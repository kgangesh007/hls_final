"use client"

import { useState, useEffect } from "react"

const InventoryManagement = () => {
  const [inventoryItems, setInventoryItems] = useState([
    { id: 1, name: "Surgical Masks", currentStock: 500, minThreshold: 100, unit: "units", category: "PPE" },
    { id: 2, name: "Disposable Gloves", currentStock: 1200, minThreshold: 200, unit: "units", category: "PPE" },
    {
      id: 3,
      name: "Syringes (10ml)",
      currentStock: 300,
      minThreshold: 50,
      unit: "units",
      category: "Medical Supplies",
    },
    {
      id: 4,
      name: "IV Bags (Saline)",
      currentStock: 85,
      minThreshold: 100,
      unit: "units",
      category: "Medical Supplies",
    },
    {
      id: 5,
      name: "Blood Collection Tubes",
      currentStock: 450,
      minThreshold: 100,
      unit: "units",
      category: "Lab Supplies",
    },
    { id: 6, name: "Gauze Bandages", currentStock: 200, minThreshold: 50, unit: "units", category: "Medical Supplies" },
    { id: 7, name: "Antiseptic Wipes", currentStock: 350, minThreshold: 75, unit: "units", category: "Cleaning" },
    {
      id: 8,
      name: "Thermometer Covers",
      currentStock: 180,
      minThreshold: 50,
      unit: "units",
      category: "Medical Supplies",
    },
    { id: 9, name: "Oxygen Masks", currentStock: 75, minThreshold: 25, unit: "units", category: "Respiratory" },
    { id: 10, name: "Medication Vials", currentStock: 120, minThreshold: 30, unit: "units", category: "Pharmacy" },
    { id: 11, name: "Lab Test Kits", currentStock: 95, minThreshold: 20, unit: "units", category: "Lab Supplies" },
  ])

  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true)

  // Simulate inventory updates
  useEffect(() => {
    if (!autoUpdateEnabled) return

    const interval = setInterval(() => {
      setInventoryItems((prevItems) =>
        prevItems.map((item) => {
          // Simulate random consumption (decrease) or restocking (increase)
          const change = Math.floor(Math.random() * 21) - 10 // -10 to +10
          const newStock = Math.max(0, item.currentStock + change)
          return { ...item, currentStock: newStock }
        }),
      )
      setLastUpdated(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [autoUpdateEnabled])

  const getStockStatus = (item) => {
    if (item.currentStock <= item.minThreshold) {
      return { status: "critical", color: "text-red-600 bg-red-50 border-red-200", icon: "🚨" }
    } else if (item.currentStock <= item.minThreshold * 1.5) {
      return { status: "low", color: "text-orange-600 bg-orange-50 border-orange-200", icon: "⚠️" }
    } else {
      return { status: "good", color: "text-green-600 bg-green-50 border-green-200", icon: "✅" }
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      PPE: "🛡️",
      "Medical Supplies": "🏥",
      "Lab Supplies": "🧪",
      Cleaning: "🧽",
      Respiratory: "🫁",
      Pharmacy: "💊",
    }
    return icons[category] || "📦"
  }

  const criticalItems = inventoryItems.filter((item) => item.currentStock <= item.minThreshold)
  const lowStockItems = inventoryItems.filter(
    (item) => item.currentStock <= item.minThreshold * 1.5 && item.currentStock > item.minThreshold,
  )

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Inventory Auto-Update</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 mr-2">Auto-Update</label>
            <button
              onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoUpdateEnabled ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoUpdateEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="text-sm text-gray-600">Last updated: {lastUpdated.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Alert Summary */}
      {(criticalItems.length > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {criticalItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 flex items-center mb-2">
                <span className="mr-2">🚨</span>
                Critical Stock Alert
              </h4>
              <p className="text-red-700 text-sm">
                {criticalItems.length} item{criticalItems.length > 1 ? "s" : ""} below minimum threshold
              </p>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 flex items-center mb-2">
                <span className="mr-2">⚠️</span>
                Low Stock Warning
              </h4>
              <p className="text-orange-700 text-sm">
                {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} running low
              </p>
            </div>
          )}
        </div>
      )}

      {/* Current Inventory Levels */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Current Inventory Levels</h4>
        <div className="space-y-3">
          {inventoryItems.map((item) => {
            const stockStatus = getStockStatus(item)
            return (
              <div
                key={item.id}
                className={`flex justify-between items-center p-4 rounded-lg border ${stockStatus.color}`}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getCategoryIcon(item.category)}</span>
                  <div>
                    <h5 className="font-medium text-gray-800">{item.name}</h5>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {item.currentStock} {item.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {item.minThreshold} {item.unit}
                    </p>
                  </div>
                  <span className="text-xl">{stockStatus.icon}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center">
          <span className="mr-2">📊</span>
          Generate Report
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center">
          <span className="mr-2">🔄</span>
          Restock Orders
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex items-center">
          <span className="mr-2">⚙️</span>
          Settings
        </button>
      </div>
    </div>
  )
}

export default InventoryManagement
