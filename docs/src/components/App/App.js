import React, { Component, useEffect, useState } from 'react'
import { Routes, HashRouter as Router, Route } from 'react-router-dom'

import Front from '../Front'
import NavBar from '../navBar'
import Home from '../Home'
import { Register, Login } from '../user'
import Edit from '../Edit'
import app from './app.module'

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path='/spooder-website' element={<Front/>} />
        <Route exact path='/spooder-website/home' element={<Home/>} />
        <Route exact path='/spooder-website/login' element={<Login/>} />
        <Route path='/spooder-website/webs/edit' element={<Edit/>} />
      </Routes>
    </Router>
  );
}

export default App;