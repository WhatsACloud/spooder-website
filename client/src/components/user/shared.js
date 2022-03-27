import React, { useState } from 'react'
import styles from './user.module'
import api from '../../services/api'

function EyeIcon(props) {
  if (props.eye) {
    return <i className={`fa fa-eye ${styles.eye}`}></i>
  } else {
    return <i className={`fa fa-eye-slash ${styles.eye}`}></i>
  }
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

async function userLoginHandler(endpoint, toSend, changeServerErrorState, navigate) {
  try {
    const res = await api.post(endpoint, toSend)
    console.log(res)
    console.log('success!')
    changeServerErrorState('')
    navigate('/home')

  } catch(err) {
    console.log(err)
    const res = err.response
    console.log(res)
    if (res) {
      changeServerErrorState(`Error ${res.status}: ${res.data.message}`)
    }
  }
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
  PasswordBox,
  assignError,
  userLoginHandler
}