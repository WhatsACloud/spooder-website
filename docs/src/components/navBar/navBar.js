import React, { useEffect, useState } from 'react';
import styles from './navBar.module'
import { UserHamburger } from './UserHamburger';

const navBar = (props) => {
  const [ username, setUsername ] = useState()
  useEffect(() => {
    const Username = localStorage.getItem('Username')
    setUsername(Username)
  })

  return (
    <div>
      <nav className={styles.nav}>
        <ul>
          <li><a className={styles.logo} href="/">Spooderweb</a></li>
          <li className={styles.space}><a></a></li>
          <li className={username ? styles.nil : styles.normal}><a href="/login?login=false">register</a></li>
          <li className={username ? styles.nil : styles.normal}><a href="/login?login=true">login</a></li>
          <UserHamburger username={username}></UserHamburger>
        </ul>
      </nav>
    </div>
  )
}

export default navBar;
