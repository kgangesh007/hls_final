"use client"

import { useState, useEffect, useCallback } from "react"

const TaskList = ({ refreshFlag }) => {
  const API_URL = "https://d0dcaw3418.execute-api.us-east-1.amazonaws.com/dev/tasks"
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("timestamp")

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to fetch tasks")
        setTasks([])
        return
      }
      setTasks(data.tasks || [])
    } catch (err) {
      console.error("❌ Fetch error:", err)
      setError("Network error or CORS problem while fetching tasks.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks, refreshFlag])

  const handleRowClick = (task) => {
    setSelectedTask(task)
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get service type icon
  const getServiceIcon = (serviceType) => {
    const icons = {
      "Medication Delivery": "💊",
      "Lab Sample Transport": "🧪",
      "Medical Equipment": "🩺",
      "Food Delivery": "🍔",
      "Textile Service": "🧺",
      "Waste Disposal": "🗑️",
      "Blood Transport": "🩸",
      "Oxygen Delivery": "🌬️",
    }
    return icons[serviceType] || "📦"
  }

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.TaskID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.AssignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter = filterStatus === "all" || task.priorityLevel?.toLowerCase() === filterStatus

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "timestamp":
          return new Date(b.Timestamp) - new Date(a.Timestamp)
        case "priority":
          const priorityOrder = { emergency: 4, high: 3, medium: 2, low: 1 }
          return (
            (priorityOrder[b.priorityLevel?.toLowerCase()] || 0) - (priorityOrder[a.priorityLevel?.toLowerCase()] || 0)
          )
        case "robot":
          return a.AssignedTo.localeCompare(b.AssignedTo)
        default:
          return 0
      }
    })

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-4 sm:mb-0">
          All Tasks
          <span className="ml-3 bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
            {filteredAndSortedTasks.length}
          </span>
        </h3>
        <button
          onClick={fetchTasks}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
        >
          <span className="mr-2">🔄</span>
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Tasks</label>
          <input
            type="text"
            placeholder="Search by ID, robot, service, or requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="emergency">Emergency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="timestamp">Latest First</option>
            <option value="priority">Priority</option>
            <option value="robot">Robot Name</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading tasks...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </p>
        </div>
      )}

      {!loading && filteredAndSortedTasks.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <span className="text-4xl mb-4 block">📭</span>
          <p className="text-gray-600 text-lg">No tasks found matching your criteria.</p>
        </div>
      )}

      {!loading && filteredAndSortedTasks.length > 0 && (
        <div className="grid gap-4">
          {filteredAndSortedTasks.map((task) => (
            <div
              key={task.TaskID}
              onClick={() => handleRowClick(task)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 p-5"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                <div className="flex items-center mb-2 sm:mb-0">
                  <span className="text-2xl mr-3">{getServiceIcon(task.serviceType)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">{task.serviceType || "General Service"}</h4>
                    <p className="text-sm text-gray-500">ID: {task.TaskID.substring(0, 12)}...</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priorityLevel)}`}
                  >
                    {task.priorityLevel || "Medium"}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    {task.AssignedTo}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">📍</span>
                  <div>
                    <p className="text-gray-500">From</p>
                    <p className="font-medium text-gray-800">{task.PickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">🎯</span>
                  <div>
                    <p className="text-gray-500">To</p>
                    <p className="font-medium text-gray-800">{task.DropLocation}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">👤</span>
                  <div>
                    <p className="text-gray-500">Requested by</p>
                    <p className="font-medium text-gray-800">{task.requestedBy || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-purple-600 mr-2">🕒</span>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium text-gray-800">{new Date(task.Timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {task.patientId && (
                <div className="mt-3 flex items-center">
                  <span className="text-orange-600 mr-2">🏥</span>
                  <span className="text-sm text-gray-600">Patient ID: </span>
                  <span className="text-sm font-medium text-gray-800">{task.patientId}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="mr-3 text-3xl">{getServiceIcon(selectedTask.serviceType)}</span>
                  Task Details
                </h4>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Task ID</label>
                    <p className="text-gray-800 font-mono text-sm bg-gray-50 p-2 rounded">{selectedTask.TaskID}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service Type</label>
                    <p className="text-gray-800 font-medium">{selectedTask.serviceType || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned Robot</label>
                    <p className="text-gray-800 font-medium">{selectedTask.AssignedTo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority Level</label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedTask.priorityLevel)}`}
                    >
                      {selectedTask.priorityLevel || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Pickup Location</label>
                    <p className="text-gray-800 font-medium">{selectedTask.PickupLocation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Drop Location</label>
                    <p className="text-gray-800 font-medium">{selectedTask.DropLocation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Patient ID</label>
                    <p className="text-gray-800 font-medium">{selectedTask.patientId || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Requested By</label>
                    <p className="text-gray-800 font-medium">{selectedTask.requestedBy || "N/A"}</p>
                  </div>
                </div>
              </div>

              {selectedTask.specialInstructions && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500">Special Instructions</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg mt-1">{selectedTask.specialInstructions}</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-gray-800 font-medium">{new Date(selectedTask.Timestamp).toLocaleString()}</p>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskList
