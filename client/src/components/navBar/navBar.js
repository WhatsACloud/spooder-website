import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../scss/navBar.module';

const navBar = () => {
  return (
    <div>
      <nav className={styles.nav}>
        <ul>
          <li><a className={styles.logo} href="/">testing</a></li>
          <li className={styles.space}><a></a></li>
          <li className={styles.normal}><a href="/about">about</a></li>
          <li className={styles.normal}><a href="/user">login</a></li>
        </ul>
      </nav>
    </div>
  )
}

export default navBar;