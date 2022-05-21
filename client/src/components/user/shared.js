import React, { useState } from 'react'
import styles from './user.module'
import api from '../../services/api'
import InputBox from '../Shared/InputBox'
import inputBoxStyles from '../Shared/InputBox/InputBox.module'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

function EyeIcon(props) {
  if (props.eye) {
    return <FontAwesomeIcon icon={faEye} className={styles.eye}></FontAwesomeIcon>
  } else {
    return <FontAwesomeIcon icon={faEyeSlash} className={styles.eye}></FontAwesomeIcon>
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
    window.location.reload()

  } catch(err) {
    console.log(err)
    console.log('errored!')
    const res = err.response
    console.log(res)
    if (res) {
      changeServerErrorState(`Error ${res.status}: ${res.data.message}`)
    } else {
      changeServerErrorState('An error has occured in the server, please try again later.')
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
        className={inputBoxStyles.passwordIcon}
        onClick={() => toggleVisible(!visible)}
        type="button">
          <EyeIcon eye={visible}></EyeIcon>
      </button>
    </InputBox>
  )
}

function Title({ name }) {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.block}></div>
        <p className={styles.text}>
          {name}
        </p>
      </div>
    </>
  )
}

function ToOtherSide({ text, onClick }) {
  return (
    <>
      <p
        className={styles.toOtherSide}
        onClick={onClick}>
        {text}
      </p>
    </>
  )
}

export {
  PasswordBox,
  assignError,
  userLoginHandler,
  Title,
  ToOtherSide
}