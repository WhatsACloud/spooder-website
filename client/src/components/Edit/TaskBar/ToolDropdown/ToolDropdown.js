import React, { useState, useEffect } from 'react'
import styles from './toolDropdown.module'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { BackgroundClickDetector } from '../../../BackgroundClickDetector'

function ToolElement({ name, onClick, icon }) {
  return (
    <div
      onClick={onClick}
      className={styles.toolElement}
      >
      <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
      <div className={styles.spacer}></div>
      <p>{name}</p>
    </div>
  )
}

function ToolDropdown({ on, setOn }) {
  return (
    <>
      <BackgroundClickDetector on={on} mousedown={() => setOn(false)} zIndex={20}></BackgroundClickDetector>
      <div className={on ? styles.toolDropDown : styles.none}>
        <ToolElement
          name='Glue'
          onClick={() => {
            const modes = utils.getGlobals().modes
            modes.gluing = !(modes.gluing)
          }}
          icon={faLink}
          ></ToolElement>
      </div>
    </>
  )
}
export { ToolDropdown }