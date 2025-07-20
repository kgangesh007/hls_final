"use client"

import { useState, useRef, useEffect } from "react"

const VoiceCommand = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const [lastCommand, setLastCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState([])
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setIsSupported(true)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setTranscript("Listening...")
      }

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)

        if (finalTranscript) {
          setLastCommand(finalTranscript)
          setCommandHistory((prev) => [
            { command: finalTranscript, timestamp: new Date(), processed: processCommand(finalTranscript) },
            ...prev.slice(0, 4), // Keep only last 5 commands
          ])
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        setIsListening(false)
        setTranscript(`Error: ${event.error}`)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const processCommand = (command) => {
    const lowerCommand = command.toLowerCase()

    // Simple command processing logic
    if (lowerCommand.includes("robot") && lowerCommand.includes("status")) {
      return { action: "robot_status", response: "Checking robot fleet status..." }
    } else if (lowerCommand.includes("create") && lowerCommand.includes("task")) {
      return { action: "create_task", response: "Opening task creation form..." }
    } else if (lowerCommand.includes("inventory") || lowerCommand.includes("stock")) {
      return { action: "inventory", response: "Checking inventory levels..." }
    } else if (lowerCommand.includes("emergency") || lowerCommand.includes("urgent")) {
      return { action: "emergency", response: "Activating emergency protocol..." }
    } else if (lowerCommand.includes("help")) {
      return { action: "help", response: "Available commands: robot status, create task, check inventory, emergency" }
    } else {
      return { action: "unknown", response: 'Command not recognized. Say "help" for available commands.' }
    }
  }

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      setTranscript("")
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const clearTranscript = () => {
    setTranscript("")
    setLastCommand("")
  }

  const getActionIcon = (action) => {
    const icons = {
      robot_status: "🤖",
      create_task: "➕",
      inventory: "📦",
      emergency: "🚨",
      help: "❓",
      unknown: "❌",
    }
    return icons[action] || "💬"
  }

  if (!isSupported) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl shadow-lg">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🚫</span>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Voice Commands Not Supported</h3>
          <p className="text-gray-600">
            Your browser doesn't support speech recognition. Please use Chrome or Edge for voice commands.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Voice Command Integration</h3>
        <p className="text-gray-600">Click the microphone to speak commands</p>
      </div>

      {/* Microphone Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
          } shadow-lg hover:shadow-xl`}
        >
          {/* Concentric circles effect */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-blue-300 opacity-40 animate-ping animation-delay-75"></div>
              <div className="absolute inset-4 rounded-full bg-blue-200 opacity-50 animate-ping animation-delay-150"></div>
            </>
          )}
          <span className="text-white text-4xl z-10">{isListening ? "🔴" : "🎤"}</span>
        </button>
      </div>

      {/* Status */}
      <div className="text-center mb-6">
        <p className={`text-lg font-medium ${isListening ? "text-red-600" : "text-gray-600"}`}>
          {isListening ? "Listening..." : "Click microphone to start"}
        </p>
      </div>

      {/* Transcript Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">Spoken Command</label>
          {transcript && (
            <button onClick={clearTranscript} className="text-xs text-gray-500 hover:text-gray-700">
              Clear
            </button>
          )}
        </div>
        <textarea
          value={transcript || "Spoken command will appear here..."}
          readOnly
          className="w-full h-24 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-none"
          placeholder="Spoken command will appear here..."
        />
      </div>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Commands</h4>
          <div className="space-y-3">
            {commandHistory.map((entry, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{getActionIcon(entry.processed.action)}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">"{entry.command}"</p>
                  <p className="text-sm text-gray-600 mt-1">{entry.processed.response}</p>
                  <p className="text-xs text-gray-500 mt-1">{entry.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Commands */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Try saying:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="bg-blue-50 p-2 rounded text-blue-800">"Check robot status"</div>
          <div className="bg-green-50 p-2 rounded text-green-800">"Create new task"</div>
          <div className="bg-purple-50 p-2 rounded text-purple-800">"Check inventory"</div>
          <div className="bg-red-50 p-2 rounded text-red-800">"Emergency protocol"</div>
        </div>
      </div>
    </div>
  )
}

export default VoiceCommand
