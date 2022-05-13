import React, { useEffect } from 'react'
import styles from './Settings.module'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

function Settings({ inSettings, setInSettings }) {
  return (
    <div id='settings' className={inSettings ? styles.settings : styles.none}>
      <button
        className={styles.close}
        onClick={() => setInSettings(false)}>
        <FontAwesomeIcon icon={faClose}></FontAwesomeIcon> 
      </button>
    </div>
  );
}

export { Settings }