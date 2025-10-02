import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Car, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { sendCarRequest, sleep } from '../utils/networkUtils'

interface CarControllerProps {
  isRunning: boolean
  program: any[]
  carUrl: string
  isConnected: boolean
  onStatusChange?: (status: string, currentStep: number, executionLog: string[]) => void
  manualDirection?: string | null
}

const CarController = ({ isRunning, program, carUrl, isConnected, onStatusChange, manualDirection }: CarControllerProps) => {
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [carStatus, setCarStatus] = useState<string>('idle')
  const [executionLog, setExecutionLog] = useState<string[]>([])

  useEffect(() => {
    if (isRunning && program.length > 0) {
      executeProgram()
    } else {
      if (!isRunning && carStatus === 'running') {
        emergencyStop()
      }
      setCurrentStep(-1)
      setCarStatus('idle')
    }
  }, [isRunning, program])

  const log = (msg: string) => setExecutionLog(prev => [...prev, msg])

  const emergencyStop = async () => {
    if (!isConnected) return
    await sendCarRequest(`${carUrl}/direction?dir=stop`, { retries: 2 })
    await sendCarRequest(`${carUrl}/direction?dir=stop`, { retries: 2 })
    log('🚨 EMERGENCY STOP - Car halted immediately')
  }

  const executeProgram = async () => {
    setCarStatus('running')
    setExecutionLog([])

    if (isConnected) {
      await sendCarRequest(`${carUrl}/direction?dir=stop`, { retries: 1 })
    }

    for (let i = 0; i < program.length; i++) {
      if (!isRunning) {
        log('🛑 Program stopped by user')
        break
      }
      setCurrentStep(i)
      await executeCommand(program[i])
      if (!isRunning) {
        log('🛑 Program stopped by user')
        break
      }
    }

    if (isConnected) {
      await sendCarRequest(`${carUrl}/direction?dir=stop`, { retries: 1 })
      log('🛑 Car stopped - Program complete')
    }
    setCurrentStep(-1)
    setCarStatus('completed')
    setTimeout(() => setCarStatus('idle'), 2000)
  }

  const executeCommand = async (command: any): Promise<void> => {
    log(formatCommandLog(command))
    switch (command.action) {
      case 'move_forward':
        await sendCarCommand('forward', Number(command.duration) || 0)
        break
      case 'move_backward':
        await sendCarCommand('backward', Number(command.duration) || 0)
        break
      case 'turn_left':
        await sendCarCommand('turn_left', Number(command.degrees) || 0)
        break
      case 'turn_right':
        await sendCarCommand('turn_right', Number(command.degrees) || 0)
        break
      case 'stop':
        await sendCarCommand('stop', Number(command.duration) || 0)
        break
      case 'repeat':
        const count = Math.max(0, Number(command.count) || 0)
        for (let i = 0; i < count; i++) {
          log(`🔁 Loop iteration ${i + 1}/${count}`)
          if (Array.isArray(command.commands)) {
            for (const sub of command.commands) {
              await executeCommand(sub)
            }
          }
        }
        break
      default:
        log(`❓ Unknown command: ${JSON.stringify(command)}`)
    }
  }

  const sendCarCommand = async (action: string, value: number): Promise<void> => {
    if (!isConnected) {
      log(`❌ Car not connected - cannot execute: ${action}`)
      return
    }

    const baseUrl = carUrl
    try {
      if (action !== 'stop') {
        await sendCarRequest(`${baseUrl}/direction?dir=stop`, { retries: 1 })
        await sleep(100)
      }

      switch (action) {
        case 'forward':
          await sendCarRequest(`${baseUrl}/direction?dir=avant`)
          await sleep(value * 1000)
          break
        case 'backward':
          await sendCarRequest(`${baseUrl}/direction?dir=arriere`)
          await sleep(value * 1000)
          break
        case 'turn_left': {
          await sendCarRequest(`${baseUrl}/direction?dir=gauche`)
          const duration = (value / 90) * 1000
          await sleep(duration)
          break
        }
        case 'turn_right': {
          await sendCarRequest(`${baseUrl}/direction?dir=droite`)
          const duration = (value / 90) * 1000
          await sleep(duration)
          break
        }
        case 'stop':
          await sendCarRequest(`${baseUrl}/direction?dir=stop`, { retries: 2 })
          await sleep(value * 1000)
          break
      }
    } catch (err) {
      console.error('Failed to send command to car:', err)
      log(`❌ Failed to execute: ${action}`)
      await sendCarRequest(`${baseUrl}/direction?dir=stop`, { retries: 1 })
    } finally {
      if (['forward', 'backward', 'turn_left', 'turn_right'].includes(action)) {
        await sendCarRequest(`${baseUrl}/direction?dir=stop`, { retries: 1 })
      }
    }
  }

  const formatCommandLog = (command: any): string => {
    switch (command.action) {
      case 'move_forward': return `🚗 Moving forward for ${command.duration}s`
      case 'move_backward': return `🔄 Moving backward for ${command.duration}s`
      case 'turn_left': return `↰ Turning left ${command.degrees}°`
      case 'turn_right': return `↱ Turning right ${command.degrees}°`
      case 'stop': return `⏹️ Stopping for ${command.duration}s`
      case 'repeat': return `🔁 Repeating ${command.count} times`
      default: return `❓ Unknown command: ${command.action}`
    }
  }

  useEffect(() => {
    onStatusChange?.(carStatus, currentStep, executionLog)
  }, [carStatus, currentStep, executionLog, onStatusChange])

  return (
    <motion.div 
      className="car-controller"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="controller-header">
        <h3>Car Visualization</h3>
      </div>

      <div className="car-visualization">
        <motion.div 
          className="car-icon"
          animate={{ 
            y: currentStep >= 0 ? [0, -5, 0] : 0,
            rotate: carStatus === 'running' ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            repeat: carStatus === 'running' ? Infinity : 0, 
            duration: 0.5 
          }}
        >
          <Car size={48} />
        </motion.div>
        
        <div className="direction-indicators">
          <ArrowUp className={`direction-arrow ${carStatus === 'running' || manualDirection === 'avant' ? 'active' : ''}`} />
          <ArrowLeft className={`direction-arrow ${carStatus === 'running' || manualDirection === 'gauche' ? 'active' : ''}`} />
          <ArrowRight className={`direction-arrow ${carStatus === 'running' || manualDirection === 'droite' ? 'active' : ''}`} />
          <ArrowDown className={`direction-arrow ${carStatus === 'running' || manualDirection === 'arriere' ? 'active' : ''}`} />
        </div>

        {manualDirection && (
          <motion.div 
            className="manual-control-banner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            ⚠️ MANUALLY CONTROLLING
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default CarController