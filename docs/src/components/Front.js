import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Authorizer from './Shared/Authorizer'
import NavBar from './navBar'
import styles from './front.module'

function RegisterNow({ navigate }) {
  return (
    <button className={styles.registerNow} onClick={() => navigate('/login?login=false')}>
      ReGiStEr NoOoOoWwW!!!!!!!
    </button>
  )
}

const Front = () => {
  const navigate = useNavigate()
  return (
    <>
      <NavBar></NavBar>
      <Authorizer navigate={navigate}></Authorizer>
      <p className={styles.text}>
        Do you need to improve in a foreign language but are too lazy too? Well too bad, You still need to put in effort! (no, duolingo doesn't work.)
        <br></br>
        <br></br>
        Buuuuuuuuuut, this website does help to make learning new vocabulary less painful. So
        <br></br>
        <br></br>
        <RegisterNow navigate={navigate}></RegisterNow>
      </p>
    </>
  );
};

export default Front;