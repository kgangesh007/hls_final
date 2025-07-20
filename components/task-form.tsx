"use client"

import { useState } from "react"

const TaskForm = ({ onTaskCreated, availableRobots = 0 }) => {
  const API_URL = "https://d0dcaw3418.execute-api.us-east-1.amazonaws.com/dev/tasks"

  // Predefined locations
  const LOCATIONS = [
    "Reception",
    "Radiology",
    "Pharmacy",
    "Laboratory",
    "Emergency",
    "Main Corridor",
    "Charging 2",
    "Ward A",
    "Charging 1",
    "Ward B",
    "Surgery 1",
    "Surgery 2",
    "ICU",
    "Kitchen",
    "Laundry",
    "Waste Mgmt",
    "Storage",
  ]

  // Predefined robot options (limited to 7)
  const ROBOT_OPTIONS = ["Robot-A1", "Robot-B2", "Robot-C3", "Robot-D4", "Robot-E5", "Robot-F6", "Robot-G7"]

  // New Service Types based on the image
  const SERVICE_TYPES = [
    { name: "Medication Delivery", icon: "💊" },
    { name: "Lab Sample Transport", icon: "🧪" },
    { name: "Medical Equipment", icon: "🩺" },
    { name: "Food Delivery", icon: "🍔" },
    { name: "Textile Service", icon: "🧺" },
    { name: "Waste Disposal", icon: "🗑️" },
    { name: "Blood Transport", icon: "🩸" },
    { name: "Oxygen Delivery", icon: "🌬️" },
  ]

  // New Priority Levels based on the image
  const PRIORITY_LEVELS = ["Low", "Medium", "High", "Emergency"]

  const [form, setForm] = useState({
    AssignedTo: ROBOT_OPTIONS[0], // Still used for the robot dropdown
    PickupLocation: "",
    DropLocation: "",
    Status: "Pending", // Default status
    serviceType: "", // New field
    priorityLevel: "Medium", // Default as shown in image
    patientId: "", // New field
    requestedBy: "", // New field
    specialInstructions: "", // New field
  })

  const [message, setMessage] = useState("")
  const [createdTaskDetails, setCreatedTaskDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleServiceTypeClick = (type) => {
    setForm({ ...form, serviceType: type })
  }

  const handlePriorityLevelClick = (level) => {
    setForm({ ...form, priorityLevel: level })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setCreatedTaskDetails(null)
    setLoading(true)

    if (!form.serviceType) {
      setMessage("Please select a Service Type.")
      setLoading(false)
      return
    }

    if (!form.PickupLocation || !form.DropLocation) {
      setMessage("Please select both Pickup and Destination locations.")
      setLoading(false)
      return
    }

    if (form.PickupLocation === form.DropLocation) {
      setMessage("Pickup and Destination locations cannot be the same.")
      setLoading(false)
      return
    }

    if (!form.requestedBy) {
      setMessage("Please enter who requested the service.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form), // Send all form data, including new fields
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(`Task successfully created! See details below.`)
        setCreatedTaskDetails(data.task)

        // Add notification for task creation
        if (typeof window !== "undefined" && window.addNotification) {
          window.addNotification(
            "success",
            `New ${data.task.serviceType} task assigned to ${data.task.AssignedTo}`,
            data.task.AssignedTo,
          )
        }

        // Reset form fields after successful creation
        setForm({
          AssignedTo: ROBOT_OPTIONS[0],
          PickupLocation: "",
          DropLocation: "",
          Status: "Pending",
          serviceType: "",
          priorityLevel: "Medium",
          patientId: "",
          requestedBy: "",
          specialInstructions: "",
        })
        if (onTaskCreated) {
          onTaskCreated(data.task)
        }
      } else {
        setMessage(data.error || "Failed to create task.")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setMessage("Network error or CORS problem.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 p-5 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <span role="img" aria-label="robot" className="mr-2 text-2xl">
            🤖
          </span>{" "}
          Request Robot Service
        </h3>
        <span className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
          {availableRobots} Robots Available
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Type */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Service Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SERVICE_TYPES.map((type) => (
              <button
                key={type.name}
                type="button"
                onClick={() => handleServiceTypeClick(type.name)}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 border rounded-lg transition duration-200
                  ${form.serviceType === type.name ? "bg-blue-600 text-white shadow-md border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"}`}
              >
                <span className="text-2xl sm:text-3xl mb-1">{type.icon}</span>
                <span className="text-xs sm:text-sm font-medium text-center">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Assign Robot */}
        <div>
          <label htmlFor="AssignedTo" className="block text-gray-700 text-sm font-bold mb-2">
            Assign Robot <span className="text-red-500">*</span>
          </label>
          <select
            id="AssignedTo"
            name="AssignedTo"
            value={form.AssignedTo}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-gray-300 w-full focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select a Robot --</option>
            {ROBOT_OPTIONS.map((robot) => (
              <option key={robot} value={robot}>
                {robot}
              </option>
            ))}
          </select>
        </div>

        {/* Pickup Location */}
        <div>
          <label htmlFor="PickupLocation" className="block text-gray-700 text-sm font-bold mb-2">
            Pickup Location <span className="text-red-500">*</span>
          </label>
          <select
            id="PickupLocation"
            name="PickupLocation"
            value={form.PickupLocation}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-gray-300 w-full focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select pickup</option>
            {LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="DropLocation" className="block text-gray-700 text-sm font-bold mb-2">
            Destination <span className="text-red-500">*</span>
          </label>
          <select
            id="DropLocation"
            name="DropLocation"
            value={form.DropLocation}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-gray-300 w-full focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select dropoff</option>
            {LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Priority Level <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PRIORITY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handlePriorityLevelClick(level)}
                className={`px-4 py-2 rounded-md border transition duration-200
                  ${form.priorityLevel === level ? "bg-blue-600 text-white shadow-md border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Patient ID (Optional) */}
        <div>
          <label htmlFor="patientId" className="block text-gray-700 text-sm font-bold mb-2">
            Patient ID (Optional)
          </label>
          <input
            id="patientId"
            type="text"
            name="patientId"
            placeholder="Enter patient ID"
            value={form.patientId}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Requested By */}
        <div>
          <label htmlFor="requestedBy" className="block text-gray-700 text-sm font-bold mb-2">
            Requested By <span className="text-red-500">*</span>
          </label>
          <input
            id="requestedBy"
            type="text"
            name="requestedBy"
            placeholder="Your name or staff ID"
            value={form.requestedBy}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-gray-300 w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label htmlFor="specialInstructions" className="block text-gray-700 text-sm font-bold mb-2">
            Special Instructions
          </label>
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            placeholder="Any special handling instructions..."
            value={form.specialInstructions}
            onChange={handleChange}
            rows={3}
            className="p-2 rounded-md border border-gray-300 w-full focus:ring-blue-500 focus:border-blue-500 resize-y"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2 shadow-lg"
        >
          <span className="text-xl">✅</span>
          <span>{loading ? "Assigning..." : "Assign Task & Update Robot"}</span>
        </button>
      </form>

      {message && (
        <p className={`mt-6 text-center text-sm ${createdTaskDetails ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {createdTaskDetails && (
        <div className="mt-8 p-5 border border-blue-200 rounded-md bg-blue-50 text-gray-700">
          <h4 className="text-lg font-medium mb-3 text-blue-800">Created Task Details:</h4>
          <p className="mb-1">
            <strong className="font-semibold">Task ID:</strong> {createdTaskDetails.TaskID}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Assigned To:</strong> {createdTaskDetails.AssignedTo}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Service Type:</strong> {createdTaskDetails.serviceType || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Pickup Location:</strong> {createdTaskDetails.PickupLocation}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Drop-off Location:</strong> {createdTaskDetails.DropLocation}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Priority Level:</strong> {createdTaskDetails.priorityLevel || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Patient ID:</strong> {createdTaskDetails.patientId || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Requested By:</strong> {createdTaskDetails.requestedBy || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Special Instructions:</strong>{" "}
            {createdTaskDetails.specialInstructions || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Created At:</strong>{" "}
            {new Date(createdTaskDetails.Timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default TaskForm
