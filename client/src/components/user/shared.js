import React, { useState } from 'react'
import styles from '../../scss/user.module'

function EyeIcon(props) {
  if (props.eye) {
    return <i className={`fa fa-eye ${styles.eye}`}></i>
  } else {
    return <i className={`fa fa-eye-slash ${styles.eye}`}></i>
  }
}

function InputBox(props) {
  return (
    <div className={!!props.errorMsg ? styles.errorInputWrapper: styles.normalInputWrapper}>
      <label>{props.display}: </label>
      <div className={styles.inputContainer}>
        <input
          type={props.inputType || props.name}
          id={props.name}
          placeholder={props.noenter ? props.display: `Enter ${props.display}`}
          autoCapitalize='none'>
        </input>
        {props.children}
      </div>
      <p className={styles.errorMsg}>{props.errorMsg}</p>
    </div>
  )
}

function assignError(message, type, errorStates, changeErrorState) {
  console.log(message, type)
  let newObj = {...errorStates}
  for (const state in newObj) {
    newObj[state] = false
  }
  if (message !== null) newObj[type] = message
  changeErrorState(newObj)
  console.log(errorStates)
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
  PasswordBox,
  assignError
}