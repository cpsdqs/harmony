/*
 * Copyright (C) 2017 cpsdqs
 *
 * This file is part of Harmony.
 *
 * Harmony is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Harmony is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Harmony. If not, see <http://www.gnu.org/licenses/>.
 */

export default {
  math: {
    name: 'Math',
    type: 'math',
    properties: [
      {
        type: 'value',
        position: 'output',
        name: 'Result',
        key: 'result',
        getComputedValue (property, node) {
          let updateProperty = function updateMathResult () {
            let type = node.properties.operation.getComputedValue()
            let a = node.properties.valuea.getComputedValue()
            let b = node.properties.valueb.getComputedValue()
            let value = 0
            if (type === 'add') value = a + b
            else if (type === 'subtract') value = a - b
            else if (type === 'multiply') value = a * b
            else if (type === 'divide') value = a / b
            else if (type === 'sine') value = Math.sin(a)
            else if (type === 'cosine') value = Math.cos(a)
            else if (type === 'tangent') value = Math.tan(a)
            else if (type === 'arcsine') value = Math.asin(a)
            else if (type === 'arccosine') value = Math.acos(a)
            else if (type === 'arctangent') value = Math.atan(a)
            else if (type === 'arctangent2') value = Math.atan2(a, b)
            else if (type === 'root') value = a ** (1 / b)
            else if (type === 'power') value = a ** b
            else if (type === 'logarithm') value = Math.log(a) / Math.log(b)
            else if (type === 'minimum') value = Math.min(a, b)
            else if (type === 'maximum') value = Math.max(a, b)
            else if (type === 'round') value = Math.round(a)
            else if (type === 'lessThan') value = a < b
            else if (type === 'greaterThan') value = a > b
            else if (type === 'modulo') value = ((a % b) + b) % b
            else if (type === 'absolute') value = Math.abs(a)
            property.setComputedValue(value)
          }
          node.properties.valuea.on('change', updateProperty)
          node.properties.valueb.on('change', updateProperty)
        }
      }, {
        type: 'select',
        position: 'input',
        name: 'Operation',
        key: 'operation',
        options: {
          add: 'Add',
          subtract: 'Subtract',
          multiply: 'Multiply',
          divide: 'Divide',
          sine: 'Sine',
          cosine: 'Cosine',
          tangent: 'Tangent',
          arcsine: 'Arcsine',
          arccosine: 'Arccosine',
          arctangent: 'Arctangent',
          arctangent2: 'Atan2',
          root: 'Root',
          power: 'Power',
          logarithm: 'Logarithm',
          minimum: 'Minimum',
          maximum: 'Maximum',
          round: 'Round',
          lessThan: 'Less Than',
          greaterThan: 'Greater Than',
          modulo: 'Modulo',
          absolute: 'Absolute'
        },
        value: 'add'
      }, {
        type: 'value',
        position: 'input',
        name (property, node) {
          let type = node.properties.operation.getComputedValue()
          if (type === 'add') return 'Augend'
          if (type === 'subtract') return 'Minuend'
          if (type === 'multiply') return 'Multiplicand'
          if (type === 'divide') return 'Dividend'
          if (type === 'arctangent2') return 'Y'
          if (type.startsWith('arc')) return 'Angle'
          if (type === 'root') return 'Radicand'
          if (type === 'power') return 'Base'
          return 'Value'
        },
        key: 'valuea',
        value: 0
      }, {
        type: 'value',
        position: 'input',
        name (property, node) {
          let type = node.properties.operation.getComputedValue()
          if (type === 'add') return 'Addend'
          if (type === 'subtract') return 'Subtrahend'
          if (type === 'multiply') return 'Multiplier'
          if (type === 'divide') return 'Divisor'
          if (type === 'arctangent2') return 'X'
          if (type === 'root') return 'Degree'
          if (type === 'power') return 'Exponent'
          if (type === 'logarithm') return 'Base'
          if (type === 'modulo') return 'Mod'
          return 'Value'
        },
        key: 'valueb',
        isVisible (property, node) {
          let type = node.properties.operation.getComputedValue()
          let invisibleTypes = [
            'sine', 'cosine', 'tangent', 'arcsine', 'arccosine', 'arctangent',
            'round', 'absolute'
          ]
          if (invisibleTypes.includes(type)) return false
          return true
        },
        value: 0
      }
    ]
  },
  channelMerger: {
    name: 'Channel Merger',
    type: 'channelMerger',
    properties: do {
      let channels = []
      for (let i = 0; i < 12; i++) {
        channels.push({
          type: 'audio',
          position: 'input',
          name: `Channel ${i + 1}`,
          key: `channel${i}`,
          value: null,
          isVisible (property, computed) {
            let channelCount = computed.properties.channels.getComputedValue()
            let propertyIndex = +property.key.replace(/\D/g, '')
            if (propertyIndex <= channelCount) return true
            return false
          }
        })
      }
      ([
        {
          type: 'audio',
          position: 'output',
          name: 'Output',
          key: 'output',
          value: null
        },
        {
          type: 'select',
          position: 'input',
          name: 'Channels',
          key: 'channels',
          options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          value: 5
        }
      ].concat(channels))
    }
  },
  channelSplitter: {
    name: 'Channel Splitter',
    type: 'channelSplitter',
    properties: do {
      let channels = []
      for (let i = 0; i < 12; i++) {
        channels.push({
          type: 'audio',
          position: 'output',
          name: `Channel ${i + 1}`,
          key: `channel${i}`,
          value: null,
          isVisible (property, computed) {
            let channelCount = computed.properties.channels.getComputedValue()
            let propertyIndex = +property.key.replace(/\D/g, '')
            if (propertyIndex <= channelCount) return true
            return false
          }
        })
      }
      ([
        {
          type: 'select',
          position: 'input',
          name: 'Channels',
          key: 'channels',
          options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          value: 5
        }
      ].concat(channels).concat([
        {
          type: 'audio',
          position: 'input',
          name: 'Input',
          key: 'input',
          value: null
        }
      ]))
    }
  },
  gain: {
    name: 'Gain',
    type: 'gain',
    properties: [
      {
        type: 'audio',
        position: 'output',
        name: 'Output',
        key: 'output',
        value: null
      }, {
        type: 'audio',
        position: 'input',
        name: 'Input',
        key: 'Input',
        value: null
      },{
        type: 'value',
        position: 'input',
        name: 'Gain',
        key: 'gain',
        min: 0,
        value: 1,
        max: 100,
        step: 0.1
      }
    ]
  },
  oscillator: {
    name: 'Oscillator',
    type: 'oscillator',
    properties: [
      {
        type: 'audio',
        position: 'output',
        name: 'Audio',
        key: 'audio',
        value: null
      }, {
        type: 'value',
        position: 'input',
        name: 'Frequency',
        key: 'frequency',
        min: 10,
        value: 440,
        max: 22000,
        step: 10
      }, {
        type: 'value',
        position: 'input',
        name: 'Gain',
        key: 'gain',
        min: 0,
        value: 1,
        max: 2,
        step: 0.1
      }
    ]
  },
  delay: {
    name: 'Delay',
    type: 'delay',
    properties: [
      {
        type: 'media',
        position: 'output',
        name: 'Output',
        key: 'output',
        value: null
      }, {
        type: 'media',
        position: 'input',
        name: 'Input',
        key: 'input',
        value: null
      }, {
        type: 'value',
        position: 'input',
        name: 'Delay',
        key: 'delay',
        value: 0
      }
    ]
  },
  userMediaStreamSource: {
    name: 'Device Input Stream',
    type: 'userMediaStreamSource',
    properties: [
      {
        type: 'video',
        position: 'output',
        name: 'Video',
        key: 'video',
        value: null
      }, {
        type: 'audio',
        position: 'output',
        name: 'Audio',
        key: 'audio',
        value: null
      }
    ]
  },
  output: {
    name: 'Output',
    type: 'output',
    properties: [
      {
        type: 'audio',
        position: 'input',
        name: 'Audio',
        key: 'audio',
        value: null
      }
    ]
  },
  outputBuffer: {
    name: 'Recorder',
    type: 'outputBuffer',
    properties: [
      {
        type: 'audio',
        position: 'input',
        name: 'Audio',
        key: 'audio',
        value: null
      }
    ]
  },
  currentTime: {
    name: 'Current Time',
    type: 'currentTime',
    properties: [
      {
        type: 'value',
        position: 'output',
        name: 'Output',
        key: 'output',
        value (property, node) {
          // TODO
          return 0
        }
      }
    ]
  },
  value: {
    name: 'Value',
    type: 'value',
    properties: [
      {
        type: 'value',
        position: 'output',
        name: 'Output',
        key: 'output',
        value (property, node) {
          return node.properties.value.getComputedValue()
        }
      }, {
        type: 'value',
        position: 'input',
        name: 'Value',
        key: 'value',
        value: 0
      }
    ]
  }
}
