import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './user.module'
import { PasswordBox, assignError, userLoginHandler, Title, ToOtherSide  } from './shared'
import InputBox from '../Shared/InputBox'
import { loginSchema } from './userSchema'
import { ErrorBox } from '../Shared/errorMsg'
import Authorizer from '../Shared/Authorizer'

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
  const [ serverErrorState, changeServerErrorState ] = useState(location.state ? location.state.message || '' : '')
  const [ inner, setInner ] = useState()
  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    delay: 0,
    config: config.gentle
  })
  const { x } = useSpring({
    from: { x: -100 },
    to: { x: 0 },
    reset: true,
    delay: 0,
    config: config.default
  })
  useEffect(() => {
    if (inLogin) {
      setInner((
        <>
          <form className={styles.form}>
            <InputBox name="email" display="Email" errorMsg={errorStates.Email}></InputBox>
            <PasswordBox name="password" display="Password" errorMsg={errorStates.Password}></PasswordBox>
            <ErrorBox>
              {serverErrorState}
            </ErrorBox>
            <button
              type="button"
              className={styles.signUp}
              onMouseDown={() => Login(
                errorStates,
                changeErrorState,
                changeServerErrorState,
                navigate,
                document.getElementById("email").value,
                document.getElementById("password").value
                )}>
                Login
            </button>
          </form>
        </>
      ))
    } else {
      setInner((
        <Register setInLogin={setInLogin}></Register>
      ))
    }
  }, [ inLogin ])
  return (
    <>
      <Authorizer navigate={navigate}></Authorizer>
      <div className={styles.background}></div>
      <div
        className={inLogin ? styles.outerDiv : styles.outerDivRegister}>
        <div className={styles.div}>
          <animated.div
            className={styles.anotherWrapper}
            style={{
              opacity: opacity,
              marginLeft: x
              }}>
            <Title name={inLogin ? "LOGIN" : "REGISTER"}></Title>
            <ToOtherSide text={inLogin ?
              "Don't have an account? Sign up for one here"
              : 'Have an account already? Login here'}
              onClick={() => {
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