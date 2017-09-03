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
import util from './util'

export default class NodeView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      x: props.x,
      y: props.y,
      width: props.width,
      name: props.name,
      type: props.type,
      properties: [...props.properties]
    }
  }

  saveState () {
    let state = {
      x: this.state.x,
      y: this.state.y,
      width: this.state.width,
      name: this.state.name,
      type: this.state.type,
      properties: this.state.properties,
      id: this.props.id
    }
    // only set this if necessary
    if (this.state.deleted) state.deleted = true
    this.props.saveState(state)
  }

  /**
   * @return pseudo-snapshot of this node view as required for computing nodes
   */
  getComputed () {
    let node = { properties: {} }
    for (let property of this.state.properties) {
      let computedProperty = {
        key: property.key,
        getComputedValue () {
          if (property.getComputedValue) {
            return property.getComputedValue(node)
          } else if (property.type === 'select') {
            return property.value
          }
        },
        setComputedValue (value) {
          // TODO
        }
      }
      node.properties[property.key] = computedProperty
    }
    return node
  }

  componentDidMount () {
    // update port positions
    let portPositions = {}

    // get reference node position
    let nodeRect = this.refs.node.getBoundingClientRect()

    for (let property of this.state.properties) {
      // get property port div
      let portRef = this.refs[`${property.key}Port`]

      if (portRef) {
        let rect = portRef.getBoundingClientRect()
        portPositions[property.key] = {
          x: rect.left - nodeRect.left + rect.width / 2,
          y: rect.top - nodeRect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
          // basically a cheap normal vector
          facingX: property.position === 'input' ? -1 : 1,
          facingY: 0
        }
      }
    }
    this.props.updatePortPositions(portPositions)
  }

  renderProperty (property, computed) {
    // the control input, if it exists
    let control = null

    if (property.type === 'select') {
      // create a <select> control
      let selectOptions = []
      for (let option in property.options) {
        let label = property.options[option]
        selectOptions.push(<option value={option} key={option}>{label}</option>)
      }

      control = <select
        onChange={e => {
          // update properties with new value
          this.setState({
            properties: util.mutate(this.state.properties, properties => {
              for (let i in properties) {
                let stateProperty = properties[i]
                if (stateProperty.key === property.key) {
                  properties[i] = util.mutate(stateProperty, stateProperty => {
                    stateProperty.value = e.target.value
                  })
                }
              }
            })
          }, () => this.saveState())
        }}
        value={property.value}>{selectOptions}</select>
    }

    let computedProperty = computed.properties[property.key]

    let className = `node-property ${property.type}-property`
    className += ` ${property.position}`

    if (property.isVisible &&
        !property.isVisible(computedProperty, computed)) {
      className += ' hidden'
    }

    let propertyName = property.name
    if (propertyName instanceof Function) {
      propertyName = propertyName(computedProperty, computed)
    }

    return (
      <div className={className} key={property.key}>
        <div
          className="property-port"
          onMouseDown={() => {
            this.props.onPortDrag(property.key)
          }}
          ref={`${property.key}Port`}></div>
        <div className="property-name">{propertyName}</div>
        <div className="property-control">{control}</div>
      </div>
    )
  }

  render () {
    const computed = this.getComputed()

    let properties = []
    for (let property of this.state.properties) {
      properties.push(this.renderProperty(property, computed))
    }

    return (
      <div className="node"
        style={{
          transform: `translate(${this.state.x}px, ${this.state.y}px)`,
          width: this.state.width
        }}
        tabIndex={-1}
        onKeyDown={this.onKeyDown}
        onMouseDown={this.onMouseDown}
        onBlur={this.onBlur}
        ref='node'
      >
        <header className="node-header">
          <span className="node-name">
            {this.props.name}
          </span>
        </header>
        <div className="node-properties">
          {properties}
        </div>
        <div className="width-adjust"
          onMouseDown={this.onWidthAdjustMouseDown}
          />
      </div>
    )
  }

  onMouseMove = (e) => {
    // TODO: refactor
    if (this.moving) {
      let [lastX, lastY] = this._lastMousePosition
      if (Number.isFinite(lastX) && Number.isFinite(lastY)) {
        let [deltaX, deltaY] = [e.clientX - lastX, e.clientY - lastY]
        this.setState({
          x: this.state.x + deltaX,
          y: this.state.y + deltaY
        })
      }
      this._lastMousePosition = [e.clientX, e.clientY]
      this.saveState()
    }
    if (this.adjustingWidth) {
      let [lastX, lastY] = this._lastMousePosition
      if (Number.isFinite(lastX) && Number.isFinite(lastY)) {
        let deltaX = e.clientX - lastX
        let width = this.state.width + deltaX
        if (width < 100) width = 100
        if (width > 500) width = 500
        this.setState({ width: width })
      }
      this._lastMousePosition = [e.clientX, e.clientY]
      this.saveState()
    }
  }
  onMouseDown = e => {
    if (this.moving || this.adjustingWidth) {
      this.moving = false
      this.adjustingWidth = false
      window.removeEventListener('mousemove', this.onMouseMove)
      window.removeEventListener('mousedown', this.onMouseDown)
      this.saveState()
    }
  }
  onBlur = e => {
    if (this.moving) {
      this.moving = false
      window.removeEventListener('mousemove', this.onMouseMove)
      this.saveState()
    }
  }
  onKeyDown = e => {
    if (e.key === 'g') {
      this._lastMousePosition = []
      this.moving = true
      this.adjustingWidth = false
      window.addEventListener('mousemove', this.onMouseMove)
    } else if (e.key === 'x') {
      this.setState({ deleted: true }, () => this.saveState())
    }
  }
  onWidthAdjustMouseDown = e => {
    e.stopPropagation()
    this._lastMousePosition = []
    this.moving = false
    this.adjustingWidth = true
    window.addEventListener('mousemove', this.onMouseMove)
    // HACK
    window.addEventListener('mouseup', this.onMouseDown)
  }
}
