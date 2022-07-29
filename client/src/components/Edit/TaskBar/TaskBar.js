import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import api from '../../../services/api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faScrewdriverWrench  } from '@fortawesome/free-solid-svg-icons'

import { SearchBar, SearchResult } from './Search'
import { UndoRedo } from './UndoRedo'
import { Categories } from './categories'
import { ToolDropdown } from './ToolDropdown'

import { Debugger } from './debug'
import * as utils from '../utils'

function ToolButton() {
  const [ hovering, setHovering ] = useState(false)
  const [ on, setOn ] = useState(false)
  return (
    <>
      <button
        className={styles.stdButton}
        onClick={() => setOn(true)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        >
        <FontAwesomeIcon
          icon={faScrewdriverWrench}
          className={hovering ? styles.enlarged : styles.notEnlarged}
          ></FontAwesomeIcon>
        <p>Tools</p>
        <ToolDropdown on={on} setOn={setOn}></ToolDropdown>
      </button>
    </>
  )
}

function TaskBar({ setInSettings }) {
  const [ hover, setHover ] = useState(false)
  return (
    <>
      <div className={styles.taskBar}>
        {/* <button
          className={styles.stdButton}
          onClick={() => {
            const modes = utils.getGlobals().modes
            modes.autoDrag = !(modes.autoDrag)
          }}>
          <FontAwesomeIcon icon={faFileLines}></FontAwesomeIcon>
        </button> */}
        <ToolButton></ToolButton>
        <Categories outerStyle={styles}></Categories>
        {/* <Debugger></Debugger> */}
        {/* <UndoRedo></UndoRedo> */}
        <button
          className={styles.stdButton}
          onClick={() => setInSettings(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          >
          <FontAwesomeIcon className={hover ? styles.on : ''} icon={faGear}></FontAwesomeIcon>
          <p>Settings</p>
        </button>
        <SearchBar></SearchBar>
      </div>
    </>
  )
}
export default TaskBar