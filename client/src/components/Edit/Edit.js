import React, { memo, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../Shared/Authorizer'
import styles from './edit.module'

import { preventZoom, preventZoomScroll } from './PreventDefault'
import { mouseDown, mouseUp, mouseMove } from './Events'
import { stopDragLine, startDragLine, snapToPreview, lineCircleMove, getObjById, getKonvaObjs, getStage, updateLinePos, snapLine } from './HelperFuncs'
import * as OtherElements from './OtherElements'
import * as Shapes from './Shapes'

import spoodawebData from './TestingSpoodawebData'

import Konva from 'konva'
import * as ReactKonva from 'react-konva'

Konva.hitOnDragEnabled = true

const gridLink = "http://phrogz.net/tmp/grid.gif"

/*

TO DO
finish the complete elimination of the mainLayer react state
change konva to react-konva
change normal functions to () => {} syntax and react functions to function syntax
change all stage variables to Konva.stages[0] and remove mainLayer react state
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
    const startDragLineWrapper = e => startDragLine(e, setDraggingLine, setSelected, setObjsToUpdate, nextObjId, setNextObjId)
    const stopDragLineWrapper = e => stopDragLine(e, lineCircle)
    const dragLineWrapper = e => lineCircleMove(e, draggingLine, selected)
    const dropLine = () => {
      console.log('dropped line')
      const line = getObjById(selected.objId)
      line.moveToTop()
      if (hoverBudBorder) snapLine(selected) 
      setDraggingLine(false)
      setSelected()
    }
    console.log(draggingLine)
    if (toggleCanDragLine) {
      document.addEventListener('mousedown', startDragLineWrapper)
    } else {
      document.removeEventListener('mousedown', startDragLineWrapper)
    }
    if (toggleCanDragLine) {
      document.addEventListener('mousemove', dragLineWrapper)
    } else {
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

function DrawCanvas({ rendered, setObjs, toggleCanDragLine }) {
  useEffect(() => {
    /*
    let index = -1
    for (const name in spoodawebData) {
      const bud = Bud(spoodawebData[name].position.x, spoodawebData[name].position.y, setHoverBudBorder, toggleCanDragLine)
      mainLayer.add(bud)
    }
    */
   console.log(rendered)
  }, [])
  return (
    <ReactKonva.Stage
      x={0}
      y={0}
      width={window.innerWidth + 2 * 2000}
      height={window.innerHeight + 2 * 2000}>
      <ReactKonva.Layer>
        {rendered}
        <Shapes.BudAnchorHighlighter></Shapes.BudAnchorHighlighter>
      </ReactKonva.Layer>
    </ReactKonva.Stage>
  )
}



function UpdateObjs({ objsToUpdate, objs, setDraggingLine, setObjs, setRendered, rendered, setHoverBudBorder, setSelected }) { // to add some updating of positions AND maybe index in the object itself to be specific
  useEffect(() => {
    console.log('how')
    const newRendered = [...rendered]
    for (const objId in objsToUpdate) {
      const obj = objsToUpdate[objId]
      if (obj.type === 'bud') {
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
        newRendered.push(
          <Shapes.Silk
            points={obj.positions}
            lineCircleMove={lineCircleMove}
            key={newRendered.length}
            setDraggingLine={setDraggingLine}
            setSelected={setSelected}
            objId={obj.objId}></Shapes.Silk>
        )
      } else {
        console.warn('Error: object type not specified')
      }
    }
    setRendered(newRendered)
    const newObjs = [...objs]
    newObjs.push([...objsToUpdate])
    setObjs(newObjs)
    console.log(Konva.stages[0])
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
          toggleCanDragLine={toggleCanDragLine}></DrawCanvas>
        </div>
      </div>
    </>
  )
}
export default Edit