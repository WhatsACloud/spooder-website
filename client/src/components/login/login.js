import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../scss/login.module';

function EyeIcon(props) {
  if (props.eye) {
    return <i class="fa fa-eye"></i>;
  } else {
    return <i class="fa fa-eye-slash"></i>
  }
}

const login = () => {
  const [ visible, toggleVisible ] = useState(false);

  let inputType = "password";
  if (visible) {
    inputType = "text";
  } else {
    inputType = "password";
  }
  return (
    <div className={styles.div}>
      <i className="fa-solid fa-eye"></i>
      <p className={styles.header}>
        Sign up
      </p>
      <form>
        <div className={styles.inputContainer}>
          <label for="email">email: </label>
          <input 
            type="email"
            id="email" 
            name="email"
            placeholder="Enter Email">
          </input>
        </div>
        <div className={styles.inputContainer}>
          <label for="password">password: </label>
          <button
           className={styles.password_icon}
           onClick={() => toggleVisible(!visible)}
           type="button">
             <EyeIcon eye={visible}></EyeIcon>
          </button>
          <input 
            type={inputType}
            id="password" 
            name="password"
            placeholder="Enter Password"
            autoCapitalize='none'
            />
        </div>
      </form>
    </div>
  )
}

export default login;