import React, { Component } from 'react';
import { Routes, BrowserRouter as Router, Route } from 'react-router-dom';

import Front from '../Front'
import NavBar from '../navBar'
import Home from '../Home'
import { Register, Login } from '../user'
import app from './app.module'

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route exact path='/' element={<Front/>} />
        <Route exact path='/home' element={<Home/>} />
        <Route exact path='/register' element={<Register/>} />
        <Route exact path='/login' element={<Login/>} />
      </Routes>
    </Router>
  );
}

export default App;