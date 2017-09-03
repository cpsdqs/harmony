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
      nodes: this.props.nodes,
      links: this.props.links,
      position: [0, 0, 1],
      portPositions: {},
      draggingPort: false
    }
  }

  updateNode (node) {
    this.setState({
      nodes: util.mutate(this.state.nodes, nodes => {
        nodes[node.id] = node
      })
    })
  }

  deleteNode (id) {
    let node = this.state.nodes[id]
    if (!node) return

    this.setState({
      nodes: util.mutate(this.state.nodes, nodes => delete nodes[id]),
      links: util.mutate(this.state.links, links => {
        for (let property of node.properties) {
          for (let link of property.links) if (links[link]) delete links[link]
        }
      })
    })
  }

  renderLink (link, id) {
    let startX = 0, startY = 0, startDX = 0, startDY = 0
    let endX = 0, endY = 0, endDX = 0, endDY = 0

    let startNode = this.state.portPositions[link.startNode]
    let startPosition = startNode[link.startProperty]
    startX = startPosition.x + this.state.nodes[link.startNode].x
    startY = startPosition.y + this.state.nodes[link.startNode].y

    if (link.endPosition) {
      endX = link.endPosition.x
      endY = link.endPosition.y
      endDX = -startPosition.facingX
      endDY = -startPosition.facingY
    } else {
      let endNode = this.state.portPositions[link.endNode]
    }

    let bezierOffset = Math.sqrt(Math.abs(endX - startX)) * 10

    startDX = startPosition.facingX * bezierOffset
    startDY = startPosition.facingY * bezierOffset
    endDX *= bezierOffset
    endDY *= bezierOffset

    let x1 = startX, y1 = startY
    let x2 = startX + startDX, y2 = startY + startDY
    let x3 = endX + endDX, y3 = endY + endDY
    let x4 = endX, y4 = endY
    let d = `M${x1},${y1} C${x2},${y2} ${x3},${y3} ${x4},${y4}`
    return <path className="property-link" d={d} key={link.id} />
  }

  renderNode (node) {
    return (
      <NodeView
        x={node.x}
        y={node.y}
        width={node.width}
        type={node.type}
        name={node.name}
        id={node.id}
        key={node.id}
        properties={node.properties}
        saveState={state => {
          if (state.deleted) this.deleteNode(state.id)
          else this.updateNode(state)
        }}
        updatePortPositions={positions => {
          this.setState({
            portPositions: util.mutate(this.state.portPositions,
              portPositions => portPositions[node.id] = positions)
          })
        }}
        onPortDrag={propertyKey => {
          // TODO: refactor
          const links = { ...this.state.links }
          let id
          do {
            id = Math.random().toString(36)
          } while (id in links)

          let endPosition = this.state.portPositions[node.id][propertyKey]
          links[id] = {
            id,
            startNode: node.id,
            startProperty: propertyKey,
            endPosition: {
              x: endPosition.x + node.x,
              y: endPosition.y + node.y
            }
          }
          this.setState({
            links,
            draggingPort: id
          })
          return id
        }}
        />
    )
  }

  renderContent () {
    const position = this.state.position
    const viewTransform = `translate(${position[0]}px, ${position[1]}px)` +
      ` scale(${position[2]})`

    let nodes = []
    for (let id in this.state.nodes) {
      nodes.push(this.renderNode(this.state.nodes[id]))
    }

    let links = []
    for (let id in this.state.links) {
      links.push(this.renderLink(this.state.links[id]))
    }

    return (
      <div className="scroll-container"
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onWheel={this.onWheel}>
        <div className="view-transform-origin"
          style={{transform: viewTransform}}>
          <svg className="node-links-container">{links}</svg>
          {nodes}
        </div>
      </div>
    )
  }

  onMouseMove = e => {
    if (this.state.draggingPort) {
      const links = { ...this.state.links }
      let link = { ...links[this.state.draggingPort] }
      link.endPosition.x = e.pageX - this.state.position[0]
      link.endPosition.y = e.pageY - this.state.position[1]
      link[this.state.draggingPort] = link
      this.setState({ links })
    }
  }

  onMouseUp = e => {
    if (this.state.draggingPort) {
      // TODO
      this.setState({
        draggingPort: false
      })
    }
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
      id,
      // TODO: project mouse position and use that instead
      x: -this.state.position[0],
      y: -this.state.position[1],
      width: 150
    })
    for (let property of node.properties) property.links = []
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
            <MenuItem>
              Output
              <Menu>
                <MenuItem onClick={() => addNode('output')}>Output</MenuItem>
                <MenuItem onClick={() => addNode('outputBuffer')}>Recorder</MenuItem>
              </Menu>
            </MenuItem>
            <MenuItem>
              Input
              <Menu>
                <MenuItem onClick={() => addNode('currentTime')}>Current Time</MenuItem>
                <MenuItem onClick={() => addNode('value')}>Value</MenuItem>
                <MenuItem onClick={() => addNode('userMediaStreamSource')}>Device Input Stream</MenuItem>
              </Menu>
            </MenuItem>
            <MenuItem>
              Generate
              <Menu>
                <MenuItem onClick={() => addNode('oscillator')}>Oscillator</MenuItem>
              </Menu>
            </MenuItem>
            <MenuItem>
              Convert
              <Menu>
                <MenuItem onClick={() => addNode('math')}>Math</MenuItem>
                <MenuItem onClick={() => addNode('delay')}>Delay</MenuItem>
                <MenuItem onClick={() => addNode('channelMerger')}>Channel Merger</MenuItem>
                <MenuItem onClick={() => addNode('channelSplitter')}>Channel Splitter</MenuItem>
                <MenuItem onClick={() => addNode('gain')}>Gain</MenuItem>
              </Menu>
            </MenuItem>
          </Menu>
        </MenuItem>
      </Menu>
    )
  }
}
