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

export default class NodeView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      x: props.x,
      y: props.y,
      width: props.width,
      name: props.name,
      type: props.type,
      properties: [...props.properties],
      deleted: false
    }
  }

  saveState () {
    this.props.saveState({
      x: this.state.x,
      y: this.state.y,
      width: this.state.width,
      name: this.state.name,
      type: this.state.type,
      properties: this.state.properties,
      id: this.props.id,
      deleted: this.state.deleted
    })
  }

  getComputed () {
    // TODO
    let node = { properties: {} }
    for (let property of this.state.properties) {
      let computedProperty = {
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

  render () {
    const computed = this.getComputed()
    const properties = []
    for (const property of this.props.properties) {
      let control = ''
      if (property.type === 'select') {
        let options = []
        for (let option in property.options) {
          options.push(
            <option value={option} key={option}>
              {property.options[option]}
            </option>
          )
        }
        control = <select
          onChange={e => {
            let properties = [...this.state.properties]
            for (let prop of properties) {
              if (prop.key === property.key) {
                prop.value = e.target.value
                break
              }
            }
            this.setState({ properties: properties })
          }}
          value={property.value}>{options}</select>
      }
      let className = 'node-property'
      className += ` ${property.type}-property`
      className += ` ${property.position}`
      if (property.isVisible) {
        if (!property.isVisible(computed.properties[property.key], computed)) {
          className += ` hidden`
        }
      }
      let propertyName = property.name
      if (propertyName instanceof Function) {
        propertyName = propertyName(computed.properties[property.key], computed)
      }

      properties.push(
        <div
          className={className}
          key={property.key}
        >
          <div className="property-port"></div>
          <div className="property-name">{propertyName}</div>
          <div className="property-control">{control}</div>
        </div>
      )
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
