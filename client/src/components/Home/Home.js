import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import styles from './home.module.scss'

import Layout from '../layout';

async function authorize(navigate) {
  try {
    const result = await api.post('/auth')
    console.log(result)
    if (result.data.type === true) {
      console.log('authorized!')
      localStorage.setItem('Username', result.data.Username)
    }
  } catch(err) {
    console.log(err)
    localStorage.removeItem('Username')
    navigate('/login', {state: {message: 'the authorization failed on server, please relogin.'}})
  }
}

const Home = () => {
  const navigate = useNavigate()
  authorize(navigate)
  return (
    <>
      <button>
        <a href="/webs">webs</a>
      </button>
    </>
  );
};

export default Home;