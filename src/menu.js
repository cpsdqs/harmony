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

export class Menu extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    let className = 'menu'
    if (this.props.horizontal) className += ' horizontal'
    if (this.props.className) className += ` ${this.props.className}`
    return (
      <div className={className}>
        {this.props.children}
      </div>
    )
  }
}

export class MenuItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selected: false
    }
  }

  onMouseOver = () => {
    if (this.props.disabled) return
    this.setState({ selected: true })
    if (this.props.onMouseOver) this.props.onMouseOver()
  }
  onMouseOut = () => {
    if (this.props.disabled) return
    this.setState({ selected: false })
    if (this.props.onMouseOut) this.props.onMouseOut()
  }
  onClick = () => {
    if (this.props.disabled) return
    this.setState({ selected: true })
    if (this.props.onClick) this.props.onClick()
  }

  render () {
    let className = 'menu-item'
    if (this.props.disabled) className += ' disabled'
    if (this.state.selected) className += ' selected'

    return (
      <div
        className={className}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        onClick={this.onClick}
        >
        {this.props.children}
      </div>
    )
  }
}

export class Shortcut extends React.Component {
  render () {
    let text = ''
    if (this.props.ctrlKey) text += '⌃'
    if (this.props.altKey) text += '⌥'
    if (this.props.shiftKey) text += '⇧'
    if (this.props.metaKey) text += '⌘'
    return (<span className="shortcut">{text}{this.props.children}</span>)
  }
}
