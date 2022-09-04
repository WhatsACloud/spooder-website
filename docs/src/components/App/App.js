import React, { Component, useEffect, useState } from 'react'
import { Routes, BrowserRouter as Router, Route } from 'react-router-dom'

import Front from '../Front'
import NavBar from '../navBar'
import Home from '../Home'
import { Register, Login } from '../user'
import Edit from '../Edit'
import app from './app.module'

function App() {
  return (
    <Router basename='https://yumyummyyy.github.io/spooder-website'>
      <Routes>
        <Route exact path='/' element={<Front/>} />
        <Route exact path='/home' element={<Home/>} />
        <Route exact path='/login' element={<Login/>} />
        <Route path='/webs/edit' element={<Edit/>} />
      </Routes>
    </Router>
  );
}

export default App;