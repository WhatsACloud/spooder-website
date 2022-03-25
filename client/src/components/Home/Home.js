import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import styles from './home.module.scss'

import Layout from '../layout';

async function authorize(navigate) {
  try {
    const result = await api.post('/auth')
    console.log(result)
    if (result.data.type === true) {
      console.log('authorized!')
      localStorage.setItem('Username', result.data.Username)
    }
  } catch(err) {
    console.log(err)
    localStorage.removeItem('Username')
    navigate('/login', {state: {message: 'the authorization failed on server, please relogin.'}})
  }
}

const Authorizer = React.memo((props) => {
  authorize(props.navigate)
  return <></>
})

function RenderSpoodawebPreviews(props) {
  const spoodawebs = {
    'testing': 'https://lh3.google.com/u/0/d/1cFoaSBuiG6kdkdpLyuYmTVBare_J1dmzGX9Uxa1COEE=w208-iv63',
    'another test': 'https://thumbs.lucid.app/documents/thumb/f95d1759-4be2-4fee-847a-be2037ca4926/0/163/NULL/140?clipToPage=false'
  }
  const spoodawebPreviews = Object.keys(spoodawebs).map((spoodaweb) => (
    <button className={styles.spoodawebButton}>
      <div className={styles.image}>
        <img src={spoodawebs[spoodaweb]}></img>
      </div>
      <div className={styles.title}>
        <p>{spoodaweb}</p>
      </div>
    </button>
  ))
  return (
    <ul>{spoodawebPreviews}</ul>
  )
}

const ContextMenu = (props) => {
  console.log('a')
  if (props.show) {
    return (
      <div style={{'top': props.y, 'left': props.x}} className={styles.contextMenu}>
        <ul>
          <button className={styles.contextMenuButton}>
            delete
          </button>
          <button className={styles.contextMenuButton}>
            rename
          </button>
      </ul>
      </div>
    )
  } else {
    return <></>
  }
}

const Home = () => { // todo: figure out how to stop this thing from rerendering so can stop needlessly hitting backend authorization
  const [ anchorPoint, setAnchorPoint ] = useState({ x: 0, y: 0})
  const [ show, setShow ] = useState(false)
  const handleContextMenu = (e) => {
    setAnchorPoint({ x: e.pageX, y: e.pageY })
    setShow(true)
    e.preventDefault()
  }
  const navigate = useNavigate()

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    return (() => {
      document.removeEventListener("contextmenu", handleContextMenu);
    })
  })
  return (
    <>
      <Authorizer navigate={navigate}></Authorizer>
      <ContextMenu x={anchorPoint.x} y={anchorPoint.y} show={show}></ContextMenu>
      <RenderSpoodawebPreviews></RenderSpoodawebPreviews>
    </>
  );
};

export default Home;