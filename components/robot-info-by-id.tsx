"use client"

import { useState } from "react"

const RobotInfoById = () => {
  const API_URL = "https://d0dcaw3418.execute-api.us-east-1.amazonaws.com/dev/tasks"
  const [robotId, setRobotId] = useState("")
  const [robotData, setRobotData] = useState(null) // This will now hold the latest task for the robot
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchRobot = async () => {
    if (!robotId) {
      setError("Please enter a Robot ID.")
      return
    }

    setError("")
    setRobotData(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}?robot_id=${robotId}`, {
        method: "GET",
        mode: "cors",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Robot not found")
        return
      }

      // The Lambda now returns the latest task for the robot under 'data'
      setRobotData(data.data)
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Network or CORS error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 p-5 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">View Robot Info by Robot ID</h3>

      <div className="flex gap-3 items-center mb-4">
        <input
          placeholder="Enter Robot ID (e.g., Robot-A1)"
          value={robotId}
          onChange={(e) => setRobotId(e.target.value)}
          className="flex-grow p-2 rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500"
        />
        <button
          onClick={fetchRobot}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? "Fetching..." : "Fetch Robot Info"}
        </button>
      </div>

      {error && <p className="text-red-600 mt-3">{error}</p>}

      {robotData && (
        <div className="mt-5 p-4 border border-green-200 rounded-md bg-green-50">
          <h4 className="text-lg font-medium mb-2 text-green-800">Robot Info:</h4>
          <p className="mb-1">
            <strong className="font-semibold">Robot ID:</strong> {robotData.Robot_Id}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Current Task ID:</strong> {robotData.CurrentTaskId}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Service Type:</strong> {robotData.serviceType || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Pickup:</strong> {robotData.PickupLocation}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Drop:</strong> {robotData.DropLocation}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Priority:</strong> {robotData.priorityLevel || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Patient ID:</strong> {robotData.patientId || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Requested By:</strong> {robotData.requestedBy || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Special Instructions:</strong> {robotData.specialInstructions || "N/A"}
          </p>
          <p className="mb-1">
            <strong className="font-semibold">Assigned Timestamp:</strong>{" "}
            {new Date(robotData.AssignedTimestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default RobotInfoById
