import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../scss/login.module';

const login = () => {
  return (
    <div className={styles.div}>
      <p className={styles.header}>
        Sign up (I have your family hostage)
      </p>
      <form>
        <label for="email">email: </label>
        <input type="email" id="email" name="email"></input>
        <label for="email">email: </label>
        <input type="email" id="email" name="email"></input>
      </form>
    </div>
  )
}

export default login;