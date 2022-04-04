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

const Authorizer = ({ requireAuth=false, navigate }) => {
  useEffect(() => {
    authorize()
      .then((result) => {
        if (!result) {
          if (requireAuth) {
            navigate('/login', {state: {message: 'the authorization failed on server, please relogin.'}})
          }
        } else {
          if (!requireAuth) {
            navigate('/home')
          }
        }
      })
  }, [])
  return <></>
}

export default Authorizer