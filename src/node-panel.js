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

import React from 'react'
import { Menu, MenuItem } from './menu'
import Panel from './panel'
import NodeView from './node-view'
import nodeTypes from './node-types'
import util from './util'

export default class NodePanel extends Panel {
  constructor (props) {
    super(props)

    this.state = {
      nodes: this.props.data,
      position: [0, 0, 1]
    }
  }

  renderContent () {
    const position = this.state.position
    const viewTransform = `translate(${position[0]}px, ${position[1]}px)` +
      ` scale(${position[2]})`

    let nodes = []
    for (let id in this.state.nodes) {
      let node = this.state.nodes[id]
      nodes.push(<NodeView
        x={node.x}
        y={node.y}
        width={node.width}
        type={node.type}
        name={node.name}
        id={node.id}
        key={node.id}
        properties={node.properties}
        saveState={state => {
          const nodes = { ...this.state.nodes }
          if (state.deleted) delete nodes[state.id]
          else {
            delete state.deleted
            nodes[state.id] = state
          }
          this.setState({ nodes: nodes })
        }}
        />)
    }

    return (
      <div className="scroll-container" onWheel={this.onWheel}>
        <div className="view-transform-origin"
          style={{transform: viewTransform}}>{nodes}</div>
      </div>
    )
  }

  onWheel = e => {
    e.stopPropagation()
    e.preventDefault()
    let position = [...this.state.position]
    if (e.ctrlKey) {
      let scaleFactor = 1 - (e.deltaY / 100)
      if (position[2] < 0) position[2] = .3
      if (position[2] >= 3 && scaleFactor > 1) scaleFactor = 1
      if (position[2] <= .3 && scaleFactor < 1) scaleFactor = 1
      position[2] *= scaleFactor
      position[0] *= scaleFactor
      position[1] *= scaleFactor
    } else {
      position[0] -= e.deltaX
      position[1] -= e.deltaY
    }
    this.setState({
      position: position
    })
  }

  addNode (template) {
    const nodes = { ...this.state.nodes }
    let id
    do {
      id = Math.random().toString(36)
    } while (id in nodes)
    let node = util.deepClone(template)
    nodes[id] = node
    Object.assign(node, {
      id: id,
      x: -this.state.position[0],
      y: -this.state.position[1],
      width: 150
    })
    this.setState({ nodes: nodes })
  }

  renderMenu () {
    let addNode = type => this.addNode(nodeTypes[type])
    return (
      <Menu horizontal className="submenu-above">
        <MenuItem>
          View
          <Menu>
            <MenuItem onClick={() => {
              this.setState({ position: [0, 0, 1] })
            }}>Reset</MenuItem>
          </Menu>
        </MenuItem>
        <MenuItem>
          Add
          <Menu>
            <MenuItem onClick={() => addNode('math')}>Math</MenuItem>
            <MenuItem onClick={() => addNode('oscillator')}>Oscillator</MenuItem>
            <MenuItem onClick={() => addNode('output')}>Output</MenuItem>
            <MenuItem onClick={() => addNode('currentTime')}>Current Time</MenuItem>
            <MenuItem onClick={() => addNode('value')}>Value</MenuItem>
          </Menu>
        </MenuItem>
      </Menu>
    )
  }
}
