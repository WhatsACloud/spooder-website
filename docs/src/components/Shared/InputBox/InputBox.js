import React, { useEffect, useState, useRef } from 'react'
import styles from './InputBox.module'

export default function InputBox({ errorMsg, display, inputType, name, noMargin=false }) {
  const inputElement = useRef(null)
  const [ focused, setFocused ] = useState(false)
  const [ text, setText ] = useState('')
  return (
    <div className={!!errorMsg ? styles.errorInputWrapper: styles.normalInputWrapper}>
      <div className={styles.inputContainer}>
        <input
          ref={inputElement}
          type={inputType || name}
          value={text}
          onChange={e => {
            setText(e.target.value)
          }}
          onFocus={() => {
            setFocused(true)
          }}
          onBlur={() => {
            if (text.length === 0) {
              setFocused(false)
            }
          }}
          id={name}
          autoCapitalize='none'
          style={{
            marginLeft: noMargin ? 0 : ''
          }}>
        </input>
        <span
          className={focused ? styles.placeholderFocus : styles.placeholderUnfocus}
          onClick={() => {
            inputElement.current.focus()
          }}
          >{display}</span>
        <p className={styles.errorMsg}>{errorMsg}</p>
      </div>
    </div>
  )
}