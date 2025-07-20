"use client"

import { useState, useEffect, useCallback } from "react"
import TaskForm from "@/components/task-form"
import TaskList from "@/components/task-list"
import RobotInfoById from "@/components/robot-info-by-id"
import RobotFleetOverview from "@/components/robot-fleet-overview"
import HospitalLayout from "@/components/hospital-layout"
import InventoryManagement from "@/components/inventory-management"
import VoiceCommand from "@/components/voice-command"
import LoginPage from "@/components/login-page"
import TopHeader from "@/components/top-header"

export default function App() {
  const API_URL = "https://d0dcaw3418.execute-api.us-east-1.amazonaws.com/dev/tasks?all_robots=true"
  const [refreshTasks, setRefreshTasks] = useState(0)
  const [activeTab, setActiveTab] = useState("createTask")
  const [robots, setRobots] = useState([])

  // Add authentication state with localStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true) // Add loading state

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = () => {
      if (typeof window !== 'undefined') {
        try {
          const storedAuth = localStorage.getItem("hospigo-auth")
          const storedUser = localStorage.getItem("hospigo-user")

          if (storedAuth === "true" && storedUser) {
            const user = JSON.parse(storedUser)
            setIsAuthenticated(true)
            setCurrentUser(user)
          }
        } catch (error) {
          console.error("Error checking existing session:", error)
          // Clear corrupted data
          localStorage.removeItem("hospigo-auth")
          localStorage.removeItem("hospigo-user")
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  // Handle login with persistence
  const handleLogin = (authStatus) => {
    setIsAuthenticated(authStatus)
    if (authStatus) {
      localStorage.setItem("hospigo-auth", "true")
    } else {
      localStorage.removeItem("hospigo-auth")
      localStorage.removeItem("hospigo-user")
    }
  }

  // Handle user set with persistence
  const handleUserSet = (user) => {
    setCurrentUser(user)
    if (user) {
      localStorage.setItem("hospigo-user", JSON.stringify(user))
    } else {
      localStorage.removeItem("hospigo-user")
    }
  }

  // Handle logout with cleanup
  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setNotifications([])
    localStorage.removeItem("hospigo-auth")
    localStorage.removeItem("hospigo-user")
  }

  // Function to get stored robot data from localStorage
  const getStoredRobotData = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hospigo-robot-data")
      return stored ? JSON.parse(stored) : {}
    }
    return {}
  }

  // Function to store robot data in localStorage
  const storeRobotData = (robotData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hospigo-robot-data", JSON.stringify(robotData))
    }
  }

  // Define room positions for distance calculation
  const ROOM_POSITIONS = {
    Reception: { x: 100, y: 80 },
    Radiology: { x: 220, y: 80 },
    Pharmacy: { x: 340, y: 80 },
    Laboratory: { x: 460, y: 80 },
    Emergency: { x: 100, y: 160 },
    "Main Corridor": { x: 340, y: 160 },
    "Ward A": { x: 100, y: 240 },
    "Ward B": { x: 220, y: 240 },
    "Surgery 1": { x: 340, y: 240 },
    "Surgery 2": { x: 460, y: 240 },
    ICU: { x: 580, y: 240 },
    Kitchen: { x: 100, y: 320 },
    Laundry: { x: 220, y: 320 },
    "Waste Mgmt": { x: 340, y: 320 },
    Storage: { x: 460, y: 320 },
    "Charging 1": { x: 70, y: 290 },
    "Charging 2": { x: 540, y: 210 },
  }

  // Function to calculate distance between two points
  const calculateDistance = (pos1, pos2) => {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Function to get robot's current position
  const getRobotCurrentPosition = (robot) => {
    if (robot.Status === "Charging") {
      return ROOM_POSITIONS["Charging 1"] || ROOM_POSITIONS["Main Corridor"]
    } else if (robot.Status === "Active") {
      return ROOM_POSITIONS[robot.PickupLocation] || ROOM_POSITIONS["Main Corridor"]
    } else if (robot.Status === "Task Completed" || robot.Status === "Idle") {
      return ROOM_POSITIONS[robot.DropLocation] || ROOM_POSITIONS["Main Corridor"]
    }
    return ROOM_POSITIONS["Main Corridor"]
  }

  // Smart robot selection function
  const selectOptimalRobot = (pickupLocation, robots) => {
    const pickupPos = ROOM_POSITIONS[pickupLocation]
    if (!pickupPos) return robots[0]?.Robot_Id // Fallback to first robot

    // Filter available robots (Idle or Task Completed)
    const availableRobots = robots.filter((robot) => robot.Status === "Idle" || robot.Status === "Task Completed")

    if (availableRobots.length > 0) {
      // Find the closest available robot
      let closestRobot = availableRobots[0]
      let minDistance = Number.POSITIVE_INFINITY

      availableRobots.forEach((robot) => {
        const robotPos = getRobotCurrentPosition(robot)
        const distance = calculateDistance(pickupPos, robotPos)

        // Prioritize robots with higher battery levels if distances are similar
        const batteryBonus = robot.Battery / 1000 // Small bonus for higher battery
        const adjustedDistance = distance - batteryBonus

        if (adjustedDistance < minDistance) {
          minDistance = adjustedDistance
          closestRobot = robot
        }
      })

      return closestRobot.Robot_Id
    }

    // If no robots are available, find the one that will finish soonest
    const activeRobots = robots.filter((robot) => robot.Status === "Active")

    if (activeRobots.length > 0) {
      let soonestRobot = activeRobots[0]
      let maxProgress = -1

      activeRobots.forEach((robot) => {
        if (robot.taskProgress > maxProgress) {
          maxProgress = robot.taskProgress
          soonestRobot = robot
        }
      })

      return soonestRobot.Robot_Id
    }

    // Fallback to first robot if no logic applies
    return robots[0]?.Robot_Id || "Robot-A1"
  }

  // Predefined sample tasks for robots to show by default
  const getDefaultTaskForRobot = (robotId) => {
    const defaultTasks = {
      "Robot-A1": {
        PickupLocation: "Ward B",
        DropLocation: "Kitchen",
        serviceType: "Medication Delivery",
        priorityLevel: "Medium",
        patientId: "P001",
        requestedBy: "Dr. Smith",
        taskProgress: 100,
      },
      "Robot-B2": {
        PickupLocation: "Pharmacy",
        DropLocation: "ICU",
        serviceType: "Lab Sample Transport",
        priorityLevel: "High",
        patientId: "P002",
        requestedBy: "Nurse Johnson",
        taskProgress: 100,
      },
      "Robot-C3": {
        PickupLocation: "Laboratory",
        DropLocation: "Ward A",
        serviceType: "Medical Equipment",
        priorityLevel: "Low",
        patientId: "P003",
        requestedBy: "Dr. Wilson",
        taskProgress: 100,
      },
      "Robot-D4": {
        PickupLocation: "Kitchen",
        DropLocation: "Surgery 1",
        serviceType: "Food Delivery",
        priorityLevel: "Medium",
        patientId: "",
        requestedBy: "Staff Kitchen",
        taskProgress: 100,
      },
      "Robot-E5": {
        PickupLocation: "Laundry",
        DropLocation: "Ward B",
        serviceType: "Textile Service",
        priorityLevel: "Low",
        patientId: "",
        requestedBy: "Housekeeping",
        taskProgress: 100,
      },
      "Robot-F6": {
        PickupLocation: "Storage",
        DropLocation: "Emergency",
        serviceType: "Waste Disposal",
        priorityLevel: "Medium",
        patientId: "",
        requestedBy: "Maintenance",
        taskProgress: 100,
      },
      "Robot-G7": {
        PickupLocation: "Reception",
        DropLocation: "Surgery 2",
        serviceType: "Blood Transport",
        priorityLevel: "Emergency",
        patientId: "P007",
        requestedBy: "Dr. Brown",
        taskProgress: 100,
      },
    }
    return (
      defaultTasks[robotId] || {
        PickupLocation: "Reception",
        DropLocation: "Storage",
        serviceType: "General Transport",
        priorityLevel: "Medium",
        patientId: "",
        requestedBy: "System",
        taskProgress: 100,
      }
    )
  }

  // Initial fetch of robots from backend
  const fetchRobotsFromBackend = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
      })
      const data = await res.json()
      if (!res.ok) {
        console.error("Failed to fetch initial robot fleet data:", data.error)
        return []
      }
      return data.robots
    } catch (err) {
      console.error("Network error or CORS problem while fetching initial robot fleet data:", err)
      return []
    }
  }, [])

  // Effect for initial load and setting up the simulation (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return

    let simulationInterval: NodeJS.Timeout

    const initializeRobots = async () => {
      // Add initial sample notifications
      setTimeout(() => {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "info",
            message: "System initialized successfully",
            robotId: null,
            timestamp: new Date(),
            read: false,
          },
          {
            id: Date.now() + 1,
            type: "success",
            message: "All robots are online and ready",
            robotId: null,
            timestamp: new Date(),
            read: false,
          },
          {
            id: Date.now() + 2,
            type: "warning",
            message: "Robot-C3 battery at 25% - monitoring",
            robotId: "Robot-C3",
            timestamp: new Date(),
            read: false,
          },
        ])
      }, 2000)

      // Add periodic sample notifications
      setTimeout(() => {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now() + 3,
            type: "info",
            message: "Daily maintenance check completed",
            robotId: null,
            timestamp: new Date(),
            read: false,
          },
        ])
      }, 5000)

      setTimeout(() => {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now() + 4,
            type: "success",
            message: "Inventory levels updated automatically",
            robotId: null,
            timestamp: new Date(),
            read: false,
          },
        ])
      }, 8000)

      const storedData = getStoredRobotData()
      try {
        const backendRobots = await fetchRobotsFromBackend()
        setRobots(
          backendRobots.map((robot) => {
            const defaultTask = getDefaultTaskForRobot(robot.Robot_Id)
            const storedRobot = storedData[robot.Robot_Id]
            return {
              ...robot,
              // Use stored battery or generate new one only if not stored
              Battery:
                storedRobot?.Battery !== undefined
                  ? storedRobot.Battery
                  : Math.floor(Math.random() * (100 - 40 + 1)) + 40,
              // Use stored temperature or generate new one only if not stored
              Temperature:
                storedRobot?.Temperature !== undefined
                  ? storedRobot.Temperature
                  : Math.floor(Math.random() * (6 - 2 + 1)) + 2,
              // Use stored status or default to Idle
              Status: storedRobot?.Status || "Idle",
              // Use stored task progress or default
              taskProgress:
                storedRobot?.taskProgress !== undefined ? storedRobot.taskProgress : defaultTask.taskProgress,
              // Use stored task active state or default
              taskActive: storedRobot?.taskActive || false,
              // Set default task details if not already present
              PickupLocation: robot.PickupLocation || defaultTask.PickupLocation,
              DropLocation: robot.DropLocation || defaultTask.DropLocation,
              serviceType: robot.serviceType || defaultTask.serviceType,
              priorityLevel: robot.priorityLevel || defaultTask.priorityLevel,
              patientId: robot.patientId || defaultTask.patientId,
              requestedBy: robot.requestedBy || defaultTask.requestedBy,
              specialInstructions: robot.specialInstructions || "",
              CurrentTaskId: robot.CurrentTaskId || "",
            }
          }),
        )
      } catch (error) {
        console.error("Failed to initialize robots:", error)
        // Set default robots with sample tasks if API fails
        const defaultRobots = [
          {
            Robot_Id: "Robot-A1",
            Battery: storedData["Robot-A1"]?.Battery || 85,
            Temperature: storedData["Robot-A1"]?.Temperature || 4,
            Status: storedData["Robot-A1"]?.Status || "Idle",
            taskProgress: storedData["Robot-A1"]?.taskProgress || 100,
            taskActive: storedData["Robot-A1"]?.taskActive || false,
            ...getDefaultTaskForRobot("Robot-A1"),
          },
          {
            Robot_Id: "Robot-B2",
            Battery: storedData["Robot-B2"]?.Battery || 92,
            Temperature: storedData["Robot-B2"]?.Temperature || 3,
            Status: storedData["Robot-B2"]?.Status || "Idle",
            taskProgress: storedData["Robot-B2"]?.taskProgress || 100,
            taskActive: storedData["Robot-B2"]?.taskActive || false,
            ...getDefaultTaskForRobot("Robot-B2"),
          },
          {
            Robot_Id: "Robot-C3",
            Battery: storedData["Robot-C3"]?.Battery || 78,
            Temperature: storedData["Robot-C3"]?.Temperature || 5,
            Status: storedData["Robot-C3"]?.Status || "Idle",
            taskProgress: storedData["Robot-C3"]?.taskProgress || 100,
            taskActive: storedData["Robot-C3"]?.taskActive || false,
            ...getDefaultTaskForRobot("Robot-C3"),
          },
          {
            Robot_Id: "Robot-D4",
            Battery: storedData["Robot-D4"]?.Battery || 67,
            Temperature: storedData["Robot-D4"]?.Temperature || 2,
            Status: storedData["Robot-D4"]?.Status || "Idle",
            taskProgress: storedData["Robot-D4"]?.taskProgress || 100,
            taskActive: storedData["Robot-D4"]?.taskActive || false,
            ...getDefaultTaskForRobot("Robot-D4"),
          },
          {
            Robot_Id: "Robot-E5",
            Battery: storedData["Robot-E5"]?.Battery || 91,
            Temperature: storedData["Robot-E5"]?.Temperature || 6,
            Status: storedData["Robot-E5"]?.Status || "Idle",
            taskProgress: storedData["Robot-E5"]?.taskProgress || 100,
            taskActive: storedData["Robot-E5"]?.taskActive || false,
            ...getDefaultTaskForRobot("Robot-E5"),
          },
          {
            Robot_Id: "Robot-F6",
            Battery: storedData["Robot-F6"]?.Battery || 73,
            Temperature: storedData["Robot-F6"]?.Temperature || 4,
            Status: storedData["Robot-F6"]?.Status || "Idle",
            taskProgress: storedData["Robot-F6"]?.taskProgress || 100,
            taskActive: storedData["Robot-F6"]?.taskActive || false,
            ...getDefaultTaskForRobot("Robot-F6"),
          },
          {
            Robot_Id: "Robot-G7",
            Battery: storedData["Robot-G7"]?.Battery || 88,
            Temperature: storedData["Robot-G7"]?.Temperature || 3,
            Status: storedData["Robot-G7"]?.Status || "Idle",
            taskProgress: storedData["Robot-G7"]?.taskProgress || 100,
            taskActive: storedData["Robot-G7"]?.taskActive || false,
            ...getDefaultTaskForRobot("Robot-G7"),
          },
        ]
        setRobots(defaultRobots)
      }
    }

    initializeRobots()

    // Setup the simulation interval - runs every 1 second for smooth updates
    simulationInterval = setInterval(() => {
      setRobots((prevRobots) => {
        const updatedRobots = prevRobots.map((robot) => {
          // Create a copy of the robot to avoid mutations
          const updatedRobot = { ...robot }

          // Task progress simulation - 4% per second
          if (updatedRobot.Status === "Active" && updatedRobot.taskActive === true) {
            // Increment progress by 4% every 1 second (completes in 25 seconds)
            updatedRobot.taskProgress = Math.min(100, (updatedRobot.taskProgress || 0) + 4)
            console.log(`🚀 ${updatedRobot.Robot_Id}: ${updatedRobot.taskProgress}% complete`)

            // Check if task is completed
            if (updatedRobot.taskProgress >= 100) {
              updatedRobot.Status = "Task Completed"
              updatedRobot.taskActive = false
              updatedRobot.taskProgress = 100 // Ensure it shows exactly 100%
              setNotifications((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  type: "success",
                  message: `Task completed successfully`,
                  robotId: updatedRobot.Robot_Id,
                  timestamp: new Date(),
                  read: false,
                },
              ])

              // Reset to idle after 10 seconds but KEEP task details for display
              setTimeout(() => {
                setRobots((currentRobots) =>
                  currentRobots.map((r) =>
                    r.Robot_Id === updatedRobot.Robot_Id
                      ? {
                          ...r,
                          Status: "Idle",
                          taskProgress: 100, // Keep progress at 100% even when Idle
                          taskActive: false,
                          // KEEP all task details to show completed work
                        }
                      : r,
                  ),
                )
              }, 10000) // 10 seconds to show "Task Completed"
            }
          }

          // Keep progress at 100% for completed tasks (don't reset until new task assigned)
          if (updatedRobot.Status === "Task Completed" && updatedRobot.taskProgress !== 100) {
            updatedRobot.taskProgress = 100
          }

          // Battery simulation - more realistic rates
          if (updatedRobot.Status === "Charging") {
            // Charging: +1% every 2 seconds (so +0.5% per second)
            updatedRobot.Battery = Math.min(100, (updatedRobot.Battery || 0) + 0.5)
            if (updatedRobot.Battery >= 100) {
              updatedRobot.Status = "Idle"
            }
          } else if (updatedRobot.Status === "Active") {
            // Active robots drain faster: -1% every 2 seconds (so -0.5% per second)
            updatedRobot.Battery = Math.max(0, (updatedRobot.Battery || 50) - 0.5)
          }

          // Idle robots don't drain battery - they maintain their current level

          // Auto-charge when battery is low (below 20%) - ONLY AFTER task completion OR if idle
          if (
            updatedRobot.Battery <= 20 &&
            (updatedRobot.Status === "Task Completed" ||
              (updatedRobot.Status === "Idle" && updatedRobot.taskProgress === 100))
          ) {
            updatedRobot.Status = "Charging"
            updatedRobot.taskActive = false
            setNotifications((prev) => [
              ...prev,
              {
                id: Date.now(),
                type: "warning",
                message: `Auto-charging due to low battery (${updatedRobot.Battery.toFixed(1)}%)`,
                robotId: updatedRobot.Robot_Id,
                timestamp: new Date(),
                read: false,
              },
            ])
          }

          // Temperature stays FIXED - no fluctuation
          // updatedRobot.Temperature remains the same

          return updatedRobot
        })

        // Store updated robot data in localStorage (including progress and status)
        const dataToStore = {}
        updatedRobots.forEach((robot) => {
          dataToStore[robot.Robot_Id] = {
            Battery: robot.Battery,
            Temperature: robot.Temperature,
            Status: robot.Status,
            taskProgress: robot.taskProgress,
            taskActive: robot.taskActive,
          }
        })
        storeRobotData(dataToStore)

        return updatedRobots
      })
    }, 1000) // Every 1 second for smooth updates

    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval)
      }
    }
  }, [isAuthenticated]) // Depend on authentication status

  const handleTaskCreated = (newTask) => {
    setRefreshTasks((prev) => prev + 1)
    console.log("🎯 Task created:", newTask)

    setRobots((prevRobots) => {
      const robotIndex = prevRobots.findIndex((r) => r.Robot_Id === newTask.AssignedTo)
      console.log(`🔍 Found robot at index: ${robotIndex}`)

      if (robotIndex > -1) {
        const updatedRobots = [...prevRobots]
        updatedRobots[robotIndex] = {
          ...updatedRobots[robotIndex],
          Status: "Active", // Changed from "Pending" to "Active"
          taskActive: true,
          taskProgress: 0, // Start from 0% for NEW tasks
          Temperature: Math.floor(Math.random() * (6 - 2 + 1)) + 2, // NEW random temperature 2-6°C
          PickupLocation: newTask.PickupLocation,
          DropLocation: newTask.DropLocation,
          serviceType: newTask.serviceType,
          priorityLevel: newTask.priorityLevel,
          patientId: newTask.patientId,
          requestedBy: newTask.requestedBy,
          specialInstructions: newTask.specialInstructions,
          CurrentTaskId: newTask.TaskID,
        }
        console.log(`✨ Robot updated:`, updatedRobots[robotIndex])

        // Store updated data immediately when task is created
        const dataToStore = {}
        updatedRobots.forEach((robot) => {
          dataToStore[robot.Robot_Id] = {
            Battery: robot.Battery,
            Temperature: robot.Temperature,
            Status: robot.Status,
            taskProgress: robot.taskProgress,
            taskActive: robot.taskActive,
          }
        })
        storeRobotData(dataToStore)

        return updatedRobots
      }
      return prevRobots
    })
  }

  // Role-based sidebar items
  const getSidebarItems = (userRole) => {
    const nurseItems = [
      { id: "createTask", label: "Request Robot Service" },
      { id: "robotById", label: "View Robot Info by Robot ID" },
      { id: "hospitalLayout", label: "Hospital Layout & Robot Locations" },
      { id: "voiceCommand", label: "Voice Command Integration" },
    ]

    const doctorItems = [
      { id: "createTask", label: "Request Robot Service" },
      { id: "robotById", label: "View Robot Info by Robot ID" },
      { id: "hospitalLayout", label: "Hospital Layout & Robot Locations" },
      { id: "inventory", label: "Inventory Auto-Update" },
      { id: "voiceCommand", label: "Voice Command Integration" },
      { id: "robotFleetOverview", label: "Robot Fleet Overview" },
      { id: "allTasks", label: "All Tasks" },
    ]

    return userRole === "Doctor" ? doctorItems : nurseItems
  }

  const sidebarItems = getSidebarItems(currentUser?.role)

  // Ensure the activeTab is always valid for the current user role
  useEffect(() => {
    if (currentUser) {
      const availableTabIds = sidebarItems.map((item) => item.id)
      if (!availableTabIds.includes(activeTab)) {
        setActiveTab(availableTabIds[0])
      }
    }
  }, [sidebarItems, activeTab, currentUser])

  // Calculate summary stats
  const totalRobots = robots.length
  const activeRobots = robots.filter((robot) => robot.Status === "Active").length // Removed "Pending"
  const chargingRobots = robots.filter((robot) => robot.Status === "Charging").length
  const idleRobots = robots.filter((robot) => robot.Status === "Idle").length
  const maintenanceRobots = robots.filter((robot) => robot.Status === "Maintenance").length
  const availableRobots = robots.filter((robot) => robot.Status === "Idle" || robot.Status === "Task Completed").length

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-2 bg-white rounded-full absolute"></div>
            <div className="w-2 h-8 bg-white rounded-full absolute"></div>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HOSPIGO...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onUserSet={handleUserSet} />
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Header */}
      <TopHeader
        currentUser={currentUser}
        notifications={notifications}
        onMarkAsRead={(id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))}
        onClearAll={() => setNotifications([])}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Sidebar */}
          <div className="flex-shrink-0 w-full lg:w-64 flex flex-col gap-3 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 mb-4 lg:mb-0">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-4 py-3 rounded-md text-left text-base font-medium transition duration-200 ease-in-out
        ${activeTab === item.id ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-grow">
            {activeTab === "createTask" && (
              <TaskForm
                onTaskCreated={handleTaskCreated}
                availableRobots={availableRobots}
                robots={robots}
                selectOptimalRobot={selectOptimalRobot}
              />
            )}
            {activeTab === "robotById" && <RobotInfoById />}
            {activeTab === "hospitalLayout" && <HospitalLayout robots={robots} />}
            {activeTab === "voiceCommand" && <VoiceCommand />}
            {currentUser?.role === "Doctor" && activeTab === "inventory" && <InventoryManagement />}
            {currentUser?.role === "Doctor" && activeTab === "robotFleetOverview" && (
              <RobotFleetOverview robots={robots} onRobotsUpdate={setRobots} />
            )}
            {currentUser?.role === "Doctor" && activeTab === "allTasks" && <TaskList refreshFlag={refreshTasks} />}
          </div>
        </div>
      </div>
    </div>
  )
}
