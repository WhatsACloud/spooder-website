import React, { useEffect, useState } from 'react' 
import styles from './userHamburger.module'
import { useNavigate } from 'react-router-dom'

import api from '../../services/api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

import { BackgroundClickDetector } from '../BackgroundClickDetector'

function UserHamburger({ username }) {
  const [ opened, setOpened ] = useState(false)
  const navigate = useNavigate()
  return (
    <>
      <BackgroundClickDetector
        on={opened}
				mousedown={() => setOpened(false)}
        zIndex={1000}></BackgroundClickDetector>
      <button
        className={username ? styles.normal : styles.nil}
        onClick={() => setOpened(true)}>
        <FontAwesomeIcon icon={faUser} className={styles.accountIcon}></FontAwesomeIcon>
      </button>
      <div className={opened ? styles.hamburgerMenu : styles.nil}>
        <button
          className={styles.signOut}
          onClick={async () => {
            await api.patch('/logout')
            window.location.reload()
            navigate('/login')
          }}>sign out</button>
      </div>
    </>
  )
}
export { UserHamburger }
