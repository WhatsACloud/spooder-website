import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

const Authorizer = (props) => {
  const navigate = useNavigate()
  useEffect(() => {
    authorize()
      .then((result) => {
        if (!result) {
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            navigate('/login', {state: {message: 'the authorization failed on server, please relogin.'}})
          }
        } else {
          if (window.location.pathname !== '/home') {
            navigate('/home')
          }
        }
      })
  }, [])
  return <></>
}

export default Authorizer