import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { motion } from 'framer-motion'

interface BlocklyEditorProps {
  onProgramChange: (program: any[]) => void
  resetTrigger?: number
}

const BlocklyEditor = ({ onProgramChange, resetTrigger }: BlocklyEditorProps) => {
  const blocklyDiv = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  useEffect(() => {
    if (!blocklyDiv.current) return

    const carBlocks = {
      "car_start": {
        "message0": "Start",
        "nextStatement": null,
        "colour": "#FFD600",
        "tooltip": "Point de départ du programme. Seuls les blocs chaînés à partir de Start seront exécutés.",
        "helpUrl": "",
        "hat": "cap"
      },
      "car_move_forward": {
        "message0": "Move forward for %1 seconds",
        "args0": [
          {
            "type": "field_number",
            "name": "DURATION",
            "value": 1,
            "min": 0.1,
            "max": 10,
            "precision": 0.1
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4CAF50",
        "tooltip": "Move the car forward for specified duration",
        "helpUrl": ""
      },
      "car_move_backward": {
        "message0": "Move backward for %1 seconds",
        "args0": [
          {
            "type": "field_number",
            "name": "DURATION",
            "value": 1,
            "min": 0.1,
            "max": 10,
            "precision": 0.1
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#FF5722",
        "tooltip": "Move the car backward for specified duration",
        "helpUrl": ""
      },
      "car_turn_left": {
        "message0": "Turn left %1 degrees",
        "args0": [
          {
            "type": "field_number",
            "name": "DEGREES",
            "value": 90,
            "min": 1,
            "max": 360,
            "precision": 1
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#2196F3",
        "tooltip": "Turn the car left by specified degrees",
        "helpUrl": ""
      },
      "car_turn_right": {
        "message0": "Turn right %1 degrees",
        "args0": [
          {
            "type": "field_number",
            "name": "DEGREES",
            "value": 90,
            "min": 1,
            "max": 360,
            "precision": 1
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#FF9800",
        "tooltip": "Turn the car right by specified degrees",
        "helpUrl": ""
      },
      "car_stop": {
        "message0": "Stop for %1 seconds",
        "args0": [
          {
            "type": "field_number",
            "name": "DURATION",
            "value": 1,
            "min": 0.1,
            "max": 10,
            "precision": 0.1
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#9E9E9E",
        "tooltip": "Stop the car for specified duration",
        "helpUrl": ""
      }
    }

    Object.entries(carBlocks).forEach(([blockType, blockDefinition]) => {
      Blockly.Blocks[blockType] = {
        init: function() {
          this.jsonInit(blockDefinition)
        }
      }
    })

    const toolbox = {
      "kind": "categoryToolbox",
      "contents": [
        {
          "kind": "category",
          "name": "Program",
          "colour": "#FFD600",
          "contents": [
            { "kind": "block", "type": "car_start" }
          ]
        },
        {
          "kind": "category",
          "name": "Movement",
          "colour": "#4CAF50",
          "contents": [
            {
              "kind": "block",
              "type": "car_move_forward"
            },
            {
              "kind": "block",
              "type": "car_move_backward"
            },
            {
              "kind": "block",
              "type": "car_stop"
            }
          ]
        },
        {
          "kind": "category",
          "name": "Turning",
          "colour": "#2196F3",
          "contents": [
            {
              "kind": "block",
              "type": "car_turn_left"
            },
            {
              "kind": "block",
              "type": "car_turn_right"
            }
          ]
        },
        {
          "kind": "category",
          "name": "Logic",
          "colour": "#9C27B0",
          "contents": [
            {
              "kind": "block",
              "type": "controls_repeat_ext",
              "inputs": {
                "TIMES": {
                  "shadow": {
                    "type": "math_number",
                    "fields": { "NUM": 5 }
                  }
                }
              }
            }
          ]
        }
      ]
    }

    const ws = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      theme: 'dark',
      grid: {
        spacing: 20,
        length: 3,
        colour: '#3a3a3a',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      trashcan: true,
      scrollbars: true,
      sounds: false,
      oneBasedIndex: false
    })

    workspaceRef.current = ws

    ws.addChangeListener(() => {
      const code = generateCode(ws)
      onProgramChange(code)
    })

    return () => {
      ws.dispose()
    }
  }, [onProgramChange])

  useEffect(() => {
    if (resetTrigger && workspaceRef.current) {
      workspaceRef.current.clear()
      onProgramChange([])
    }
  }, [resetTrigger, onProgramChange])

  const generateCode = (workspace: Blockly.WorkspaceSvg) => {
    const topBlocks = workspace.getTopBlocks(true)
    const startBlocks = topBlocks.filter(b => b.type === 'car_start')
    const commands: any[] = []

    if (startBlocks.length === 0) {
      return []
    }

    startBlocks.forEach(start => {
      const first = start.getNextBlock()
      if (first) {
        parseBlock(first, commands)
      }
    })

    return commands
  }

  const parseBlock = (block: Blockly.Block, commands: any[]) => {
    if (!block) return

    const blockType = block.type
    
    switch (blockType) {
      case 'car_move_forward':
        commands.push({
          action: 'move_forward',
          duration: block.getFieldValue('DURATION')
        })
        break
      case 'car_move_backward':
        commands.push({
          action: 'move_backward',
          duration: block.getFieldValue('DURATION')
        })
        break
      case 'car_turn_left':
        commands.push({
          action: 'turn_left',
          degrees: block.getFieldValue('DEGREES')
        })
        break
      case 'car_turn_right':
        commands.push({
          action: 'turn_right',
          degrees: block.getFieldValue('DEGREES')
        })
        break
      case 'car_stop':
        commands.push({
          action: 'stop',
          duration: block.getFieldValue('DURATION')
        })
        break
      case 'car_start':
        break
      case 'controls_repeat_ext':
        let repeatCount = 1
        const timesValueBlock = (block as any).getInputTargetBlock && (block as any).getInputTargetBlock('TIMES')
        if (timesValueBlock) {
          const num = timesValueBlock.getFieldValue('NUM')
          if (num !== null && num !== undefined && !isNaN(Number(num))) {
            repeatCount = Number(num)
          }
        }
        const repeatCommands: any[] = []
        const doBlock = block.getInputTargetBlock('DO')
        if (doBlock) {
          parseBlock(doBlock, repeatCommands)
        }
        commands.push({
          action: 'repeat',
          count: repeatCount,
          commands: repeatCommands
        })
        break
    }

    const nextBlock = block.getNextBlock()
    if (nextBlock) {
      parseBlock(nextBlock, commands)
    }
  }

  return (
    <motion.div 
      className="blockly-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        ref={blocklyDiv}
        className="blockly-workspace"
        style={{ 
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      />
    </motion.div>
  )
}

export default BlocklyEditor