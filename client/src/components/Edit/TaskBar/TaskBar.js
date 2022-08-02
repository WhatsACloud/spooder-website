import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './taskBar.module'
import api from '../../../services/api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faScrewdriverWrench, faCloud, faCloudUpload  } from '@fortawesome/free-solid-svg-icons'

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

function SaveIcon() {
  const [ state, setState ] = useState(false) // true for saving false for default
  useEffect(() => {
    document.addEventListener('save', ({ detail }) => {
      setState(detail.state)
    })
  }, [])
  return (
    <div className={styles.saveIcon}>
      <FontAwesomeIcon icon={state ? faCloudUpload : faCloud}></FontAwesomeIcon>
      <p>
        {state ?
        "saving..."
        : "Saved!"
        }
      </p>
    </div>
  )
}

function ToHomeBtn({ focusedSearch }) {
  const navigate = useNavigate()
  return (
    <p className={focusedSearch ? styles.websiteIconExtended : styles.websiteIcon} onClick={() => navigate('/home')}>
      Spooderweb
    </p>
  )
}

function TaskBar({ setInSettings }) {
  const [ hover, setHover ] = useState(false)
  const [ focused, setFocused ] = useState(false) // for search bar
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
        <ToHomeBtn focusedSearch={focused}></ToHomeBtn>
        <SaveIcon></SaveIcon>
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
        <SearchBar focused={focused} setFocused={setFocused}></SearchBar>
      </div>
    </>
  )
}
export default TaskBar