"use client"

import { useState, useEffect } from "react"

const RobotFleetOverview = ({ robots, onRobotsUpdate }) => {
  // Now receives robots and update function
  const API_URL = "https://d0dcaw3418.execute-api.us-east-1.amazonaws.com/dev/tasks?all_robots=true"
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Only set loading to false if we have robots from parent
    if (robots.length > 0) {
      setLoading(false)
    } else {
      // Try to fetch robots only if parent hasn't provided any
      const fetchInitialRobots = async () => {
        try {
          const res = await fetch(API_URL, { method: "GET", mode: "cors" })
          const data = await res.json()
          if (res.ok && data.robots) {
            const initializedRobots = data.robots.map((robot) => ({
              ...robot,
              Battery: Number(robot.Battery) || Math.floor(Math.random() * (100 - 40 + 1)) + 40,
              Temperature: robot.Temperature || Math.floor(Math.random() * (6 - 2 + 1)) + 2, // 2-6°C
              Status: "Idle", // Force all robots to be Idle by default
              taskProgress: robot.taskProgress || 0,
              taskActive: false,
              PickupLocation: robot.PickupLocation || "",
              DropLocation: robot.DropLocation || "",
              serviceType: robot.serviceType || "",
            }))
            onRobotsUpdate(initializedRobots)
          }
        } catch (err) {
          console.error("Fetch error:", err)
          setError("Failed to load robots")
        } finally {
          setLoading(false)
        }
      }
      fetchInitialRobots()
    }
  }, [robots.length]) // Only depend on robots length

  // Calculate summary stats
  const totalRobots = robots.length
  const activeRobots = robots.filter((robot) => robot.Status === "Active").length // Removed "Pending"
  const chargingRobots = robots.filter((robot) => robot.Status === "Charging").length
  const idleRobots = robots.filter((robot) => robot.Status === "Idle").length
  const maintenanceRobots = robots.filter((robot) => robot.Status === "Maintenance").length

  const avgBattery =
    totalRobots > 0
      ? (robots.reduce((sum, robot) => sum + (Number(robot.Battery) || 0), 0) / totalRobots).toFixed(0)
      : 0

  // Placeholder for tasks today and efficiency - these would require more complex backend logic
  const tasksToday = 0 // Placeholder
  const efficiency = 90 // Placeholder

  return (
    <div className="bg-gray-50 p-5 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">Robot Fleet Overview</h3>
      </div>

      {loading && <p className="text-gray-600">Loading robot fleet data...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Robots</p>
                <p className="text-2xl font-bold text-blue-900">{totalRobots}</p>
                <p className="text-xs text-blue-600">
                  {activeRobots} active, {chargingRobots} charging, {idleRobots} idle, {maintenanceRobots} maintenance
                </p>
              </div>
              <span className="text-blue-500 text-3xl">📈</span>
            </div>

            <div className="bg-green-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Avg Battery</p>
                <p className="text-2xl font-bold text-green-900">{avgBattery}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${avgBattery}%` }}></div>
                </div>
              </div>
              <span className="text-green-500 text-3xl">🔋</span>
            </div>

            <div className="bg-purple-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Tasks Today</p>
                <p className="text-2xl font-bold text-purple-900">{tasksToday}</p>
                <p className="text-xs text-purple-600">~0km traveled</p>
              </div>
              <span className="text-purple-500 text-3xl">📦</span>
            </div>

            <div className="bg-orange-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Efficiency</p>
                <p className="text-2xl font-bold text-orange-900">{efficiency}%</p>
                <p className="text-xs text-orange-600">0 alerts pending</p>
              </div>
              <span className="text-orange-500 text-3xl">🚀</span>
            </div>
          </div>

          {/* Individual Robot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {robots.length === 0 && (
              <p className="col-span-full text-gray-600 text-center">No robots found or no current tasks assigned.</p>
            )}

            {robots.map((robot) => (
              <div key={robot.Robot_Id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">{robot.Robot_Id}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium  ${
                      robot.Status === "Active"
                        ? "bg-blue-100 text-blue-800"
                        : // Active only
                          robot.Status === "Charging"
                          ? "bg-yellow-100 text-yellow-800"
                          : // Charging
                            robot.Status === "Task Completed"
                            ? "bg-green-100 text-green-800"
                            : // Task Completed
                              robot.Status === "Maintenance"
                              ? "bg-red-100 text-red-800"
                              : // Maintenance
                                "bg-gray-100 text-gray-800" // Idle (default)
                    }`}
                  >
                    {robot.Status || "Idle"}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">Battery</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        Number(robot.Battery) > 50
                          ? "bg-green-500"
                          : Number(robot.Battery) > 20
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Number(robot.Battery) || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Number(robot.Battery) !== undefined ? Number(robot.Battery).toFixed(0) : "N/A"}%
                  </p>
                </div>

                {/* Show Task Progress Bar for Active, Task Completed, AND Idle robots with task progress > 0 */}
                {(robot.Status === "Active" ||
                  robot.Status === "Task Completed" ||
                  (robot.Status === "Idle" && robot.taskProgress > 0)) &&
                  robot.taskProgress !== undefined && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Task Progress</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-1000 ease-linear ${
                            robot.Status === "Task Completed" || (robot.Status === "Idle" && robot.taskProgress === 100)
                              ? "bg-green-500"
                              : "bg-purple-500"
                          }`}
                          style={{ width: `${robot.taskProgress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {robot.taskProgress ? robot.taskProgress.toFixed(0) : 0}% Complete
                        {(robot.Status === "Task Completed" ||
                          (robot.Status === "Idle" && robot.taskProgress === 100)) &&
                          " ✅"}
                      </p>
                    </div>
                  )}

                <div className="text-sm text-gray-700 space-y-1">
                  <p className="flex items-center">
                    <span className="mr-2 text-lg">🌡️</span>{" "}
                    {robot.Temperature !== undefined ? robot.Temperature.toFixed(0) : "N/A"}°C
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2 text-lg">📍</span> {robot.PickupLocation || "N/A"} -{" "}
                    {robot.DropLocation || "N/A"}
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2 text-lg">📦</span> {robot.serviceType || "No Task"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default RobotFleetOverview
