import React, { memo, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../../Shared/Authorizer'
import styles from '../edit.module'

import { preventZoom, preventZoomScroll } from '../PreventDefault'
import { mouseDown, mouseUp, mouseMove } from '../Events'
import * as OtherElements from '../OtherElements'
import { Background } from '../Background'

import api from '../../../services/api'

import * as SilkShapes from '../Silk'
import * as BudShapes from '../Bud'

import * as utils from '../utils'
import { UpdateBudBorderEvt } from '../Bud/UpdateBudBorder'
import { DrawCanvas } from './DrawCanvas'
import { TaskBar } from '../TaskBar'
import { Settings } from '../Settings'

import Konva from 'konva'
import { BudView } from '../Select/BudView'

Konva.hitOnDragEnabled = true

const gridLink = "http://phrogz.net/tmp/grid.gif"

/*
how thingy works:
update objs state with data, AddNewObjs component updates the stuff to render, drawCanvas renders it onto the canvas

TO DO
add saving ability
*/

function MouseMoveDetector() {
  const [ middleMouseDown, setMiddleMouseDown ] = useState(false)
  const [ mousePos, setMousePos ] = useState({
    x: null,
    y: null
  })
  useEffect(() => {
    const mousePosWrapper = (e) => {
      mouseMove(e, middleMouseDown, mousePos, setMousePos)
    }
    const mouseDownWrapper = (e) => {
      mouseDown(e, setMiddleMouseDown)
    }
    const mouseUpWrapper = (e) => {
      // mouseUp(e, setMiddleMouseDown, setDragging)
      mouseUp(e, setMiddleMouseDown)
    }
    document.addEventListener('mousemove', mousePosWrapper)
    document.addEventListener('mouseup', mouseUpWrapper)
    document.addEventListener('mousedown', mouseDownWrapper)
    return () => {
      document.removeEventListener('mousemove', mousePosWrapper)
      document.removeEventListener('mousedown', mouseDownWrapper)
      document.removeEventListener('mouseup', mouseUpWrapper)
    }
  }, [ mousePos, middleMouseDown ])
  return <></>
}

function AddNewObjs({
    objsToUpdate,
    setDraggingLine,
    setRendered,
    rendered,
    setHoverBudBorder,
    setSelectedSilk,
    setToggleCanDragLine,
    selectedObj,
    setSelectedObj
  }) { // to add some updating of positions AND maybe index in the object itself to be specific
  useEffect(() => {
    if (objsToUpdate) {
      const newRendered = [...rendered]
      utils.addObjs(objsToUpdate)
      const rootPos = utils.getRootPos()
      Object.entries(objsToUpdate).forEach(([objId, obj]) => {
        if (obj.type === 'bud') {
          newRendered.push(
            <BudShapes.Bud
              x={obj.position.x + rootPos.x}
              y={obj.position.y + rootPos.y}
              key={newRendered.length}
              objId={objId}
              setSelectedObj={setSelectedObj}
              setHoverBudBorder={setHoverBudBorder}
              ></BudShapes.Bud>
          )
        } else if (obj.type === 'silk') {
          newRendered.push(
            <SilkShapes.Silk
              points={obj.positions}
              key={newRendered.length}
              setDraggingLine={setDraggingLine}
              setSelectedSilk={setSelectedSilk}
              setSelectedObj={setSelectedObj}
              setToggleCanDragLine={setToggleCanDragLine}
              objId={objId}></SilkShapes.Silk>
          )
        } else {
          console.warn('Error: object type not specified')
        }
      })
      for (const objId in objsToUpdate) {
      }
      setRendered(newRendered)
    }
  }, [ objsToUpdate ])
  return <></>
}

function Edit() { // TODO: change objs such that they are indexed by their objId and add saving
  /* 
  the objects list in the canvas is stored in the Konva main layer, as well as other data.
  Yes, that contradicts react state's entire purpose, but when I switched from Konva to react-konva,
  I realised that when you update the objects rendered, it just adds more objects to the canvas instead of updating them.
  For these reasons (and that I don't want to waste more time changing back to Konva), global data is stored in the Konva main layer.
  */
  const navigate = useNavigate()
  const [ dragging, setDragging ] = useState(false)
  const [ toggleCanDragLine, setToggleCanDragLine ] = useState(false)
  const [ hoverBudBorder, setHoverBudBorder ] = useState(false)
  const [ objsToUpdate, setObjsToUpdate ] = useState()
  const [ rendered, setRendered ] = useState([])
  const [ draggingLine, setDraggingLine ] = useState(false)
  const [ selectedSilk, setSelectedSilk ] = useState()
  const [ selectedObj, setSelectedObj ] = useState()
  const [ inSettings, setInSettings ] = useState(false)
  const [ settings, setSettings ] = useState({
    Background: false
  })
  
  useEffect(async () => {
    const rootPos = utils.getRootPos()
    const width = utils.getStage().getAttr('width')
    const height = utils.getStage().getAttr('height')
    utils.getStage().on('mousedown', evt => {
      setSelectedObj()
    })
    const urlString = window.location.search
    let paramString = urlString.split('?')[1];
    let queryString = new URLSearchParams(paramString);
    let objs = {
      data: {
        spoodawebData: {}
      }
    }
    try {
      objs = await api.post('/webs/get/objects', {
        spoodawebId: queryString.get('id'),
        startPos: [
          rootPos.x - width,
          rootPos.y - height,
        ],
        endPos: [
          width * 2,
          height * 2 
        ]
      })
    } catch(err) {
      console.log('Unable to retrieve objects.')
    }
    const spoodawebData = objs.data.spoodawebData
    setObjsToUpdate(spoodawebData)
    const mainLayer = utils.getMainLayer()
    mainLayer.setAttr('nextObjId', objs.data.nextObjId) // probably should be the next highest objId instead of this
    mainLayer.setAttr('newObjs', {})
    document.addEventListener('keydown', preventZoom)
    document.addEventListener('wheel', preventZoomScroll, { passive: false })
    return () => {
      document.removeEventListener('keydown', preventZoom)
      document.removeEventListener('wheel', preventZoomScroll)
    }
  }, [])
  return (
    <>
      <Authorizer navigate={navigate} requireAuth={true}></Authorizer>
      <MouseMoveDetector></MouseMoveDetector>
      <AddNewObjs 
        objsToUpdate={objsToUpdate}
        setRendered={setRendered}
        rendered={rendered}
        setHoverBudBorder={setHoverBudBorder}
        setSelectedSilk={setSelectedSilk}
        setDraggingLine={setDraggingLine}
        setToggleCanDragLine={setToggleCanDragLine}
        selectedObj={selectedObj}
        setSelectedObj={setSelectedObj}></AddNewObjs>
      <UpdateBudBorderEvt
        draggingLine={draggingLine}
        hoverBudBorder={hoverBudBorder}
        setHoverBudBorder={setHoverBudBorder}></UpdateBudBorderEvt>
      <Settings
        inSettings={inSettings}
        setInSettings={setInSettings}
        settings={settings}
        setSettings={setSettings}></Settings>
      <TaskBar
        setInSettings={setInSettings}></TaskBar>
      <div className={styles.wrapper}>
        <SilkShapes.LineDragUpdater
          toggleCanDragLine={toggleCanDragLine}
          setObjsToUpdate={setObjsToUpdate}
          setDraggingLine={setDraggingLine}
          setSelectedSilk={setSelectedSilk}
          selectedSilk={selectedSilk}
          hoverBudBorder={hoverBudBorder}
          draggingLine={draggingLine}></SilkShapes.LineDragUpdater>
        <OtherElements.ObjectDrawer
          setDragging={setDragging}
          toggleCanDragLine={toggleCanDragLine}
          setToggleCanDragLine={setToggleCanDragLine}></OtherElements.ObjectDrawer>
        <OtherElements.FakeDraggableObj
          dragging={dragging}
          setDragging={setDragging}
          setObjsToUpdate={setObjsToUpdate}></OtherElements.FakeDraggableObj>
        <div className={styles.divCanvas} id='divCanvas'>
          <DrawCanvas
          rendered={rendered}></DrawCanvas>
        </div>
        <BudView
          selectedObj={selectedObj}></BudView>
        <Background canRender={settings.Background}></Background>
      </div>
    </>
  )
}
export default Edit