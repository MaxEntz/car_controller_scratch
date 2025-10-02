import { motion } from 'framer-motion'
import { Car } from 'lucide-react'
import ConnectionManager from './ConnectionManager'

interface HeaderProps {
  onConnectionChange: (url: string, isConnected: boolean) => void
}

const Header = ({ onConnectionChange }: HeaderProps) => {
  return (
    <motion.header 
      className="header"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-content">
        <div className="logo">
          <Car size={32} className="logo-icon" />
          <h1>CarController</h1>
        </div>
        
        <ConnectionManager onConnectionChange={onConnectionChange} />
      </div>
    </motion.header>
  )
}

export default Header