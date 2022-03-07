import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../scss/navBar';

const navBar = () => {
  return (
    <nav className={styles.nav}>
      <ul>
        <li className="nav-item">
          <a href="/about">test</a>
        </li>
      </ul>
    </nav>
  )
}

export default navBar;