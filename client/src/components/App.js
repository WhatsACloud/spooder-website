import React, { Component } from 'react';
import { Routes, BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './Home';
import NavBar from './navBar'
import Login from './login'
import app from '../scss/app.module'
import styles from '../scss/main'

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route exact path='/' element={<Home/>} />
        <Route exact path='/user' element={<Login/>} />
      </Routes>
    </Router>
  );
}

export default App;