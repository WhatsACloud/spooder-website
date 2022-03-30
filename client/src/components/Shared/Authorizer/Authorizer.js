import React, { useEffect } from 'react'
import api from '../../../services/api'

async function authorize() {
  try {
    const result = await api.post('/auth')
    console.log(result)
    if (result.data.type === true) {
      console.log('authorized!')
      localStorage.setItem('Username', result.data.Username)
      return true
    }
    return false
  } catch(err) {
    console.log(err)
    console.log('not authorized! Removing username...')
    localStorage.removeItem('Username')
    return false
  }
}

const Authorizer = React.memo((props) => {
  useEffect(() => {
    authorize()
      .then((result) => {
        if (props.callback) {
          props.callback(result)
        }
        if (props.navigate) {
          if (!result) {
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
              props.navigate('/login', {state: {message: 'the authorization failed on server, please relogin.'}})
            }
          } else {
            if (window.location.pathname !== '/home') {
              props.navigate('/home')
            }
          }
        }
      })
  })
  return <></>
})

export default Authorizer