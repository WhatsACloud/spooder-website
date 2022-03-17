import React, { useState } from 'react'
import styles from '../../scss/user.module'

function EyeIcon(props) {
  if (props.eye) {
    return <i className={`fa fa-eye ${styles.eye}`}></i>
  } else {
    return <i className={`fa fa-eye-slash ${styles.eye}`}></i>
  }
}

function detectPasswordChange(event) { // pls add next time too lazy now

}

function InputBox(props) {
  return (
    <div className={!!props.errorMsg ? styles.errorInputContainer: styles.normalInputContainer}>
      <label>{props.display}: </label>
      {props.children}
      <input
        type={props.inputType || props.name}
        id={props.name}
        placeholder={props.noenter ? props.display: `Enter ${props.display}`}
        autoCapitalize='none'
        onChange={props.name === "password" || props.name === "repeatPassword" ? detectPasswordChange : null}>
      </input>
      <p className={styles.errorMsg}>{props.errorMsg}</p>
    </div>
  )
}

function PasswordBox(props) {
  const [ visible, toggleVisible ] = useState(false);
  let inputType = "password";
  if (visible) {
    inputType = "text";
  } else {
    inputType = "password";
  }
  return (
    <InputBox name={props.name} display={props.display} inputType={inputType} noenter={props.noenter} errorMsg={props.errorMsg}>
      <button
        className={styles.passwordIcon}
        onClick={() => toggleVisible(!visible)}
        type="button">
          <EyeIcon eye={visible}></EyeIcon>
      </button>
    </InputBox>
  )
}

export {
  InputBox,
  PasswordBox
}