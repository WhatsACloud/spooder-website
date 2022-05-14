import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'

function TaskBar({ setInSettings }) {
  return (
    <div className={styles.taskBar}>
      <button
        className={styles.settingsBtn}
        onClick={() => setInSettings(true)}>
        <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>
      </button>
      <button
        className={styles.AutoDrag}
        onClick={() => setInSettings(true)}>
        <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>
      </button>
    </div>
  )
}
export default TaskBar