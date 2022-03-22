import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api'

import Layout from './layout';

async function authorize(navigate) {
  try {
    const result = await api.post('/auth')
    console.log(result)
    if (result.data.type === true) {
      console.log('authorized!')
    }
  } catch(err) {
    console.log(err)
    navigate('/login', {state: {message: 'the authorization failed on server, please relogin.'}})
  }
}

const Home = () => {
  const navigate = useNavigate()
  authorize(navigate)
  return (
    <>
      <p>test</p>
    </>
  );
};

export default Home;