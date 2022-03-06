import React, { Component } from 'react';
import { Routes, BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './Home';
import NavBar from './navBar'

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <NavBar />
        <Routes>
          <Route exact path='/' element={<Home/>} />
        </Routes>
      </Router>
    );
  }
}

export default App;