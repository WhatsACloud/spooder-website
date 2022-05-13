import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'

function TaskBar({ setInSettings }) {
  return (
    <div>
      <button
        className={styles.button}
        onClick={() => setInSettings(true)}>
        <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>
      </button>
    </div>
  )
}
export default TaskBar