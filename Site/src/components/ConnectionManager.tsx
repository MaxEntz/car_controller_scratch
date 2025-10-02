import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Wifi, WifiOff, Check, X, RefreshCw } from 'lucide-react'

interface ConnectionManagerProps {
  onConnectionChange: (url: string, isConnected: boolean) => void
}

const ConnectionManager = ({ onConnectionChange }: ConnectionManagerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [carUrl, setCarUrl] = useState('http://matteolecar.local')
  const [customIp, setCustomIp] = useState('')
  const [useCustomIp, setUseCustomIp] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [connectionError, setConnectionError] = useState<string>('')

  useEffect(() => {
    checkConnection()
  }, [carUrl])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isChecking) {
        checkConnection()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [carUrl, isChecking])

  const checkConnection = async () => {
    setIsChecking(true)
    setConnectionError('')
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      await fetch(carUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors'
      })
      
      clearTimeout(timeoutId)
      setIsConnected(true)
      setLastChecked(new Date())
      onConnectionChange(carUrl, true)
      
    } catch (error) {
      console.error('Connection check failed:', error)
      setIsConnected(false)
      setLastChecked(new Date())
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setConnectionError('Connection timeout - car not responding')
        } else if (error.message.includes('NetworkError')) {
          setConnectionError('Network error - check Wi-Fi connection')
        } else {
          setConnectionError('Cannot reach car - check IP address')
        }
      } else {
        setConnectionError('Connection failed')
      }
      
      onConnectionChange(carUrl, false)
    } finally {
      setIsChecking(false)
    }
  }

  const handleUrlChange = () => {
    const newUrl = useCustomIp && customIp 
      ? `http://${customIp}${customIp.includes(':') ? '' : ':80'}`
      : 'http://matteolecar.local'
    
    setCarUrl(newUrl)
  }

  const handleCustomIpToggle = (checked: boolean) => {
    setUseCustomIp(checked)
    if (!checked) {
      setCarUrl('http://matteolecar.local')
    }
  }

  const handleCustomIpChange = (ip: string) => {
    setCustomIp(ip)
    if (useCustomIp && ip) {
      const newUrl = `http://${ip}${ip.includes(':') ? '' : ':80'}`
      setCarUrl(newUrl)
    }
  }

  const formatLastChecked = () => {
    if (!lastChecked) return 'Never'
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastChecked.getTime()) / 1000)
    
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <>
      <motion.button
        className="connection-trigger"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="connection-status">
          {isConnected ? (
            <Wifi size={16} className="status-icon connected" />
          ) : (
            <WifiOff size={16} className="status-icon disconnected" />
          )}
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <Settings size={14} className="settings-icon" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="connection-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="connection-modal"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="modal-header">
                <h3>Car Connection Settings</h3>
                <button
                  className="close-button"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-content">
                <div className="connection-info">
                  <div className="current-status">
                    <div className="status-row">
                      <span>Status:</span>
                      <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? (
                          <>
                            <Check size={14} />
                            Connected
                          </>
                        ) : (
                          <>
                            <X size={14} />
                            Disconnected
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="status-row">
                      <span>URL:</span>
                      <code className="url-display">{carUrl}</code>
                    </div>
                    
                    <div className="status-row">
                      <span>Last checked:</span>
                      <span className="last-checked">{formatLastChecked()}</span>
                    </div>
                    
                    {connectionError && (
                      <div className="error-message">
                        {connectionError}
                      </div>
                    )}
                  </div>

                  <motion.button
                    className="check-button"
                    onClick={checkConnection}
                    disabled={isChecking}
                    whileHover={{ scale: isChecking ? 1 : 1.02 }}
                    whileTap={{ scale: isChecking ? 1 : 0.98 }}
                  >
                    <RefreshCw size={16} className={isChecking ? 'spinning' : ''} />
                    {isChecking ? 'Checking...' : 'Check Connection'}
                  </motion.button>
                </div>

                <div className="connection-config">
                  <h4>Connection Configuration</h4>
                  
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="connection-type"
                        checked={!useCustomIp}
                        onChange={() => handleCustomIpToggle(false)}
                      />
                      <div className="radio-content">
                        <span className="radio-title">mDNS (Default)</span>
                        <span className="radio-description">matteolecar.local</span>
                      </div>
                    </label>

                    <label className="radio-option">
                      <input
                        type="radio"
                        name="connection-type"
                        checked={useCustomIp}
                        onChange={() => handleCustomIpToggle(true)}
                      />
                      <div className="radio-content">
                        <span className="radio-title">Custom IP Address</span>
                        <span className="radio-description">Use specific IP address</span>
                      </div>
                    </label>
                  </div>

                  {useCustomIp && (
                    <motion.div
                      className="custom-ip-input"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label htmlFor="custom-ip">IP Address:</label>
                      <input
                        id="custom-ip"
                        type="text"
                        value={customIp}
                        onChange={(e) => handleCustomIpChange(e.target.value)}
                        placeholder="192.168.1.100 or 192.168.1.100:80"
                        className="ip-input"
                      />
                      <small className="input-hint">
                        Enter IP address with optional port (default: 80)
                      </small>
                    </motion.div>
                  )}
                </div>

                <div className="modal-actions">
                  <motion.button
                    className="btn btn-primary"
                    onClick={() => {
                      handleUrlChange()
                      setIsOpen(false)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply Settings
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default ConnectionManager