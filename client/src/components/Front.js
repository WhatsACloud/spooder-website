import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Authorizer from './Shared/Authorizer'
import NavBar from './navBar'

const Front = () => {
  const navigate = useNavigate()
  return (
    <>
      <NavBar></NavBar>
      <Authorizer navigate={navigate}></Authorizer>
    </>
  );
};

export default Front;