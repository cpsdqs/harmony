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
      x: 0,
      y: 0,
      width: 150
    }
  }

  saveState () {
    // TODO
  }

  render () {
    const properties = []
    for (const property of this.props.properties) {
      properties.push(
        <div
          className={`node-property ${property.type}-property ` +
            property.position}
          key={property.name}
        >
          <div className="property-port"></div>
          <div className="property-name">
            {property.name}
          </div>
          <div className="property-control" /* TODO */></div>
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
      saveState()
    }
  }
  onBlur = e => {
    if (this.moving) {
      this.moving = false
      window.removeEventListener('mousemove', this.onMouseMove)
      saveState()
    }
  }
  onKeyDown = e => {
    if (e.key === 'g') {
      this._lastMousePosition = []
      this.moving = true
      this.adjustingWidth = false
      window.addEventListener('mousemove', this.onMouseMove)
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
