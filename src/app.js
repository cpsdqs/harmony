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
import AppPanel from './app-panel'
import NodePanel from './node-panel'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      data: {
        nodes: {},
        currentTime: 0,
        duration: 10
      }
    }
  }

  render () {
    return (
      <div className="harmony-app">
        <AppPanel className="app-panel" />
        <NodePanel className="node-panel" data={this.state.data.nodes} />
      </div>
    )
  }
}
