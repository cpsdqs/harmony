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
      width: 0,
      height: 0,
      nodes: this.props.nodes,
      links: this.props.links,
      position: [0, 0, 1],
      portPositions: {},
      draggingLink: null,
      selection: [],
      grabbedSelected: true
    }

    this.panelProperties = {
      tabIndex: 0,
      onKeyDown: this.onKeyDown
    }

    this.lastMousePosition = { x: 0, y: 0 }

    const self = this

    // because React does not immediately update this.state and because there
    // may be multiple writes per frame, this stateBuffer will act as a proxy.
    this._stateBuffer = Object.assign({}, this.state)
    this.stateBuffer = new Proxy(this._stateBuffer, {
      set (target, key, value, receiver) {
        target[key] = value
        self.scheduleStateUpdateFromBuffer()
        return true
      }
    })
  }

  scheduleStateUpdateFromBuffer () {
    clearImmediate(this._bufferStateUpdateTimeout)
    this._bufferStateUpdateTimeout = setImmediate(() => {
      let deltas = {}
      for (let i in this.stateBuffer) {
        if (this.state[i] !== this.stateBuffer[i]) {
          deltas[i] = this.stateBuffer[i]
        }
      }
      this.setState(deltas)
    })
  }

  updateSize () {
    let rect = this.refs.scrollContainer.getBoundingClientRect()
    if (rect.width !== this.state.width || rect.height !== this.state.height) {
      this.stateBuffer.width = rect.width,
      this.stateBuffer.height = rect.height
    }
  }

  componentDidMount () {
    this.updateSize()
  }
  componentDidUpdate () {
    requestAnimationFrame(() => {
      this.updateSize()
    })
  }

  updateNode (node) {
    this.stateBuffer.nodes = util.mutate(this.stateBuffer.nodes, nodes => {
      nodes[node.id] = node
    })
  }

  deleteLink (id) {
    let link = this.state.links[id]
    if (!link) return

    this.stateBuffer.selection = util.mutate(this.stateBuffer.selection,
      selection => {
      let selectionID = 'l' + id
      if (selection.includes(selectionID)) {
        selection.splice(selection.indexOf(selectionID), 1)
      }
    })
    this.stateBuffer.nodes = util.mutate(this.stateBuffer.nodes, nodes => {
      let properties = []

      let outNode = this.state.nodes[link.outNode]
      let inNode = this.state.nodes[link.inNode]
      if (outNode) properties.push(...outNode.properties)
      if (inNode) properties.push(...inNode.properties)

      for (let property of properties) {
        if (property.links.includes(link.id)) {
          property.links.splice(property.links.indexOf(link.id), 1)
        }
      }
    })
    this.stateBuffer.links = util.mutate(this.stateBuffer.links, links => {
      delete links[id]
    })
  }

  deleteNode (id) {
    let node = this.state.nodes[id]
    if (!node) return

    this.stateBuffer.selection = util.mutate(this.state.selection,
      selection => {
      let selectionID = 'n' + id
      if (selection.includes(selectionID)) {
        selection.splice(selection.indexOf(selectionID), 1)
      }
    })
    this.stateBuffer.nodes = util.mutate(this.stateBuffer.nodes, nodes => {
      delete nodes[id]
    })

    for (let property of node.properties) {
      for (let link of property.links) {
        if (this.stateBuffer.links[link]) this.deleteLink(link)
      }
    }
  }

  getBezierPath (start, end) {
    let bezierAmount = Math.sqrt(Math.abs(end.x - start.x)) * 10
    let d = `M${start.x},${start.y}`
    d += ' C' + (start.x + start.fx * bezierAmount) + ','
    d += start.y + start.fy * bezierAmount
    d += ' ' + (end.x + end.fx * bezierAmount) + ','
    d += end.y + end.fy * bezierAmount
    d += ` ${end.x},${end.y}`
    return d
  }

  renderLink (link, dragging = false) {
    let start = { x: 0, y: 0, fx: 0, fy: 0 }
    let end = { x: 0, y: 0, fx: 0, fy: 0 }

    let startNode, startPosition
    if (dragging) {
      startNode = this.state.nodes[link.startNode]
      let startPorts = this.state.portPositions[link.startNode]
      startPosition = startPorts[link.startProperty]
    } else {
      startNode = this.state.nodes[link.outNode]
      let startPorts = this.state.portPositions[link.outNode]
      startPosition = startPorts[link.outProperty]
    }

    if (!startNode || !startPosition) {
      console.warn('Tried to render link ' + link.id + ' with no start port')
      return ''
    }

    start.x = startNode.x + startPosition.x
    start.y = startNode.y + startPosition.y
    start.fx = startPosition.facingX
    start.fy = startPosition.facingY

    let endNode, endPosition
    if (dragging) {
      if (link.endNode) {
        endNode = this.state.nodes[link.endNode]
        let endPorts = this.state.portPositions[link.endNode]
        endPosition = endPorts[link.endProperty]
      } else {
        endNode = { x: link.endX, y: link.endY }
        endPosition = {
          x: 0,
          y: 0,
          facingX: -Math.sign(link.endX - start.x),
          facingY: 0
        }
      }
    } else {
      endNode = this.state.nodes[link.inNode]
      let endPorts = this.state.portPositions[link.inNode]
      endPosition = endPorts[link.inProperty]
    }

    if (!endNode || !endPosition) {
      console.warn('Tried to render link ' + link.id + ' with no end port')
      return ''
    }

    end.x = endNode.x + endPosition.x
    end.y = endNode.y + endPosition.y
    end.fx = endPosition.facingX
    end.fy = endPosition.facingY

    let className = 'property-link'
    if (dragging) className += ' dragging'
    if (this.state.selection.includes('l' + link.id)) className += ' selected'

    return (
      <path
        className={className}
        d={this.getBezierPath(start, end)}
        key={link.id}
        onMouseDown={e => {
          this.stateBuffer.selection = util.mutate(this.stateBuffer.selection,
            selection => {
            let selectionID = 'l' + link.id
            if (!e.shiftKey) selection.splice(0)
            if (!selection.includes(selectionID)) selection.push(selectionID)
          })
        }}
        />
    )
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
        selected={this.state.selection.includes('n' + node.id)}
        saveState={state => {
          if (state.deleted) this.deleteNode(state.id)
          else this.updateNode(state)
        }}
        updatePortPositions={positions => {
          this.stateBuffer.portPositions =
            util.mutate(this.stateBuffer.portPositions,
              portPositions => portPositions[node.id] = positions)
        }}
        onPortDrag={(e, key) => this.beginLinkDrag(e, node.id, key)}
        onMouseDown={e => {
          this.stateBuffer.selection = util.mutate(this.stateBuffer.selection,
            selection => {
            let selectionID = 'n' + node.id
            if (!e.shiftKey) selection.splice(0) // clear if no ShiftKey
            if (!selection.includes(selectionID)) selection.push(selectionID)
          })
        }}
        />
    )
  }

  renderContent () {
    const position = this.state.position
    const viewTransform = `translate(${position[0]}px, ${position[1]}px)` +
      ` scale(${position[2]})`

    let { width, height } = this.state
    const viewOffset = `translate(${width / 2}px, ${height / 2}px)`

    let nodes = []
    for (let id in this.state.nodes) {
      nodes.push(this.renderNode(this.state.nodes[id]))
    }

    let links = []
    for (let id in this.state.links) {
      links.push(this.renderLink(this.state.links[id]))
    }
    if (this.state.draggingLink) {
      links.push(this.renderLink(this.state.draggingLink, true))
    }

    return (
      <div ref="scrollContainer" className="scroll-container"
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onWheel={this.onWheel}>
        <svg className="node-links-container">
          <g className="links-transform-offset"
            style={{ transform: viewOffset }}>
            <g className="links-transform-origin"
              style={{ transform: viewTransform }}>{links}</g>
          </g>
        </svg>
        <div className="view-transform-origin"
          style={{ transform: viewTransform }}>{nodes}</div>
      </div>
    )
  }

  createLink (fromPort, toPort) {
    let id
    this.stateBuffer.links = util.mutate(this.stateBuffer.links, links => {
      do {
        id = Math.random().toString(36)
      } while (id in links)

      links[id] = {
        id,
        outNode: fromPort.node,
        outProperty: fromPort.property,
        inNode: toPort.node,
        inProperty: toPort.property
      }

      let outNode = this.state.nodes[fromPort.node]
      for (let prop of outNode.properties) {
        if (prop.key === fromPort.property) {
          prop.links.push(id)
          break
        }
      }

      let inNode = this.state.nodes[toPort.node]
      for (let prop of inNode.properties) {
        if (prop.key === toPort.property) {
          prop.links.push(id)
          break
        }
      }
    })
  }

  screenToSpace (x, y) {
    let rect = this.refs.scrollContainer.getBoundingClientRect()
    x = x - rect.left - rect.width / 2
    y = y - rect.top - rect.height / 2
    x *= this.state.position[2]
    y *= this.state.position[2]
    x -= this.state.position[0]
    y -= this.state.position[1]
    return { x, y }
  }

  findClosestPort (x, y, checkValid) {
    checkValid = checkValid || (() => true)

    let closestNode = null
    let closestProperty = null
    let closestDistance = Infinity

    for (let id in this.state.nodes) {
      let node = this.state.nodes[id]
      let portPositions = this.state.portPositions[id]
      for (let key in portPositions) {
        let position = portPositions[key]
        let distance = Math.hypot(position.x + node.x - x,
          position.y + node.y - y)
        if (distance < closestDistance && checkValid(id, key)) {
          closestNode = id
          closestProperty = key
          closestDistance = distance
        }
      }
    }

    return {
      node: closestNode,
      property: closestProperty,
      distance: closestDistance
    }
  }

  beginLinkDrag (e, id, property) {
    let position = this.screenToSpace(e.clientX, e.clientY)
    let link = {
      id: 'dragging',
      startNode: id,
      startProperty: property,
      endNode: null,
      endProperty: null,
      endX: position.x,
      endY: position.y
    }
    this.stateBuffer.draggingLink = link
  }

  isValidLink (start, end) {
    let startNode = this.state.nodes[start.node]
    let endNode = this.state.nodes[end.node]

    if (startNode === endNode) return false

    let startProperty, endProperty
    for (let prop of startNode.properties) {
      if (prop.key === start.property) {
        startProperty = prop
        break
      }
    }
    for (let prop of endNode.properties) {
      if (prop.key === end.property) {
        endProperty = prop
        break
      }
    }

    if (startProperty.position === endProperty.position) return false

    return true
  }

  onKeyDown = e => {
    if (e.key === 'g') {
      // grab
      this.stateBuffer.grabbedSelected = true
      this.stateBuffer.draggingLink = null
    } else if (e.key === 'x') {
      // delete
      for (let item of this.state.selection) {
        if (item[0] === 'n') {
          this.deleteNode(item.substr(1))
        } else if (item[0] === 'l') {
          this.deleteLink(item.substr(1))
        }
      }
    }
  }

  onMouseDown = e => {
    if (this.state.grabbedSelected) {
      this.stateBuffer.grabbedSelected = false
    }
  }

  onMouseMove = e => {
    if (this.state.grabbedSelected) {
      let selectedNodes = []
      for (let item of this.state.selection) {
        if (item[0] === 'n') {
          // node
          selectedNodes.push(item.substr(1))
        } else if (item[0] === 'l') {
          // link. You can't grab a link. Noop.
        }
      }

      let deltaX = e.clientX - this.lastMousePosition.x
      let deltaY = e.clientY - this.lastMousePosition.y
      deltaX *= this.state.position[2]
      deltaY *= this.state.position[2]

      this.stateBuffer.nodes = util.mutate(this.stateBuffer.nodes, nodes => {
        for (let id of selectedNodes) {
          nodes[id].x += deltaX
          nodes[id].y += deltaY
        }
      })
    } else if (this.state.draggingLink) {
      this.stateBuffer.draggingLink = util.mutate(this.stateBuffer.draggingLink,
        link => {
        let position = this.screenToSpace(e.clientX, e.clientY)
        let closest = this.findClosestPort(position.x, position.y,
          (id, property) => {
            return this.isValidLink({
              node: link.startNode,
              property: link.startProperty
            }, { node: id, property })
        })

        // MARKER: HERE BE MAGIC NUMBER
        if (closest.distance < 15) {
          link.endNode = closest.node
          link.endProperty = closest.property
        } else {
          link.endX = position.x
          link.endY = position.y
          link.endNode = link.endProperty = null
        }
      })
    }

    this.lastMousePosition = { x: e.clientX, y: e.clientY }
  }

  onMouseUp = e => {
    if (this.state.draggingLink) {
      let draggingLink = this.state.draggingLink

      this.stateBuffer.draggingLink = null

      if (draggingLink.endNode) {
        let endNode = this.state.nodes[draggingLink.endNode]
        let endProperty
        for (let property of endNode.properties) {
          if (property.key === draggingLink.endProperty) {
            endProperty = property
            break
          }
        }

        let outPort = {
          node: draggingLink.startNode,
          property: draggingLink.startProperty
        }
        let inPort = {
          node: draggingLink.endNode,
          property: draggingLink.endProperty
        }
        if (endProperty.position === 'output') {
          [outPort, inPort] = [inPort, outPort]
        }

        this.createLink(outPort, inPort)
      }
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
    this.stateBuffer.position = position
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
    this.stateBuffer.nodes = nodes
  }

  renderMenu () {
    let addNode = type => this.addNode(nodeTypes[type])
    return (
      <Menu horizontal className="submenu-above">
        <MenuItem>
          View
          <Menu>
            <MenuItem onClick={() => {
              this.stateBuffer.position = [0, 0, 1]
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
