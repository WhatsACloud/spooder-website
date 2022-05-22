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
    setObjsToUpdate,
    setTriggerDragLine,
    setRendered,
    rendered,
    setHoverBud,
    setSelectedSilk,
    setToggleCanDragLine,
    selectedObj,
    setDragging,
    setSelectedObj
  }) { // to add some updating of positions AND maybe index in the object itself to be specific
  useEffect(() => {
    if (objsToUpdate) {
      const newObjsToUpdate = JSON.parse(JSON.stringify(objsToUpdate))
      const newRendered = [...rendered]
      const rootPos = utils.getRootPos()
      Object.entries(newObjsToUpdate).forEach(([objId, obj]) => {
        if (obj !== null) {
          if (obj.type === 'bud') {
            newRendered.push(
              <BudShapes.Bud
                x={obj.position.x + rootPos.x}
                y={obj.position.y + rootPos.y}
                attachedSilkObjId={obj.attachedTo}
                key={newRendered.length}
                objId={objId}
                setHoverBud={setHoverBud}
                setObjsToUpdate={setObjsToUpdate}
                setTriggerDragLine={setTriggerDragLine}
                setDragging={setDragging}
                setSelectedObj={setSelectedObj}
                ></BudShapes.Bud>
            )
          } else if (obj.type === 'silk') {
            newRendered.push(
              <SilkShapes.Silk
                points={obj.positions}
                key={newRendered.length}
                attachedTo1={obj.attachedTo1}
                attachedTo2={obj.attachedTo2}
                setTriggerDragLine={setTriggerDragLine}
                setDraggingLine={setDraggingLine}
                setSelectedSilk={setSelectedSilk}
                setSelectedObj={setSelectedObj}
                setToggleCanDragLine={setToggleCanDragLine}
                objId={objId}></SilkShapes.Silk>
            )
          } else {
            console.log('Error: object type not specified')
          }
          utils.addObjs(newObjsToUpdate)
        } else {
          const newRendered = [...rendered]
          for (const [ index, e ] of Object.entries(newRendered)) {
            if (e.props.objId === objId) {
              newRendered.splice(index, 1)
            }
          }
          setRendered(newRendered)
          const konvaObj = utils.getKonvaObjById(objId)
          konvaObj.destroy()
        }
      })
      setRendered(newRendered)
    }
  }, [ objsToUpdate ])
  return <></>
}

function UpdateModes(modes) { // pls fix this later
  // basically when reactState modes changes then this updates the one in Konva
  useEffect(() => {
    const mainLayer = utils.getMainLayer()
    mainLayer.setAttr('modes', modes)
  }, [modes])
  return <></>
}

function FocusOnObj({ focus }) {
  useEffect(() => {
    const obj = utils.getObjById(focus)
    if (obj) {
      const position = obj.position
      const divCanvas = document.getElementById('divCanvas')
      const toBeRootPos = {
        x: position.x - divCanvas.clientWidth,
        y: position.y - divCanvas.clientHeight,
      }
      console.log(toBeRootPos)
      utils.setRootPos(toBeRootPos)
    }
  }, [ focus ])
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
  const [ hoverBud, setHoverBud ] = useState(false)
  const [ objsToUpdate, setObjsToUpdate ] = useState()
  const [ rendered, setRendered ] = useState([])
  const [ draggingLine, setDraggingLine ] = useState(false)
  const [ triggerDragLine, setTriggerDragLine ] = useState(false)
  const [ selectedSilk, setSelectedSilk ] = useState()
  const [ selectedObj, setSelectedObj ] = useState()
  const [ inSettings, setInSettings ] = useState(false)
  const [ focus, setFocus ] = useState()
  const [ settings, setSettings ] = useState({
    Background: false
  })
  const [ modes, setModes ] = useState({
    autoDrag: false
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
    mainLayer.setAttr('modes', modes)
    mainLayer.setAttr('addedObj', false)
    mainLayer.setAttr('budObjs', {})
    mainLayer.setAttr('history', [])
    mainLayer.setAttr('historyIndex', -1)
    mainLayer.setAttr('triggerDragLine', false)
    mainLayer.setAttr('draggingLine', false)
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
      <UpdateModes
        modes={modes}></UpdateModes>
      <AddNewObjs
        setObjsToUpdate={setObjsToUpdate}
        objsToUpdate={objsToUpdate}
        setObjsToUpdate={setObjsToUpdate}
        setRendered={setRendered}
        rendered={rendered}
        setTriggerDragLine={setTriggerDragLine}
        setHoverBud={setHoverBud}
        setSelectedSilk={setSelectedSilk}
        setDraggingLine={setDraggingLine}
        setDragging={setDragging}
        setToggleCanDragLine={setToggleCanDragLine}
        selectedObj={selectedObj}
        setSelectedObj={setSelectedObj}></AddNewObjs>
      <Settings
        inSettings={inSettings}
        setInSettings={setInSettings}
        settings={settings}
        setSettings={setSettings}></Settings>
      <TaskBar
        setInSettings={setInSettings}
        setModes={setModes}
        setSelectedObj={setSelectedObj}
        selectedObj={selectedObj}
        setFocus={setFocus}
        modes={modes}></TaskBar>
      <FocusOnObj
        focus={focus}></FocusOnObj>
      <div className={styles.wrapper}>
        <SilkShapes.LineDragUpdater
          toggleCanDragLine={toggleCanDragLine}
          setObjsToUpdate={setObjsToUpdate}
          setDraggingLine={setDraggingLine}
          hoverBud={hoverBud}
          setSelectedSilk={setSelectedSilk}
          selectedSilk={selectedSilk}
          setTriggerDragLine={setTriggerDragLine}
          triggerDragLine={triggerDragLine}
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
          selectedObj={selectedObj}
          setSelectedObj={setSelectedObj}></BudView>
        <Background canRender={settings.Background}></Background>
      </div>
    </>
  )
}
export default Edit