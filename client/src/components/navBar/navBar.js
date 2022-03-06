import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../scss/navBar';

const navBar = () => {
  return (
    <nav className={styles.nav}>
      <li>
        <Link to='/'>Home</Link>
      </li>
    </nav>
  )
}