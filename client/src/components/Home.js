import React from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'

import Layout from './layout';

async function test() {
  const result = await api.post('/auth')
  console.log(result)
}

const Home = () => {
  test()
  return (
    <div>
      <p>
        kill me
      </p>
    </div>
  );
};

export default Home;