import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faFileLines } from '@fortawesome/free-solid-svg-icons'

function TaskBar({ setInSettings, setModes, modes }) {
  useEffect(() => {
    console.log(modes)
  }, [modes])
  return (
    <div className={styles.taskBar}>
      <button
        className={styles.settingsBtn}
        onClick={() => setInSettings(true)}>
        <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>
      </button>
      <button
        className={styles.autoDragBtn}
        onClick={() => {
          const newModes = {...modes}
          newModes.autoDrag = !(modes.autoDrag)
          setModes(newModes)
        }}>
        <FontAwesomeIcon icon={faFileLines}></FontAwesomeIcon>
      </button>
    </div>
  )
}
export default TaskBar