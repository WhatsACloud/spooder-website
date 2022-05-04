import React, { memo, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../Shared/Authorizer'
import styles from './edit.module'

import { preventZoom, preventZoomScroll } from './PreventDefault'
import { mouseDown, mouseUp, mouseMove } from './Events'
import { stopDragLine, startDragLine, snapToPreview, lineCircleMove, getObjById, getKonvaObjs, getStage, updateLinePos, snapLine, getCanvasMousePos, isInCanvas, snapLineCircleToLine } from './HelperFuncs'
import * as OtherElements from './OtherElements'
import * as Shapes from './Shapes'
import { Background } from './Background'

import spoodawebData from './TestingSpoodawebData'

import Konva from 'konva'
import * as ReactKonva from 'react-konva'

Konva.hitOnDragEnabled = true

const gridLink = "http://phrogz.net/tmp/grid.gif"

/*
how thingy works:
update objs state with data, UpdateObjs component updates the stuff to render, drawCanvas renders it onto the canvas

TO DO
add saving ability
*/

function UpdateBudBorderEvt({ draggingLine, hoverBudBorder, setHoverBudBorder }) {
  useEffect(() => {
    const stage = getStage() 
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
          const stage = getStage()
          const highlighter = stage.find('.highlighter')[0]
          highlighter.show()
          highlighter.setAttr('attachedObjId', evt.target.parent.parent.getAttr('objId'))
          setHoverBudBorder(true)
        })
        hitGroup.on('mouseout', (evt) => {
          const stage = getStage()
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
        const stage = getStage()
        const highlighter = stage.find('.highlighter')[0]
        highlighter.hide()
      }
    }

  }, [ draggingLine ])
  return <></>
}

import { silkSample } from './spoodawebSampleData'

const LineDragUpdater = memo(({ toggleCanDragLine, draggingLine, setObjsToUpdate, hoverBudBorder, setDraggingLine, nextObjId, setNextObjId, selected, setSelected }) => { // still a functional component
  // Object.keys().map((name) => { // ill deal with this later
  useEffect(() => {
    let lineCircle
    if (selected) {
      const line = getObjById(selected.objId)
      if (line) {
        lineCircle = line.children[selected.innerIndex]
      }
    }
    const startDragLineWrapper = e => {
      const canvasMousePos = getCanvasMousePos(e.pageX, e.pageY)
      if (!isInCanvas({x: e.pageX, y: e.pageY})) return
      const line = {...silkSample}
      line.positions = [canvasMousePos, canvasMousePos]
      line.objId = nextObjId
      setObjsToUpdate([line])
      startDragLine(e, setDraggingLine, setSelected, nextObjId, 1, toggleCanDragLine)
      setNextObjId(nextObjId+1)
    }
    const stopDragLineWrapper = e => stopDragLine(e, lineCircle)
    const dragLineWrapper = e => lineCircleMove(e, draggingLine, selected)
    const dropLine = (e) => {
      const line = getObjById(selected.objId)
      line.moveToTop()
      if (!isInCanvas({x: e.pageX, y: e.pageY})) snapLineCircleToLine(selected) 
      if (hoverBudBorder) {
        snapLine(selected)
      } else { // detaches line
        const line = getObjById(selected.objId)
        const lineCircle = line.children[selected.innerIndex]
        const attachedTo = getObjById(lineCircle.getAttr('attachedToObjId'))
        if (attachedTo) {
          const newObjs = [...attachedTo.getAttr('attachedSilkObjId')]
          newObjs.splice(attachedTo, 1)
          attachedTo.setAttr('attachedSilkObjId', newObjs)
          lineCircle.setAttr('attachedToObjId', null)
        }
      }
      setDraggingLine(false)
      setSelected()
    }
    if (toggleCanDragLine) {
      document.addEventListener('mousedown', startDragLineWrapper)
      document.addEventListener('mousemove', dragLineWrapper)
    } else {
      document.removeEventListener('mousedown', startDragLineWrapper)
      document.removeEventListener('mousemove', dragLineWrapper)
    }
    if (draggingLine) {
      document.addEventListener('mouseup', dropLine)
    }
    if (draggingLine && hoverBudBorder) {
      document.addEventListener('mouseup', stopDragLineWrapper)
    } else {
      document.removeEventListener('mouseup', stopDragLineWrapper)
    }
    return () => {
      document.removeEventListener('mousemove', dragLineWrapper)
      document.removeEventListener('mousedown', startDragLineWrapper)
      document.removeEventListener('mouseup', stopDragLineWrapper)
      document.removeEventListener('mouseup', dropLine)
    }
  }, [ toggleCanDragLine, draggingLine, selected, hoverBudBorder ])
  return (
    <></>
  )
})

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

function DrawCanvas({ rendered, setObjs, toggleCanDragLine, canvasWidth, canvasHeight }) {
  useEffect(() => {
    console.log(Konva.stages)
  }, [ canvasWidth, canvasHeight, rendered ])
  return (
    <>
      <ReactKonva.Stage
        x={0}
        y={0}
        width={canvasWidth}
        height={canvasHeight}>
        <ReactKonva.Layer>
          {rendered}
          <Shapes.BudAnchorHighlighter></Shapes.BudAnchorHighlighter>
        </ReactKonva.Layer>
      </ReactKonva.Stage>
    </>
  )
}

const canvasBorderWidth = window.screen.width / 5 // if obj in this area the expand thingy
const canvasBorderHeight = window.screen.height / 5

const expandCanvas = (objPos, rootPos, canvasWidth, canvasHeight, setCanvasWidth, setCanvasHeight) => {
  if (rootPos.y + objPos.y < (rootPos.y - canvasHeight / 2 + canvasBorderHeight)) {
    setCanvasHeight(rootPos.y - objPos.y + canvasBorderHeight)
  } else if (rootPos.x + objPos.x < (rootPos.x - canvasWidth / 2 + canvasBorderWidth)) {
    setCanvasWidth(rootPos.x - objPos.x + canvasBorderWidth)
  } else if (rootPos.y + objPos.y > (rootPos.y + canvasHeight / 2 - canvasBorderHeight)) {
    setCanvasHeight(rootPos.y + objPos.y + canvasBorderHeight)
  } else if (rootPos.x + objPos.x > (rootPos.x + canvasWidth / 2 - canvasBorderWidth)) {
    setCanvasWidth(rootPos.x + objPos.x + canvasBorderWidth)
  }
  else {
    return false
  }
  return true
}
export { expandCanvas as expandCanvas } // for unit testing

function UpdateObjs({
    objsToUpdate,
    objs,
    setDraggingLine,
    setObjs,
    setRendered,
    rendered,
    setHoverBudBorder,
    setSelected,
    setToggleCanDragLine,
    setRootPos,
    rootPos,
    canvasWidth,
    canvasHeight,
    setCanvasWidth,
    setCanvasHeight
  }) { // to add some updating of positions AND maybe index in the object itself to be specific
  useEffect(() => {
    const newRendered = [...rendered]
    for (const objId in objsToUpdate) {
      const obj = objsToUpdate[objId]
      let expand
      if (obj.type === 'bud') {
        expand = expandCanvas(obj.position, rootPos, canvasWidth, canvasHeight, setCanvasWidth, setCanvasHeight)
        newRendered.push(
          <Shapes.Bud
            x={obj.position.x}
            y={obj.position.y}
            key={newRendered.length}
            objId={obj.objId}
            setHoverBudBorder={setHoverBudBorder}
            ></Shapes.Bud>
        )
      } else if (obj.type === 'silk') {
        for (const position of obj.positions) {
          expand = expandCanvas(position, rootPos, canvasWidth, canvasHeight, setCanvasWidth, setCanvasHeight)
          if (expand) break 
        }
        newRendered.push(
          <Shapes.Silk
            points={obj.positions}
            lineCircleMove={lineCircleMove}
            key={newRendered.length}
            setDraggingLine={setDraggingLine}
            setSelected={setSelected}
            setToggleCanDragLine={setToggleCanDragLine}
            objId={obj.objId}></Shapes.Silk>
        )
      } else {
        console.warn('Error: object type not specified')
      }
      if (expand) {
        setRootPos({x: canvasWidth / 2, y: canvasHeight / 2})
      }
    }
    setRendered(newRendered)
    const newObjs = [...objs]
    newObjs.push([...objsToUpdate])
    setObjs(newObjs)
  }, [ objsToUpdate ])
  return <></>
}

function Edit() {
  const navigate = useNavigate()
  const [ dragging, setDragging ] = useState(false)
  const [ toggleCanDragLine, setToggleCanDragLine ] = useState(false)
  const [ hoverBudBorder, setHoverBudBorder ] = useState(false)
  const [ objs, setObjs ] = useState([])
  const [ objsToUpdate, setObjsToUpdate ] = useState(spoodawebData)
  const [ rendered, setRendered ] = useState([])
  const [ nextObjId, setNextObjId ] = useState(spoodawebData.length)
  const [ draggingLine, setDraggingLine ] = useState(false)
  const [ selected, setSelected ] = useState()
  const [ canvasWidth, setCanvasWidth ] = useState(window.screen.width + 2 * 2000)
  const [ canvasHeight, setCanvasHeight ] = useState(window.screen.height + 2 * 2000)
  const [ rootPos, setRootPos ] = useState({
    x: canvasWidth / 2,
    y: canvasHeight / 2
  })
  useEffect(() => {
    document.addEventListener('keydown', preventZoom)
    document.addEventListener('wheel', preventZoomScroll, { passive: false })
    return () => {
      document.removeEventListener('keydown', preventZoom)
      document.removeEventListener('wheel', preventZoomScroll)
    }
  }, [ objs, rendered ])
  return (
    <>
      <Authorizer navigate={navigate} requireAuth={true}></Authorizer>
      <MouseMoveDetector></MouseMoveDetector>
      <UpdateObjs 
      objsToUpdate={objsToUpdate}
      setRendered={setRendered}
      rendered={rendered}
      setObjs={setObjs}
      setHoverBudBorder={setHoverBudBorder}
      setSelected={setSelected}
      setDraggingLine={setDraggingLine}
      setToggleCanDragLine={setToggleCanDragLine}
      setRootPos={setRootPos}
      setCanvasHeight={setCanvasHeight}
      setCanvasWidth={setCanvasWidth}
      rootPos={rootPos}
      canvasHeight={canvasHeight}
      canvasWidth={canvasWidth}
      objs={objs}></UpdateObjs>
      <UpdateBudBorderEvt
        draggingLine={draggingLine}
        hoverBudBorder={hoverBudBorder}
        setHoverBudBorder={setHoverBudBorder}></UpdateBudBorderEvt>
      <div className={styles.wrapper}>
        <LineDragUpdater
          toggleCanDragLine={toggleCanDragLine}
          setObjsToUpdate={setObjsToUpdate}
          nextObjId={nextObjId}
          setDraggingLine={setDraggingLine}
          setNextObjId={setNextObjId}
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