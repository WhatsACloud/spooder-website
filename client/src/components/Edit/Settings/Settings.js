import React, { useEffect, useState } from 'react'
import styles from './Settings.module'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

function Settings({ inSettings, setInSettings, setSettings, settings }) {
  const [ renderedSettings, setRenderedSettings ] = useState()
  useEffect(() => {
    console.log(settings)
    const toSettings = Object.keys(settings).map((setting, index) => 
      (
        <div key={index} className={styles.setting}>
          <p>
            { setting }
          </p>
          <button
            onClick={() => {
              const newSettings = {...settings}
              newSettings[setting].value = !(newSettings[setting].value)
              setSettings(newSettings)
            }}>
            { String(settings[setting].value) }
          </button>
          {settings[setting].html}
        </div>
      )
    ) 
    setRenderedSettings(toSettings)
  }, [ settings ])
  return (
    <div id='divSettings' className={inSettings ? styles.divSettings : styles.none}>
      <button
        className={styles.close}
        onClick={() => setInSettings(false)}>
        <FontAwesomeIcon icon={faClose}></FontAwesomeIcon> 
      </button>
      <div id='settings' className={styles.settings}>
        {renderedSettings}
      </div>
    </div>
  );
}

export { Settings }