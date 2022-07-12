import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import api from '../../../services/api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faFileLines } from '@fortawesome/free-solid-svg-icons'

import { SearchBar, SearchResult } from './Search'
import { UndoRedo } from './UndoRedo'
import { Categories } from './categories'

import { Debugger } from './debug'
import * as utils from '../utils'

function TaskBar({ setInSettings }) {
  return (
    <>
      <div className={styles.sideBar}>

      </div>
      <div className={styles.taskBar}>
        <button
          className={styles.stdButton}
          onClick={() => setInSettings(true)}>
          Settings
        </button>
        <button
          className={styles.stdButton}
          onClick={() => {
            const modes = utils.getGlobals().modes
            modes.autoDrag = !(modes.autoDrag)
          }}>
          <FontAwesomeIcon icon={faFileLines}></FontAwesomeIcon>
        </button>
        <button
          className={styles.stdButton}
          onClick={() => {
            const modes = utils.getGlobals().modes
            modes.gluing = !(modes.gluing)
          }}>
          glue
        </button>
        <SearchBar></SearchBar>
        <Categories></Categories>
        {/* <Debugger></Debugger> */}
        <UndoRedo></UndoRedo>
      </div>
    </>
  )
}
export default TaskBar