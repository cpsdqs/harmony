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
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import Panel from './panel'
import NodeView from './node-view'

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
    return (
      <div className="scroll-container"
        onWheel={this.onWheel}
      >
        <div className="view-transform-origin"
          style={{transform: viewTransform}}>
          <NodeView
            name="Oscillator"
            id="somerandomid"
            properties={[
              {
                type: 'audio',
                position: 'output',
                name: 'Audio',
                value: null
              }, {
                type: 'value',
                position: 'input',
                name: 'Frequency',
                min: 10,
                value: 440,
                max: 22000
              }, {
                type: 'value',
                position: 'input',
                name: 'Gain',
                min: 0,
                value: 1,
                max: 2
              }
            ]}
            saveState={state => {
              const nodes = { ...this.state.nodes }
              nodes['somerandomid'] = state
              this.setState({
                nodes: nodes
              })
            }}
            />
        </div>
      </div>
    )
  }

  onWheel = e => {
    e.stopPropagation()
    e.preventDefault()
    let position = [...this.state.position]
    if (e.ctrlKey) {
      let scaleFactor = 1 - (e.deltaY / 100)
      if (position[2] > 3 && scaleFactor > 1) scaleFactor = 1
      if (position[2] < .3 && scaleFactor < 1) scaleFactor = 1
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

  renderMenu () {
    return (
      <Menu mode="horizontal" className="submenu-above">
        <SubMenu title="View">
          <MenuItem onClick={() => {
            this.setState({ position: [0, 0, 1] })
          }}>Reset</MenuItem>
        </SubMenu>
        <SubMenu title="Add">
          <MenuItem>Math</MenuItem>
          <MenuItem>Oscillator</MenuItem>
          <MenuItem>Output</MenuItem>
          <MenuItem>Current Time</MenuItem>
          <MenuItem>Value</MenuItem>
        </SubMenu>
      </Menu>
    )
  }
}
