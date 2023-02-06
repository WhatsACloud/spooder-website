import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Authorizer from './Shared/Authorizer'

const Front = () => {
  const navigate = useNavigate()
  return (
    <>
      <Authorizer navigate={navigate}></Authorizer>
    </>
  );
};

export default Front;