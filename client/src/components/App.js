import React, { Component } from 'react';
import { Routes, BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './Home';
import NavBar from './navBar'
import { Register, Login } from './user'
import app from '../scss/app.module'

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route exact path='/' element={<Home/>} />
        <Route exact path='/register' element={<Register/>} />
        <Route exact path='/login' element={<Login/>} />
      </Routes>
    </Router>
  );
}

export default App;