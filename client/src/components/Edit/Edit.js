import React, { memo, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../Shared/Authorizer'
import styles from './edit.module'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faObjectGroup, faLinesLeaning } from '@fortawesome/free-solid-svg-icons'

import { preventZoom, preventZoomScroll } from './PreventDefault'
import { mouseDown, mouseUp, mouseMove } from './Events'
import { getCanvasMousePos, isInCanvas, getHexagonLines, hexagonPoints, drawHexagon, snapToPreview } from './HelperFuncs'
import FakeDraggableObj from './FakeDraggableObj'
import * as shapes from './Shapes'

import spoodawebData from './TestingSpoodawebData'

import Konva from 'konva'
import * as ReactKonva from 'react-konva'

Konva.hitOnDragEnabled = true

const gridLink = "http://phrogz.net/tmp/grid.gif"

function lineCircleMove(e, draggingLine, selected) {
  if (isInCanvas({x: e.pageX, y: e.pageY}) && draggingLine) {
    const mousePos = {x: e.pageX, y: e.pageY}
    const canvasMousePos = getCanvasMousePos(mousePos.x, mousePos.y)
    const mainLayer = Konva.stages[0].children[0]
    const lineGroup = mainLayer.children[selected.layerIndex].children
    const start = lineGroup[selected.innerIndex]
    updateLinePos(start, canvasMousePos.x, canvasMousePos.y)
  }
}



/*

TO DO
finish the complete elimination of the mainLayer react state
change konva to react-konva
change normal functions to () => {} syntax and react functions to function syntax
change all stage variables to Konva.stages[0] and remove mainLayer react state
add saving ability
*/

function startDrag(e, setDraggingLine, setSelected) {
  console.log(e.pageX, e.pageY)
  if (e.button === 0 && isInCanvas({x: e.pageX, y: e.pageY})) {
    const canvasMousePos = getCanvasMousePos(e.pageX, e.pageY)
    console.log('dragged line')
    setDraggingLine(true)
    const line = drawLine(
      [canvasMousePos, canvasMousePos],
      evt => lineCircleMove(evt.evt, true, {"layerIndex": evt.target.parent.index, "innerIndex": evt.target.index}),
      evt => {
        const line = evt.target
        const lineGroup = line.parent.children
        const points = line.getPoints()
        const start = lineGroup[1]
        const end = lineGroup[2]
        const lineTransform = line.getAbsoluteTransform()
        const newStart = lineTransform.point({x: points[0], y: points[1]})
        const newEnd = lineTransform.point({x: points[2], y: points[3]})
        start.setX(newStart.x)
        start.setY(newStart.y)
        end.setX(newEnd.x)
        end.setY(newEnd.y)
      },
      evt => {
        const line = evt.target
        const points = line.getPoints()
      },
      setDraggingLine
    )
    const mainLayer = Konva.stages[0].children[0]
    mainLayer.add(line)
    mainLayer.draw()
    setSelected({"layerIndex": line.index, "innerIndex": 1})
  }
}

function UpdateBudBorderEvt({ draggingLine }) {
  useEffect(() => {
    const stage = Konva.stages[0]
    if (!stage) return
    const buds = stage.find('.bud')
    const highlighter = stage.find('.highlighter')[0]
    if (draggingLine) {
      for (const budIndex in buds) { // to change this cause performance issues
        const bud = buds[budIndex]
        const hitGroup = bud.children[1]
        const hitAreas = hitGroup.children
        for (const hitAreaIndex in hitAreas) {
          const hitArea = hitAreas[hitAreaIndex]
          hitArea.on('mousemove', snapToPreview)
        }
        hitGroup.on('mouseenter', (evt) => { // TODO: stop listening and unlistening to events
          const stage = evt.target.parent.parent.parent.parent
          const highlighter = stage.find('.highlighter')[0]
          highlighter.show()
        })
        hitGroup.on('mouseleave', (evt) => {
          const stage = evt.target.parent.parent.parent.parent
          const highlighter = stage.find('.highlighter')[0]
          highlighter.hide()
        })
      }
    } else {
      for (const budIndex in buds) {
        const bud = buds[budIndex]
        const hitGroup = bud.children[1]
        const hitAreas = hitGroup.children
        for (const hitAreaIndex in hitAreas) {
          const hitArea = hitAreas[hitAreaIndex]
          hitArea.off('mousemove')
        }
        hitGroup.off('mouseenter')
        hitGroup.off('mouseleave')
      }
    }

  }, [draggingLine])
  return <></>
}

const Select = memo(function Select({ mainLayer, toggleCanDragLine }) {
  const [ draggingLine, setDraggingLine ] = useState(false)
  const [ selected, setSelected ] = useState()
  // Object.keys().map((name) => { // ill deal with this later
  useEffect(() => {
    let lineCircle
    if (selected) {
      const stage = Konva.stages[0]
      const line = stage.children[0].children[selected.layerIndex]
      lineCircle = line.children[selected.innerIndex]
    }
    const startDragWrapper = e => startDrag(e, setDraggingLine, setSelected)
    const stopDragWrapper = e => stopDrag(e, () => {
      setDraggingLine(false)
      setSelected()
    },
    lineCircle)
    const dragLineWrapper = e => lineCircleMove(e, draggingLine, selected, mainLayer)
    if (toggleCanDragLine) {
      document.addEventListener('mousemove', dragLineWrapper)
      document.addEventListener('mousedown', startDragWrapper)
      document.addEventListener('mouseup', stopDragWrapper)
    }
    return () => {
      document.removeEventListener('mousemove', dragLineWrapper)
      document.removeEventListener('mousedown', startDragWrapper)
      document.removeEventListener('mouseup', stopDragWrapper)
    }
  }, [toggleCanDragLine, draggingLine, selected])
  return (
    <>
      <UpdateBudBorderEvt draggingLine={draggingLine} mainLayer={mainLayer}></UpdateBudBorderEvt>
    </>
  )
})

function ObjectDrawer({ setDragging, toggleCanDragLine, setToggleCanDragLine }) {
  const items = {
    test: [
      {
        func: () => setDragging(true),
        icon: <FontAwesomeIcon icon={faObjectGroup}></FontAwesomeIcon>
      },
      {
        func: () => setToggleCanDragLine(true),
        icon: <FontAwesomeIcon icon={faLinesLeaning}></FontAwesomeIcon>
      }
    ]
  }
  return (
    <>
      <div className={styles.objectDrawer}>
        <div className={styles.box}>
          <div className={styles.obj}>
            <p>test</p>
            <button className={styles.drawerButton} onMouseDown={() => setDragging(true)}>
              <FontAwesomeIcon icon={faObjectGroup}></FontAwesomeIcon>
            </button>
            <button className={toggleCanDragLine ? styles.darkenedDrawerButton : styles.drawerButton} onMouseDown={() => setToggleCanDragLine(!toggleCanDragLine)}>
              <FontAwesomeIcon icon={faLinesLeaning}></FontAwesomeIcon>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function drop(e, dragging, mainLayer, setHoverBudBorder, toggleCanDragLine) {
  // console.log(isMouseHoverCanvas)
  // if (!isMouseHoverCanvas) return
  if (dragging && isInCanvas({x: e.pageX, y: e.pageY})) {
    console.log('placed!')
    // e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft, e.pageY - 40 + divCanvas.scrollTop
    const canvasMousePos = getCanvasMousePos(e.pageX, e.pageY)
    const bud = Bud(canvasMousePos.x, canvasMousePos.y, setHoverBudBorder)
    mainLayer.add(bud)
    mainLayer.draw()
  }
}

function DetectMouseMove () {
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

function DrawCanvas({ rendered, setObjs, setHoverBudBorder, toggleCanDragLine }) {
  useEffect(() => {
    document.addEventListener('wheel', preventZoomScroll)
    /*
    let index = -1
    for (const name in spoodawebData) {
      const bud = Bud(spoodawebData[name].position.x, spoodawebData[name].position.y, setHoverBudBorder, toggleCanDragLine)
      mainLayer.add(bud)
    }
    */
   console.log(rendered)
   return () => {
    document.removeEventListener('wheel', preventZoomScroll)
   }
  })
  return (
    <ReactKonva.Stage
      x={0}
      y={0}
      width={window.innerWidth + 2 * 2000}
      height={window.innerHeight + 2 * 2000}>
      <ReactKonva.Layer>
        {rendered}
      </ReactKonva.Layer>
    </ReactKonva.Stage>
  )
}

function UpdateObjs({ objs, setRendered, rendered }) {
  useEffect(() => {
    console.log('how')
    const newRendered = [...rendered]
    for (const objName in objs) {
      const obj = objs[objName]
      if (obj.type === 'bud') {
        newRendered.push(
          <shapes.Bud
            x={obj.position.x}
            y={obj.position.y}
            key={newRendered.length}></shapes.Bud>
        )
      }      
    }
    setRendered(newRendered)
  }, [objs])
  return <></>
}

function Edit() {
  const navigate = useNavigate()
  const [ dragging, setDragging ] = useState(false)
  const [ toggleCanDragLine, setToggleCanDragLine ] = useState(false)
  const [ hoverBudBorder, setHoverBudBorder ] = useState(false)
  const [ objs, setObjs ] = useState(spoodawebData)
  const [ rendered, setRendered ] = useState([])
  useEffect(() => {
    document.addEventListener('keydown', preventZoom)
    document.addEventListener('wheel', preventZoomScroll, { passive: false })
    console.log(rendered)
    return () => {
      document.removeEventListener('keydown', preventZoom)
      document.removeEventListener('wheel', preventZoomScroll)
    }
  }, [ objs, rendered ])
  return (
    <>
      <Authorizer navigate={navigate} requireAuth={true}></Authorizer>
      <DetectMouseMove></DetectMouseMove>
      <div className={styles.wrapper}>
        <Select toggleCanDragLine={toggleCanDragLine}></Select>
        <div className={styles.divCanvas} id='divCanvas'>
          <DrawCanvas
          rendered={rendered}
          setObjs={setObjs}
          setHoverBudBorder={setHoverBudBorder}
          toggleCanDragLine={toggleCanDragLine}></DrawCanvas>
        </div>
      </div>
      <UpdateObjs 
      objs={objs}
      setRendered={setRendered}
      rendered={rendered}></UpdateObjs>
    </>
  )
}
export default Edit

/*

<ObjectDrawer setDragging={setDragging}
  toggleCanDragLine={toggleCanDragLine}
  setToggleCanDragLine={setToggleCanDragLine}
  mousePos={mousePos}></ObjectDrawer>
<FakeDraggableObj
  dragging={dragging}
  mousePos={mousePos}
  setHoverBudBorder={setHoverBudBorder}
  toggleCanDragLine={toggleCanDragLine}
  drop={drop}></FakeDraggableObj>

*/