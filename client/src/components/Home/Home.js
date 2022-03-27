import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import styles from './home.module.scss'
import queryString from 'query-string'
import Authorizer from '../Authorizer'

import Layout from '../layout';

function RenderSpoodawebPreviews(props) {
  console.log('rerendered spooderwebPreviews')
  const spoodawebs = {
    'testing': {
      img: 'https://lh3.google.com/u/0/d/1cFoaSBuiG6kdkdpLyuYmTVBare_J1dmzGX9Uxa1COEE=w208-iv63',
      id: 1
    },
    'another test': {
      img: 'https://thumbs.lucid.app/documents/thumb/f95d1759-4be2-4fee-847a-be2037ca4926/0/163/NULL/140?clipToPage=false',
      id: 2
    }
  }
  const spoodawebPreviews = Object.keys(spoodawebs).map((spoodaweb) => (
    <button key={spoodaweb}
      className={`spoodawebPreview ${styles.spoodawebButton}`}
      onClick={() => props.navigate(`/webs/edit/?${queryString.stringify({id: spoodawebs[spoodaweb].id})}`)}>
      <div className={styles.image}>
        <img src={spoodawebs[spoodaweb].img}></img>
      </div>
      <div className={styles.title}>
        <p>{spoodaweb}</p>
      </div>
    </button>
  ))
  return (
    <ul className={`spoodawebPreviews ${styles.spoodawebPreviews}`}>{spoodawebPreviews}</ul>
  )
}

const ContextMenu = (props) => {
  console.log('rerendered context menu')
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

const handleContextMenu = (e, setAnchorPoint, setShow) => {
  let canShow = false
  const spoodawebPreviews = document.getElementsByClassName('spoodawebPreviews')
  // console.log(spooderwebPreviews)
  for (const spoodawebPreview of spoodawebPreviews) {
    if (spoodawebPreview.matches(':hover')) {
      canShow = true
      break
    }
  }
  console.log(canShow)
  if (canShow) {
    setAnchorPoint({ x: e.pageX, y: e.pageY })
    setShow(true)
    e.preventDefault()
  } else {
    setShow(false)
  }
}

const handleClick = (setShow) => {
  setShow(false)
}

const Home = () => { // to fix constant rerenders
  const [ anchorPoint, setAnchorPoint ] = useState({ x: 0, y: 0})
  const [ show, setShow ] = useState(false) // directly affect whether component can display or not
  const navigate = useNavigate()
  
  const handleContextMenuWrapper = e => {
    handleContextMenu(e, setAnchorPoint, setShow)
  }

  const handleClickWrapper = e => {
    handleClick(setShow)
  }

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenuWrapper);
    document.addEventListener("click", handleClickWrapper);
    return (() => {
      document.removeEventListener("contextmenu", handleContextMenuWrapper);
      document.removeEventListener("click", handleClickWrapper);
    })
  })
  console.log('rerendered home')
  return (
    <>
      <Authorizer navigate={navigate}></Authorizer>
      <ContextMenu x={anchorPoint.x} y={anchorPoint.y} show={show}></ContextMenu>
      <RenderSpoodawebPreviews navigate={navigate}></RenderSpoodawebPreviews>
    </>
  );
};

export default Home;