import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './navBar.module';

const navBar = (props) => {
  const [ username, setUsername ] = useState()
  useEffect(() => {
    const Username = localStorage.getItem('Username')
    console.log(Username)
    setUsername(Username)
  })

  return (
    <div>
      <nav className={styles.nav}>
        <ul>
          <li><a className={styles.logo} href="/">testing</a></li>
          <li className={styles.space}><a></a></li>
          <li className={styles.normal}><a href="/about">about</a></li>
          <li className={username ? styles.nil : styles.normal}><a href="/register">register</a></li>
          <li className={username ? styles.nil : styles.normal}><a href="/login">login</a></li>
          <li className={username ? styles.username : styles.nil}><a>{username}</a></li>
          <button className={username ? styles.normal : styles.nil}>
            <i className={`fa fa-user ${styles.accountIcon}`}></i>
          </button>
        </ul>
      </nav>
    </div>
  )
}

export default navBar;