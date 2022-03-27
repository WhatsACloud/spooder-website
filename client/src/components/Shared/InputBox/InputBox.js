import React from 'react'
import styles from './InputBox.module'

export default function InputBox({ errorMsg, display, inputType, name, noenter, children}) {
  return (
    <div className={!!errorMsg ? styles.errorInputWrapper: styles.normalInputWrapper}>
      <label>{display}: </label>
      <div className={styles.inputContainer}>
        <input
          type={inputType || name}
          id={name}
          placeholder={noenter ? display: `Enter ${display}`}
          autoCapitalize='none'>
        </input>
        {children}
      </div>
      <p className={styles.errorMsg}>{errorMsg}</p>
    </div>
  )
}