import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './user.module'
import { PasswordBox, assignError, userLoginHandler, Title, ToOtherSide  } from './shared'
import InputBox from '../Shared/InputBox'
import { loginSchema } from './userSchema'
import { ErrorBox } from '../Shared/errorMsg'
import Authorizer from '../Shared/Authorizer'
import NavBar from '../navBar'

import Register from './register'

// import { TransitionGroup } from 'react-transition-group'
import { useSpring, animated, config } from "react-spring"

async function Login(errorStates, changeErrorState, changeServerErrorState, navigate, email, password) {
  try {
    const toSend = {
      "Email": email,
      "Password": password,
    }
    try {
      const result = await loginSchema.validate(toSend, {abortEarly: false})
      console.log(result)
      console.log('success!')
      assignError(null, null, errorStates, changeErrorState)
      await userLoginHandler('/login', toSend, changeServerErrorState, navigate)
    } catch(err) {
      console.log(err)
      const data = err.inner[0]
      console.log(data)
      assignError(data.message, data.path, errorStates, changeErrorState)
    }
  } catch(err) {
    console.log(err)
  }
}

function TriggerRerender({ divSpring, inLogin }) {
  useEffect(() => {
    console.log(inLogin)
    setTimeout(() => {
      divSpring.start({
        marginLeft: 0,
        opacity: 1,
        config: config.gentle,
      })
    }, 10)
  }, [ inLogin ])
  return <></>
}

const login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const urlString = window.location.search
  let paramString = urlString.split('?')[1];
  let queryString = new URLSearchParams(paramString);
  const initialIsLogin = queryString.get('login') === "true"
  const [ inLogin, setInLogin ] = useState(initialIsLogin)
  const [ errorStates, changeErrorState ] = useState({
    "Username": false,
    "Email": false,
    "Password": false,
    "RepeatPassword": false
  })
  const [ serverErrorState, changeServerErrorState ] = useState(location.state ? (location.state.message || '') : '')
  const [ inner, setInner ] = useState()
  const [ divStyle, divSpring ] = useSpring(() => ({
    opacity: 0,
    marginLeft: -100,
  }))
	const plsLogin = () => Login(
		errorStates,
		changeErrorState,
		changeServerErrorState,
		navigate,
		document.getElementById("email").value,
		document.getElementById("password").value
	)
	useEffect(() => {
		document.addEventListener("keypress", evt => {
			if (evt.key === "Enter") {
				plsLogin()
			}
		})
	}, [])
  useEffect(() => {
    if (inLogin) {
      setInner((
        <>
          <form className={styles.form}>
            <InputBox name="email" display="Email" errorMsg={errorStates.Email}></InputBox>
            <PasswordBox name="password" display="Password" errorMsg={errorStates.Password}></PasswordBox>
            <ErrorBox>
              {(errorStates.Email || errorStates.Password || errorStates.Username || errorStates.RepeatPassword) ? '' : serverErrorState}
            </ErrorBox>
            <button
              type="button"
              className={styles.signUp}
              onMouseDown={plsLogin}>
                Login
            </button>
          </form>
        </>
      ))
    } else {
      setInner((
        <Register></Register>
      ))
    }
  }, [ inLogin, errorStates, serverErrorState ])
  return (
    <>
      <NavBar></NavBar>
      <Authorizer navigate={navigate}></Authorizer>
      <TriggerRerender inLogin={inLogin} divSpring={divSpring}></TriggerRerender>
      <div className={styles.background}></div>
      <div
        className={inLogin ? styles.outerDiv : styles.outerDivRegister}>
        <div className={styles.div}>
          <animated.div
            className={styles.anotherWrapper}
            style={divStyle}>
            <Title name={inLogin ? "LOGIN" : "REGISTER"}></Title>
            <ToOtherSide text={inLogin ?
              "Don't have an account? Sign up for one here"
              : 'Have an account already? Login here'}
              onClick={() => {
                divSpring.start({
                  marginLeft: -100,
                  opacity: 0,
                  config: {
                    duration: 0,
                  },
                })
                setInLogin(!inLogin)
              }}></ToOtherSide>
            {inner}
          </animated.div>
        </div>
      </div>
    </>
  )
}

export default login
