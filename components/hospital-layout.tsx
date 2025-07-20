"use client"

const HospitalLayout = ({ robots }) => {
  // Define positions and sizes for each room based on the provided image
  // These are arbitrary values to create a visual layout
  const ROOM_POSITIONS = {
    Reception: { top: 50, left: 50, width: 100, height: 60, color: "bg-blue-100", text: "Reception" },
    Radiology: { top: 50, left: 170, width: 100, height: 60, color: "bg-purple-100", text: "Radiology" },
    Pharmacy: { top: 50, left: 290, width: 100, height: 60, color: "bg-green-100", text: "Pharmacy" },
    Laboratory: { top: 50, left: 410, width: 100, height: 60, color: "bg-yellow-100", text: "Laboratory" },
    Emergency: { top: 130, left: 50, width: 100, height: 60, color: "bg-red-100", text: "Emergency" },
    "Main Corridor": { top: 130, left: 170, width: 340, height: 60, color: "bg-gray-200", text: "Main Corridor" },
    "Ward A": { top: 210, left: 50, width: 100, height: 60, color: "bg-pink-100", text: "Ward A" },
    "Ward B": { top: 210, left: 170, width: 100, height: 60, color: "bg-blue-200", text: "Ward B" },
    "Surgery 1": { top: 210, left: 290, width: 100, height: 60, color: "bg-green-200", text: "Surgery 1" },
    "Surgery 2": { top: 210, left: 410, width: 100, height: 60, color: "bg-purple-200", text: "Surgery 2" },
    ICU: { top: 210, left: 530, width: 100, height: 60, color: "bg-yellow-200", text: "ICU" },
    Kitchen: { top: 290, left: 50, width: 100, height: 60, color: "bg-blue-300", text: "Kitchen" },
    Laundry: { top: 290, left: 170, width: 100, height: 60, color: "bg-pink-200", text: "Laundry" },
    "Waste Mgmt": { top: 290, left: 290, width: 100, height: 60, color: "bg-red-200", text: "Waste Mgmt" },
    Storage: { top: 290, left: 410, width: 100, height: 60, color: "bg-gray-300", text: "Storage" },
    "Charging 1": { top: 270, left: 50, width: 20, height: 20, color: "bg-yellow-300", text: "C1" }, // Smaller charging points
    "Charging 2": { top: 190, left: 530, width: 20, height: 20, color: "bg-yellow-300", text: "C2" },
  }

  // Function to get robot position based on its status and task progress
  const getRobotPosition = (robot) => {
    const defaultPosition = ROOM_POSITIONS["Main Corridor"] // Default if no specific location

    if (robot.Status === "Charging" || robot.Battery <= 20) {
      // If charging or low battery, place it at a charging station
      const chargingStation = ROOM_POSITIONS[robot.ChargingStation || "Charging 1"]
      return {
        top: chargingStation.top + chargingStation.height / 2 - 10,
        left: chargingStation.left + chargingStation.width / 2 - 10,
      }
    } else if (robot.Status === "Active" && robot.taskProgress !== undefined) {
      // For active robots, show at pickup location until task is 100% complete
      const pickup = ROOM_POSITIONS[robot.PickupLocation]
      if (pickup) {
        return {
          top: pickup.top + pickup.height / 2 - 10,
          left: pickup.left + pickup.width / 2 - 10,
        }
      }
    } else if ((robot.Status === "Task Completed" || robot.Status === "Idle") && robot.taskProgress === 100) {
      // For completed tasks or idle robots with 100% progress, show at drop location
      const drop = ROOM_POSITIONS[robot.DropLocation]
      if (drop) {
        return {
          top: drop.top + drop.height / 2 - 10,
          left: drop.left + drop.width / 2 - 10,
        }
      }
    }

    // Default to a central corridor if no specific location
    return {
      top: defaultPosition.top + defaultPosition.height / 2 - 10,
      left: defaultPosition.left + defaultPosition.width / 2 - 10,
    }
  }

  return (
    <div className="bg-gray-50 p-5 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">Hospital Layout & Robot Locations</h3>

      <div className="relative w-full h-[500px] bg-white border border-gray-300 rounded-lg overflow-hidden">
        {/* Render Rooms */}
        {Object.entries(ROOM_POSITIONS).map(([roomName, pos]) => (
          <div
            key={roomName}
            className={`absolute rounded-md border border-gray-400 flex items-center justify-center text-xs font-medium text-gray-800 ${pos.color}`}
            style={{
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              width: `${pos.width}px`,
              height: `${pos.height}px`,
            }}
          >
            {pos.text}
          </div>
        ))}

        {/* Render Robots */}
        {robots.map((robot) => {
          const robotPos = getRobotPosition(robot)
          let robotColorClass = "bg-gray-700" // Default for unknown status

          if (robot.Status === "Active") {
            robotColorClass = "bg-blue-500"
          } else if (robot.Status === "Charging") {
            robotColorClass = "bg-yellow-500"
          } else if (robot.Status === "Idle" || robot.Status === "Task Completed") {
            robotColorClass = "bg-green-500"
          } else if (robot.Status === "Maintenance") {
            robotColorClass = "bg-red-500"
          }

          // Extract robot number (A1, B2, etc.) from Robot_Id
          const robotNumber = robot.Robot_Id.replace("Robot-", "")

          return (
            <div
              key={robot.Robot_Id}
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white ${robotColorClass}`}
              style={{
                top: `${robotPos.top}px`,
                left: `${robotPos.left}px`,
                transition: "top 1s ease-in-out, left 1s ease-in-out",
              }}
              title={`${robot.Robot_Id} - ${robot.Status} - Battery: ${Number(robot.Battery).toFixed(0)}%`}
            >
              {robotNumber}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Legend</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm text-gray-700">
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span> Idle Robot
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span> Moving Robot
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></span> Charging Robot
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span> Maintenance Robot
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-md bg-blue-100 border border-gray-400 mr-2"></span> Patient Room
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-md bg-gray-300 border border-gray-400 mr-2"></span> Storage
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-md bg-red-100 border border-gray-400 mr-2"></span> Emergency
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-md bg-gray-200 border border-gray-400 mr-2"></span> Corridor
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalLayout
