import React, { useState, useEffect, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import styles from './home.module.scss'
import queryString from 'query-string'
import InputBox from '../Shared/InputBox'
import { ErrorBox } from '../Shared/errorMsg'
import { object, string, ref } from 'yup'
import Authorizer from '../Shared/Authorizer'
import NavBar from '../navBar'

import { SearchBar } from '../Edit/TaskBar/Search'
import { SpoodawebSearchBar } from './SpoodawebSearchBar'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const spoodawebSchema = object({
  title: string().required('Title is a required field')
})

async function getSpoodawebPreviews() {
  try {
    const webs = await api.get('/webs/get/spoodawebs')
    return webs.data
  } catch(err) {
    console.log(err)
  }
  return null
}

const loading = () => {
  return <p>loading</p>
}

function SpoodawebPreviews({ navigate, spoodawebPreviews }) {
  return (
    <ul className={`spoodawebPreviews ${styles.spoodawebPreviews}`}>{
      spoodawebPreviews?.map(spoodaweb => (
        <button key={spoodaweb.id}
          className={`spoodawebPreview ${styles.spoodawebButton}`}
          onClick={() => navigate(`/webs/edit/?${queryString.stringify({id: spoodaweb.id})}`)}>
          <div className={styles.image}>
            <img src={spoodaweb.img ? spoodaweb.img : ''}></img>
          </div>
          <div className={styles.title}>
            <p>{spoodaweb.title}</p>
          </div>
        </button>
      ))
    }</ul>
  )
}

function RenderSpoodawebPreviews({ navigate, spoodawebPreviews }) {
  /*
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
  */
  return (
    <>
      <Suspense fallback={loading}>
        <SpoodawebPreviews
          navigate={navigate}
          spoodawebPreviews={spoodawebPreviews}></SpoodawebPreviews>
      </Suspense>
    </>
  )
}

const ContextMenu = (props) => {
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
  for (const spoodawebPreview of spoodawebPreviews) {
    if (spoodawebPreview.matches(':hover')) {
      canShow = true
      break
    }
  }
  if (canShow) {
    setAnchorPoint({ x: e.pageX, y: e.pageY })
    setShow(true)
    e.preventDefault()
  } else {
    setShow(false)
  }
}

async function createNewSpoodaweb (changeServerErrorState, changeTitleErrorState, navigate) {
  const title = document.getElementById("title").value
  try {
    const validateResult = await spoodawebSchema.validate({title: title}, {abortEarly: false})
    changeTitleErrorState('')
    try {
      const postResult = await api.post('/webs/create', {title: title})
      const spoodawebId = postResult.data.spoodawebId
      changeServerErrorState('')
      navigate(`/webs/edit/?${queryString.stringify({id: spoodawebId})}`)
    } catch(err) {
      console.log(err)
      console.log('errored!')
      if (err.response) {
        changeServerErrorState(err.response.data.message)
      }
    }
  } catch(err) {
    console.log(err)
    if (err.inner) {
      const data = err.inner[0]
      console.log(data.message)
      changeTitleErrorState(data.message)
    }
  }
}

const handleClick = (setShow, setPrompted) => {
  setShow(false)
  const blankScreen = document.getElementsByClassName(styles.blankScreen)[0]
  if (blankScreen && blankScreen.matches(':hover')) {
    setPrompted(false)
  }
}

const Prompt = ({ prompted, titleErrorState, changeTitleErrorState, navigate }) => {
  const [ serverErrorState, changeServerErrorState ] = useState('')

  useEffect(() => {
    if (!prompted) {
      window.setTimeout(() => {
        changeServerErrorState('')
        changeTitleErrorState('')
        document.getElementById('prompt').style.display = 'none'
      }, 200)
    } else {
      document.getElementById('prompt').style.display = 'block'
      // transition: opacity 0.2s;
    }
  })
  return (
    <div className={prompted ? styles.prompted : styles.unprompted} id='prompt'>
      <InputBox name="title" display="Enter Title of Spoodaweb" noenter={true} errorMsg={titleErrorState}></InputBox>
      <ErrorBox>
        {serverErrorState}
      </ErrorBox>
      <button className={styles.createSpoodawebButton} onClick={() => {createNewSpoodaweb(changeServerErrorState, changeTitleErrorState, navigate)}}>
        create spoodaweb
      </button>
    </div>
  )
}

function GetSpoodawebPreviews({ setOriginalSpoodawebPreviews }) {
  useEffect(async () => {
    const webs = await getSpoodawebPreviews()
    setOriginalSpoodawebPreviews(webs)
  }, [])
  return <></>
}

const Home = () => { // to fix constant rerenders
  const [ anchorPoint, setAnchorPoint ] = useState({ x: 0, y: 0})
  const [ show, setShow ] = useState(false) // directly affect whether component can display or not
  const [ prompted, setPrompted ] = useState(false)
  const [ titleErrorState, changeTitleErrorState ] = useState('')
  const [ spoodawebPreviews, setSpoodawebPreviews ] = useState()
  const [ originalSpoodawebPreviews, setOriginalSpoodawebPreviews ] = useState()
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
  return (
    <>
      <NavBar></NavBar>
      <Authorizer requireAuth={true} navigate={navigate}></Authorizer>
      <div className={prompted ? styles.blankScreen : styles.none}></div>
      <ContextMenu x={anchorPoint.x} y={anchorPoint.y} show={show}></ContextMenu>
      <GetSpoodawebPreviews
        setOriginalSpoodawebPreviews={setOriginalSpoodawebPreviews}></GetSpoodawebPreviews>
      <div className={styles.homeTaskBar}>
        <button className={styles.createSpoodawebButton} onClick={() => {setPrompted(!prompted)}}>
          <FontAwesomeIcon icon={faPlus} className={styles.plusIcon}></FontAwesomeIcon>
          create
        </button>
        <SpoodawebSearchBar
          originalSpoodawebPreviews={originalSpoodawebPreviews}
          setSpoodawebPreviews={setSpoodawebPreviews}></SpoodawebSearchBar>
      </div>
      <Prompt
        prompted={prompted}
        titleErrorState={titleErrorState}
        changeTitleErrorState={changeTitleErrorState}
        navigate={navigate}></Prompt>
      <RenderSpoodawebPreviews
        navigate={navigate}
        spoodawebPreviews={spoodawebPreviews}></RenderSpoodawebPreviews>
    </>
  );
};

export default Home;