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

export default class ValueSlider extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      editing: false,
      value: this.props.value
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value })
    }
  }

  render () {
    let items = []
    if (this.state.editing) {
      items.push(<input key="value-editor" className="value-editor"
        value={this.state.value}
        type="number"
        min={this.props.min}
        max={this.props.max}
        step={this.props.step || 0.1}
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Escape') {
            this.setState({ editing: false, value: this.props.value })
          } else if (e.key === 'Enter') {
            this.setState({ editing: false })
            this.props.onChange(+e.target.value)
          }
        }}
        onChange={e => this.setState({ value: e.target.value })}
        />)
    } else {
      let percentage = 0
      if (Number.isFinite(this.props.min) &&
          Number.isFinite(this.props.max)) {
        percentage = (this.state.value - this.props.min) / (this.props.max -
          this.props.min)
      }

      items.push(<div key="value-percentage"
        style={{ transform: `scaleX(${percentage})` }}
        className="value-percentage"></div>)
      if (this.props.editable) {
        items.push(<button key="step-down" className="step step-down"></button>)
      }

      let displayValue = this.state.value
      if (Number.isFinite(displayValue)) {
        displayValue = Math.round(displayValue * 1000) / 1000
      }
      items.push(
        <div key="value-display" className="value-display"
          onMouseDown={e => {
            if (!this.props.editable) return
            this.lastMousePosition = { x: e.clientX, y: e.clientY }
            this.mouseDownPosition = { x: e.clientX, y: e.clientY }
            this.maxMouseDistanceFromStart = 0
            window.addEventListener('mousemove', this.onMouseMove)
            window.addEventListener('mouseup', this.onMouseUp)
          }}
          onMouseUp={e => {
            if (!this.props.editable) return
            let distance = this.maxMouseDistanceFromStart
            if (distance < 3) this.setState({ editing: true })
          }}
          >
          {displayValue}
        </div>
      )
      if (this.props.editable) {
        items.push(<button key="step-up" className="step step-up"></button>)
      }
    }

    let className = 'value-slider'
    if (this.props.editable) className += ' editable'

    return <div className={className}>{items}</div>
  }

  onMouseMove = e => {
    let startDeltaX = e.clientX - this.mouseDownPosition.x
    let startDeltaY = e.clientY - this.mouseDownPosition.y
    let startDistance = Math.hypot(startDeltaX, startDeltaY)
    if (startDistance > this.maxMouseDistanceFromStart) {
      this.maxMouseDistanceFromStart = startDistance
    }

    let value = this.state.value
    let speed = 0.1
    if (e.shiftKey) speed *= 10
    if (e.ctrlKey) speed /= 10
    let changePerPixel = speed * (this.props.step || 0.1)
    let deltaX = e.clientX - this.lastMousePosition.x
    value += changePerPixel * deltaX

    if (Number.isFinite(this.props.min) && value < this.props.min) {
      value = this.props.min
    }
    if (Number.isFinite(this.props.max) && value > this.props.max) {
      value = this.props.max
    }

    this.setState({ value })
    this.lastMousePosition = { x: e.clientX, y: e.clientY }
  }

  onMouseUp = e => {
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
  }
}
