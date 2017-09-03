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
        value (property, node) {
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
        value: {
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
          power: 'Power',
          logarithm: 'Logarithm',
          minimum: 'Minimum',
          maximum: 'Maximum',
          round: 'Round',
          lessThan: 'Less Than',
          greaterThan: 'Greater Than',
          modulo: 'Modulo',
          absolute: 'Absolute'
        }
      }, {
        type: 'value',
        position: 'input',
        name: 'Value',
        key: 'valuea',
        value: 0
      }, {
        type: 'value',
        position: 'input',
        name: 'Value',
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
        max: 22000
      }, {
        type: 'value',
        position: 'input',
        name: 'Gain',
        key: 'gain',
        min: 0,
        value: 1,
        max: 2
      }
    ]
  }
}
