import { useState } from 'react'
import { motion } from 'framer-motion'
import BlocklyEditor from './components/BlocklyEditor.tsx'
import CarController from './components/CarController.tsx'
import CarStatus from './components/CarStatus.tsx'
import ManualControl from './components/ManualControl.tsx'
import Header from './components/Header.tsx'
import { Play, Square, RotateCcw } from 'lucide-react'
import './App.css'

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [program, setProgram] = useState<any[]>([])
  const [carUrl, setCarUrl] = useState('http://matteolecar.local')
  const [isConnected, setIsConnected] = useState(false)
  const [carStatus, setCarStatus] = useState<string>('idle')
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [executionLog, setExecutionLog] = useState<string[]>([])
  const [resetTrigger, setResetTrigger] = useState<number>(0)
  const [manualDirection, setManualDirection] = useState<string | null>(null)

  const handleConnectionChange = (url: string, connected: boolean) => {
    setCarUrl(url)
    setIsConnected(connected)
  }

  const handleRunProgram = () => {
    if (!isConnected) {
      alert('Cannot run program: Car is not connected. Please check your connection settings.')
      return
    }
    if (program.length === 0) {
      alert('Cannot run program: No valid program. Ajoutez un bloc Start puis chaînez des blocs derrière lui.')
      return
    }
    setIsRunning(true)
  }

  const handleStopProgram = async () => {
    setIsRunning(false)
    
    if (isConnected) {
      try {
        await fetch(`${carUrl}/direction?dir=stop`)
        await fetch(`${carUrl}/direction?dir=stop`)
      } catch (error) {
        console.error('Failed to send immediate stop command:', error)
      }
    }
  }

  const handleResetProgram = () => {
    setProgram([])
    setIsRunning(false)
    setResetTrigger(prev => prev + 1)
  }

  const handleStatusChange = (status: string, step: number, log: string[]) => {
    setCarStatus(status)
    setCurrentStep(step)
    setExecutionLog(log)
    if (status === 'completed' && isRunning) {
      setIsRunning(false)
    }
  }

  const formatCommandLog = (command: any): string => {
    switch (command.action) {
      case 'move_forward':
        return `🚗 Moving forward for ${command.duration}s`
      case 'move_backward':
        return `🔄 Moving backward for ${command.duration}s`
      case 'turn_left':
        return `↰ Turning left ${command.degrees}°`
      case 'turn_right':
        return `↱ Turning right ${command.degrees}°`
      case 'stop':
        return `⏹️ Stopping for ${command.duration}s`
      case 'repeat':
        return `🔁 Repeating ${command.count} times`
      default:
        return `❓ Unknown command: ${command.action}`
    }
  }

  return (
    <div className="app" style={{ minHeight: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
      <Header onConnectionChange={handleConnectionChange} />
      
      <main className="main-content">
        <div className="editor-section">
          <div className="editor-header">
            <h2>Visual Programming</h2>
            <div className="control-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`btn btn-primary ${isRunning ? 'disabled' : ''}`}
                onClick={handleRunProgram}
                disabled={isRunning}
              >
                <Play size={16} />
                Run
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary"
                onClick={handleStopProgram}
                disabled={!isRunning}
              >
                <Square size={16} />
                Stop
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline"
                onClick={handleResetProgram}
              >
                <RotateCcw size={16} />
                Reset
              </motion.button>
            </div>
          </div>
          
          <BlocklyEditor onProgramChange={setProgram} resetTrigger={resetTrigger} />
          
          <CarStatus 
            carStatus={carStatus}
            currentStep={currentStep}
            program={program}
            executionLog={executionLog}
            formatCommandLog={formatCommandLog}
          />
        </div>
        
        <div className="controller-section">
          <CarController 
            isRunning={isRunning} 
            program={program} 
            carUrl={carUrl}
            isConnected={isConnected}
            onStatusChange={handleStatusChange}
            manualDirection={manualDirection}
          />
          
          <ManualControl 
            carUrl={carUrl}
            isConnected={isConnected}
            onDirectionChange={setManualDirection}
          />
        </div>
      </main>
    </div>
  )
}

export default App
