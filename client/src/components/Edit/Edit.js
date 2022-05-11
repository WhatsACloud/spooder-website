import React, { memo, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../Shared/Authorizer'
import styles from './edit.module'

import { preventZoom, preventZoomScroll } from './PreventDefault'
import { mouseDown, mouseUp, mouseMove } from './Events'
import * as utils from './utils'
import * as OtherElements from './OtherElements'
import { Background } from './Background'

import api from '../../services/api'

import * as SilkShapes from './Silk'

// import spoodawebData from './TestingSpoodawebData'

import Konva from 'konva'
import * as ReactKonva from 'react-konva'

Konva.hitOnDragEnabled = true

const gridLink = "http://phrogz.net/tmp/grid.gif"

/*
how thingy works:
update objs state with data, AddNewObjs component updates the stuff to render, drawCanvas renders it onto the canvas

TO DO
add saving ability
*/

function UpdateBudBorderEvt({ draggingLine, hoverBudBorder, setHoverBudBorder }) {
  useEffect(() => {
    const stage = utils.getStage() 
    if (!stage) return
    const buds = stage.find('.bud')
    if (draggingLine) {
      for (const budIndex in buds) { // to change this cause performance issues
        const bud = buds[budIndex]
        const hitGroup = bud.children[1]
        const hitAreas = hitGroup.children
        for (const hitAreaIndex in hitAreas) {
          const hitArea = hitAreas[hitAreaIndex]
          hitArea.on('mousemove', snapToPreview)
        }
        hitGroup.on('mouseover', (evt) => {
          const stage = utils.getStage()
          const highlighter = stage.find('.highlighter')[0]
          highlighter.show()
          highlighter.setAttr('attachedObjId', evt.target.parent.parent.getAttr('objId'))
          setHoverBudBorder(true)
        })
        hitGroup.on('mouseout', (evt) => {
          const stage = utils.getStage()
          const highlighter = stage.find('.highlighter')[0]
          highlighter.hide()
          highlighter.setAttr('attachedObjId', null)
          setHoverBudBorder(false)
        })
      }
    } else {
      setHoverBudBorder(false)
      for (const budIndex in buds) {
        const bud = buds[budIndex]
        const hitGroup = bud.children[1]
        const hitAreas = hitGroup.children
        hitGroup.off('mouseup')
        for (const hitAreaIndex in hitAreas) {
          const hitArea = hitAreas[hitAreaIndex]
          hitArea.off('mousemove')
        }
        hitGroup.off('mouseover')
        hitGroup.off('mouseout')
        const stage = utils.getStage()
        const highlighter = stage.find('.highlighter')[0]
        highlighter.hide()
      }
    }

  }, [ draggingLine ])
  return <></>
}

function MouseMoveDetector({}) {
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

const scrollRight = (amt) => {
  const rootPos = utils.getRootPos()
  utils.setRootPos({x: rootPos.x - amt, y: rootPos.y})
}

const scrollDown = (amt) => {
  const rootPos = utils.getRootPos()
  utils.setRootPos({x: rootPos.x, y: rootPos.y - amt})
}

function DrawCanvas({ rendered, toggleCanDragLine, canvasWidth, canvasHeight }) {
  useEffect(() => {
    utils.setRootPos({x: 0, y: 0})
    const scrollAmt = 20
    document.addEventListener('keydown', (e) => {
      const key = e.key
      switch (key) {
        case 'ArrowUp':
          scrollDown(-scrollAmt)
          break
        case 'ArrowDown':
          scrollDown(scrollAmt)
          break
        case 'ArrowLeft':
          scrollRight(-scrollAmt)
          break
        case 'ArrowRight':
          scrollRight(scrollAmt)
          break
      }
    })
  }, [])
  return (
    <>
      <ReactKonva.Stage
        x={0}
        y={0}
        width={window.screen.width * 0.85}
        height={window.screen.height * 0.95}>
        <ReactKonva.Layer>
          {rendered}
          <Shapes.BudAnchorHighlighter></Shapes.BudAnchorHighlighter>
        </ReactKonva.Layer>
      </ReactKonva.Stage>
    </>
  )
}

function AddNewObjs({
    objsToUpdate,
    setDraggingLine,
    setRendered,
    rendered,
    setHoverBudBorder,
    setSelected,
    setToggleCanDragLine,
  }) { // to add some updating of positions AND maybe index in the object itself to be specific
  useEffect(() => {
    if (objsToUpdate) {
      const newRendered = [...rendered]
      utils.addObjs(objsToUpdate)
      Object.entries(objsToUpdate).forEach(([objId, obj]) => {
        if (obj.type === 'bud') {
          newRendered.push(
            <Shapes.Bud
              x={obj.position.x}
              y={obj.position.y}
              key={newRendered.length}
              objId={objId}
              setHoverBudBorder={setHoverBudBorder}
              ></Shapes.Bud>
          )
        } else if (obj.type === 'silk') {
          newRendered.push(
            <Shapes.Silk
              points={obj.positions}
              lineCircleMove={utils.lineCircleMove}
              key={newRendered.length}
              setDraggingLine={setDraggingLine}
              setSelected={setSelected}
              setToggleCanDragLine={setToggleCanDragLine}
              objId={objId}></Shapes.Silk>
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
  const [ selected, setSelected ] = useState()
  const [ canvasWidth, setCanvasWidth ] = useState(window.screen.width + 2 * 2000)
  const [ canvasHeight, setCanvasHeight ] = useState(window.screen.height + 2 * 2000)
  
  useEffect(async () => {
    const rootPos = utils.getRootPos()
    const width = utils.getStage().getAttr('width')
    const height = utils.getStage().getAttr('height')
    const urlString = window.location.search
    let paramString = urlString.split('?')[1];
    let queryString = new URLSearchParams(paramString);
    const objs = await api.post('/webs/get/objects', {
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
        setSelected={setSelected}
        setDraggingLine={setDraggingLine}
        setToggleCanDragLine={setToggleCanDragLine}
        setCanvasHeight={setCanvasHeight}
        setCanvasWidth={setCanvasWidth}
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}></AddNewObjs>
      <UpdateBudBorderEvt
        draggingLine={draggingLine}
        hoverBudBorder={hoverBudBorder}
        setHoverBudBorder={setHoverBudBorder}></UpdateBudBorderEvt>
      <div className={styles.wrapper}>
        <LineDragUpdater
          toggleCanDragLine={toggleCanDragLine}
          setObjsToUpdate={setObjsToUpdate}
          setDraggingLine={setDraggingLine}
          setSelected={setSelected}
          selected={selected}
          hoverBudBorder={hoverBudBorder}
          draggingLine={draggingLine}></LineDragUpdater>
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
          rendered={rendered}
          setObjsToUpdate={setObjsToUpdate}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          toggleCanDragLine={toggleCanDragLine}></DrawCanvas>
        </div>
        {/* <Background></Background> */}
      </div>
    </>
  )
}
export default Edit