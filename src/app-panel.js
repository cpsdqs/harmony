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
import Panel from './panel'
import { Menu, MenuItem, Shortcut } from './menu'

export default class AppPanel extends Panel {
  renderMenu () {
    return (
      <Menu horizontal>
        <MenuItem>
          File
          <Menu>
            <MenuItem onClick={this.menuOpen}>
              Open
            </MenuItem>
            <MenuItem onClick={this.menuSave}>
              Save
            </MenuItem>
          </Menu>
        </MenuItem>
        <MenuItem>
          Help
          <Menu>
            <MenuItem disabled>No Help</MenuItem>
          </Menu>
        </MenuItem>
      </Menu>
    )
  }

  menuOpen () {}
  menuSave () {}
}

