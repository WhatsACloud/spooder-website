import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import styles from './home.module.scss'
import queryString from 'query-string'
import Authorizer from '../Shared/Authorizer'
import InputBox from '../Shared/InputBox'
import { ErrorBox } from '../Shared/errorMsg'
import { object, string, ref } from 'yup'

import Layout from '../layout';

const spoodawebSchema = object({
  title: string().required('Title is a required field')
})

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

async function createNewSpoodaweb (changeServerErrorState, changeTitleErrorState) {
  const title = document.getElementById("title").value
  try {
    const validateResult = await spoodawebSchema.validate({title: title}, {abortEarly: false})
    console.log(validateResult)
    changeTitleErrorState('')
    try {
      const postResult = await api.post('/webs/create', {title: title})
      console.log(postResult)
      console.log('success!')
      changeServerErrorState('')
    } catch(err) {
      console.log(err)
      console.log('errored!')
      changeServerErrorState(err.response.data.message)
    }
  } catch(err) {
    console.log(err)
    const data = err.inner[0]
    console.log(data.message)
    changeTitleErrorState(data.message)
  }
}

const handleClick = (setShow, setPrompted) => {
  setShow(false)
  const blankScreen = document.getElementsByClassName(styles.blankScreen)[0]
  if (blankScreen && blankScreen.matches(':hover')) {
    setPrompted(false)
  }
}

const Prompt = ({ prompted, titleErrorState, changeTitleErrorState }) => {
  const [ serverErrorState, changeServerErrorState ] = useState('')

  useEffect(() => {
    if (!prompted) {
      window.setTimeout(() => {
        changeServerErrorState('')
        changeTitleErrorState('')
      }, 200)
    }
  })
  return (
    <div className={prompted ? styles.prompted : styles.unprompted}>
      <InputBox name="title" display="Enter Title of Spoodaweb" noenter={true} errorMsg={titleErrorState}></InputBox>
      <ErrorBox>
        {serverErrorState}
      </ErrorBox>
      <button className={styles.createSpoodawebButton} onClick={() => {createNewSpoodaweb(changeServerErrorState, changeTitleErrorState)}}>
        create spoodaweb
      </button>
    </div>
  )
}

const Home = () => { // to fix constant rerenders
  const [ anchorPoint, setAnchorPoint ] = useState({ x: 0, y: 0})
  const [ show, setShow ] = useState(false) // directly affect whether component can display or not
  const [ prompted, setPrompted ] = useState(false)
  const [ titleErrorState, changeTitleErrorState ] = useState('')
  const navigate = useNavigate()
  
  const handleContextMenuWrapper = e => {
    handleContextMenu(e, setAnchorPoint, setShow)
  }

  const handleClickWrapper = e => {
    handleClick(setShow, setPrompted)
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
      <div className={prompted ? styles.blankScreen : styles.none}></div>
      <ContextMenu x={anchorPoint.x} y={anchorPoint.y} show={show}></ContextMenu>
      <button className={styles.createSpoodawebButton} onClick={() => {setPrompted(!prompted)}}>
        <i className={`fa fa-plus ${styles.plusIcon}`}></i>
        create
      </button>
      <Prompt prompted={prompted} titleErrorState={titleErrorState} changeTitleErrorState={changeTitleErrorState}></Prompt>
      <RenderSpoodawebPreviews navigate={navigate}></RenderSpoodawebPreviews>
    </>
  );
};

export default Home;