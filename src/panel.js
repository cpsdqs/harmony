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
import Menu from 'rc-menu'

export default class Panel extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div className={'panel ' + this.props.className}>
        <div className="panel-content">
          {this.renderContent()}
        </div>
        <div className="panel-menu">
          {this.renderMenu()}
        </div>
      </div>
      )
  }

  renderMenu () {
    return (<Menu mode="horizontal" />)
  }

  renderContent () {
    return <div />
  }
}