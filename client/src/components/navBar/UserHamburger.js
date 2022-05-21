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
        zIndex={7}></BackgroundClickDetector>
      <button
        className={username ? styles.normal : styles.nil}
        onClick={() => {
          setOpened(true)
          const func = () => {
            setOpened(false)
            document.getElementById('backClickDetect').removeEventListener("mousedown", func)
          }
          document.getElementById('backClickDetect').addEventListener("mousedown", func)
        }}>
        <FontAwesomeIcon icon={faUser} className={styles.accountIcon}></FontAwesomeIcon>
      </button>
      <div className={opened ? styles.hamburgerMenu : styles.nil}>
        <button
          className={styles.signOut}
          onClick={async () => {
            console.log('ur mom')
            await api.patch('/logout')
            window.location.reload()
            navigate('/login')
          }}>sign out</button>
      </div>
    </>
  )
}
export { UserHamburger }