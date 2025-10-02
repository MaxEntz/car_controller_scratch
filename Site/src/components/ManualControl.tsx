import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square } from 'lucide-react'

interface ManualControlProps {
  carUrl: string
  isConnected: boolean
  onDirectionChange?: (direction: string | null) => void
}

const ManualControl = ({ carUrl, isConnected, onDirectionChange }: ManualControlProps) => {
  const [activeDirection, setActiveDirection] = useState<string | null>(null)
  const [isPressed, setIsPressed] = useState<{[key: string]: boolean}>({})

  // Send command to car with stop priority
  const sendDirectionCommand = useCallback(async (direction: string) => {
    if (!isConnected) {
      console.log('Car not connected')
      return
    }

    try {
      await fetch(`${carUrl}/direction?dir=${direction}`)
      console.log(`Sent command: ${direction}`)
    } catch (error) {
      console.error('Failed to send direction command:', error)
    }
  }, [carUrl, isConnected])

  // Emergency stop function with higher priority
  const emergencyStop = useCallback(async () => {
    if (!isConnected) return
    
    try {
      // Send multiple stop commands for reliability
      await fetch(`${carUrl}/direction?dir=stop`)
      await fetch(`${carUrl}/direction?dir=stop`)
      setActiveDirection(null)
      console.log('Emergency stop sent')
    } catch (error) {
      console.error('Failed to send emergency stop:', error)
    }
  }, [carUrl, isConnected])

  // Notify parent component when direction changes
  useEffect(() => {
    if (onDirectionChange) {
      onDirectionChange(activeDirection)
    }
  }, [activeDirection, onDirectionChange])

  // Handle mouse/touch events
  const handleDirectionStart = useCallback((direction: string) => {
    setActiveDirection(direction)
    sendDirectionCommand(direction)
  }, [sendDirectionCommand])

  const handleDirectionEnd = useCallback(() => {
    setActiveDirection(null)
    sendDirectionCommand('stop')
  }, [sendDirectionCommand])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPressed[e.key]) return // Prevent rapid firing
      
      setIsPressed(prev => ({ ...prev, [e.key]: true }))
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          handleDirectionStart('avant')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          handleDirectionStart('arriere')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          handleDirectionStart('gauche')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          handleDirectionStart('droite')
          break
        case ' ':
        case 'Escape':
          e.preventDefault()
          emergencyStop()
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setIsPressed(prev => ({ ...prev, [e.key]: false }))
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          handleDirectionEnd()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleDirectionStart, handleDirectionEnd, emergencyStop, isPressed])

  // Component cleanup - stop car when component unmounts
  useEffect(() => {
    return () => {
      if (isConnected) {
        sendDirectionCommand('stop')
      }
    }
  }, [isConnected, sendDirectionCommand])

  const buttonVariants = {
    normal: { scale: 1, backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    pressed: { scale: 0.95, backgroundColor: 'rgba(59, 130, 246, 0.3)' },
    hover: { scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.2)' }
  }

  const stopButtonVariants = {
    normal: { scale: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    pressed: { scale: 0.95, backgroundColor: 'rgba(239, 68, 68, 0.4)' },
    hover: { scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }
  }

  return (
    <motion.div 
      className="manual-control"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="control-grid">
        {/* Forward */}
        <motion.button
          className="direction-btn forward"
          variants={buttonVariants}
          initial="normal"
          whileHover="hover"
          animate={activeDirection === 'avant' ? 'pressed' : 'normal'}
          onMouseDown={() => handleDirectionStart('avant')}
          onMouseUp={handleDirectionEnd}
          onMouseLeave={handleDirectionEnd}
          onTouchStart={() => handleDirectionStart('avant')}
          onTouchEnd={handleDirectionEnd}
          disabled={!isConnected}
        >
          <ArrowUp size={32} />
        </motion.button>

        {/* Left */}
        <motion.button
          className="direction-btn left"
          variants={buttonVariants}
          initial="normal"
          whileHover="hover"
          animate={activeDirection === 'gauche' ? 'pressed' : 'normal'}
          onMouseDown={() => handleDirectionStart('gauche')}
          onMouseUp={handleDirectionEnd}
          onMouseLeave={handleDirectionEnd}
          onTouchStart={() => handleDirectionStart('gauche')}
          onTouchEnd={handleDirectionEnd}
          disabled={!isConnected}
        >
          <ArrowLeft size={32} />
        </motion.button>

        {/* Stop Button - Center with priority styling */}
        <motion.button
          className="direction-btn stop"
          variants={stopButtonVariants}
          initial="normal"
          whileHover="hover"
          whileTap="pressed"
          onClick={emergencyStop}
          disabled={!isConnected}
        >
          <Square size={32} />
        </motion.button>

        {/* Right */}
        <motion.button
          className="direction-btn right"
          variants={buttonVariants}
          initial="normal"
          whileHover="hover"
          animate={activeDirection === 'droite' ? 'pressed' : 'normal'}
          onMouseDown={() => handleDirectionStart('droite')}
          onMouseUp={handleDirectionEnd}
          onMouseLeave={handleDirectionEnd}
          onTouchStart={() => handleDirectionStart('droite')}
          onTouchEnd={handleDirectionEnd}
          disabled={!isConnected}
        >
          <ArrowRight size={32} />
        </motion.button>

        {/* Backward */}
        <motion.button
          className="direction-btn backward"
          variants={buttonVariants}
          initial="normal"
          whileHover="hover"
          animate={activeDirection === 'arriere' ? 'pressed' : 'normal'}
          onMouseDown={() => handleDirectionStart('arriere')}
          onMouseUp={handleDirectionEnd}
          onMouseLeave={handleDirectionEnd}
          onTouchStart={() => handleDirectionStart('arriere')}
          onTouchEnd={handleDirectionEnd}
          disabled={!isConnected}
        >
          <ArrowDown size={32} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ManualControl
