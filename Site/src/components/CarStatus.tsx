import { motion, AnimatePresence } from 'framer-motion'
import { Car, Loader, Square } from 'lucide-react'

interface CarStatusProps {
  carStatus: string
  currentStep: number
  program: any[]
  executionLog: string[]
  formatCommandLog: (command: any) => string
}

const CarStatus = ({ carStatus, currentStep, program, executionLog, formatCommandLog }: CarStatusProps) => {
  const buildDisplayProgram = (commands: any[], depth = 0, acc: { command: any, depth: number, parentIndex?: number }[] = [], parentIndex?: number) => {
    commands.forEach((cmd) => {
      const entryIndex = acc.length
      acc.push({ command: cmd, depth, parentIndex })
      if (cmd.action === 'repeat' && Array.isArray(cmd.commands)) {
        buildDisplayProgram(cmd.commands, depth + 1, acc, entryIndex)
      }
    })
    return acc
  }

  const displayProgram = buildDisplayProgram(program)

  const getStatusIcon = () => {
    switch (carStatus) {
      case 'running':
        return <Loader className="animate-spin" size={20} />
      case 'completed':
        return <Car size={20} />
      default:
        return <Square size={20} />
    }
  }

  const getStatusColor = () => {
    switch (carStatus) {
      case 'running':
        return '#4CAF50'
      case 'completed':
        return '#2196F3'
      default:
        return '#9E9E9E'
    }
  }

  return (
    <motion.div 
      className="car-status"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="status-header">
        <h3>Car Status</h3>
        <motion.div 
          className="status-badge"
          style={{ backgroundColor: getStatusColor() }}
          animate={{ scale: carStatus === 'running' ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: carStatus === 'running' ? Infinity : 0, duration: 1 }}
        >
          {getStatusIcon()}
          <span>{carStatus}</span>
        </motion.div>
      </div>

      <div className="status-content">
        <div className="program-preview">
          <h4>Program ({displayProgram.length} commands)</h4>
          <div className="command-list">
            <AnimatePresence>
              {displayProgram.map((entry, flatIndex) => {
                const topLevelIndex = program.indexOf(entry.command)
                const isTopLevel = entry.depth === 0
                const active = isTopLevel && topLevelIndex === currentStep
                const completed = isTopLevel && topLevelIndex < currentStep

                return (
                  <motion.div
                    key={flatIndex}
                    className={`command-item ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: flatIndex * 0.03 }}
                    style={{ paddingLeft: entry.depth * 16 }}
                  >
                    <span className="command-index">{flatIndex + 1}</span>
                    <span className="command-text">
                      {entry.depth > 0 && '↳ '}
                      {formatCommandLog(entry.command)}
                    </span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="execution-log">
          <h4>Execution Log</h4>
          <div className="log-container">
            {executionLog.map((log, index) => (
              <motion.div
                key={index}
                className="log-entry"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {log}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CarStatus