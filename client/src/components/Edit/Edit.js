import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../Shared/Authorizer'
import styles from './edit.module'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faObjectGroup, faLinesLeaning } from '@fortawesome/free-solid-svg-icons'
import Hexagon from 'react-svg-hexagon'
import { preventZoom, preventZoomScroll } from './PreventDefault'
import { mouseDown, mouseUp, mouseMove } from './Events'
import Konva from 'konva'

const gridLink = "http://phrogz.net/tmp/grid.gif"

const spoodawebData = {
  "a test": {
    "pronounciation": "pronounciation test",
    "contexts": [
        "this is a context for testing",
        "this is the second context"
    ],
    "examples": [
        [
            "does this link up with the context???",
            "does this too?"
        ],
        [
            "this should go to the second context"
        ]
    ],
    "links": {
        "1": 0.1,
        "2": 1,
        "3": 0.65
    },
    "position": {
      "x": 100,
      "y": 50
    }
  },
  "gay": {
    "pronounciation": "pronounciation test",
    "contexts": [
        "this is a context for testing",
        "this is the second context"
    ],
    "examples": [
        [
            "does this link up with the context???",
            "does this too?"
        ],
        [
            "this should go to the second context"
        ]
    ],
    "links": {
        "1": 0.1,
        "2": 1,
        "3": 0.65
    },
    "position": {
      "x": 200,
      "y": 120
    }
  }
}

/*
To do:
1. Touch up silk DONE
2. Add ability for silk to be able to be dragged after placement
3. optimise the whole thing
  Probably should have state of refs to all objects for ease of access
4. Add ability for silk to be glued onto a bud or other silk
5. add saving ability
*/

function getCanvasMousePos(mousePos) {
  return {x: mousePos.x - window.innerWidth * 0.15 + divCanvas.scrollLeft, y: mousePos.y - 40 + divCanvas.scrollTop}
}

function withinRect(mousePos, startX, startY, endX, endY) {
  const x = mousePos.x
  const y = mousePos.y
  const xStartIn = x > startX
  const yStartIn = y > startY
  const xEndIn = x < endX
  const yEndIn = y < endY
  if (xStartIn && yStartIn && xEndIn && yEndIn) {
    return true
  }
  return false
}

function isInCanvas(mousePos) {
  const startX = window.innerWidth * 0.15
  const startY = 0
  const endX = window.innerWidth
  const endY = window.innerHeight
  return withinRect(mousePos, startX, startY, endX, endY)
}

function Bud({ x, y }) {
  const bud = new Konva.RegularPolygon({
    x: x,
    y: y,
    sides: 6,
    radius: 40,
    fill: '#00D2FF',
    stroke: 'black',
    strokeWidth: 1,
    draggable: true
  })
  return bud
}

function lineCircleMove(e, draggingLine, selected, mainLayer) {
  if (isInCanvas({x: e.pageX, y: e.pageY}) && draggingLine) {
    const mousePos = {x: e.pageX, y: e.pageY}
    const canvasMousePos = getCanvasMousePos(mousePos)
    const lineGroup = mainLayer.children[selected.layerIndex].children
    const start = lineGroup[selected.innerIndex]
    const end = lineGroup[Math.abs(selected.innerIndex-1)]
    const line = lineGroup[2]
    // console.log(newStart)
    start.setX(canvasMousePos.x)
    start.setY(canvasMousePos.y)
    // line.setPoints([newStart.x, newStart.y, newEnd.x, newEnd.y])
    const lineTransform = line.getAbsoluteTransform()
    lineTransform.m = [1, 0, 0, 1, 0, 0]
    console.log(lineTransform.m)
    const newStart = lineTransform.point({x: canvasMousePos.x, y: canvasMousePos.y})
    const newEnd = lineTransform.point({x: end.getX(), y: end.getY()})
    line.setPoints([newStart.x, newStart.y, newEnd.x, newEnd.y])
  }
}

function Circle(points, dragmoveFunc) {
  const circle = new Konva.Circle({
    radius: 30,
    x: points[0].x,
    y: points[0].y,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 4,
    draggable: true
  })
  circle.on('dragmove', dragmoveFunc)
  return circle
}

function drawLine(points, circleDragmoveFunc, lineDragmoveFunc, lineDragendFunc) {
  const group = new Konva.Group()
  const circleStart = Circle(points, circleDragmoveFunc)
  const circleEnd = Circle(points, circleDragmoveFunc)
  const line = new Konva.Line({
    points: [points[0].x, points[0].y, points[1].x, points[1].y],
    stroke: 'black',
    strokeWidth: 1,
    hitStrokeWidth: 30,
    draggable: true,
  })
  line.on('dragmove', lineDragmoveFunc)
  line.on('dragend', lineDragendFunc)
  group.add(circleStart, circleEnd, line)
  return group
}

function startDrag(e, mousePos, draggingLine, setDraggingLine, selected, setSelected, mainLayer) {
  if (e.button === 0 && isInCanvas(mousePos)) {
    const canvasMousePos = getCanvasMousePos(mousePos)
    console.log('dragged line')
    setDraggingLine(true)
    const line = drawLine(
      [canvasMousePos, canvasMousePos],
      evt => lineCircleMove(evt.evt, true, {"layerIndex": evt.target.parent.index, "innerIndex": evt.target.index}, mainLayer),
      evt => {
        const line = evt.target
        const lineGroup = line.parent.children
        const points = line.getPoints()
        const start = lineGroup[0]
        const end = lineGroup[1]
        const lineTransform = line.getAbsoluteTransform()
        const newStart = lineTransform.point({x: points[0], y: points[1]})
        const newEnd = lineTransform.point({x: points[2], y: points[3]})
        start.setX(newStart.x)
        start.setY(newStart.y)
        end.setX(newEnd.x)
        end.setY(newEnd.y)
        console.log(lineTransform.m)
      },
      evt => {
        const line = evt.target
        const points = line.getPoints()
        console.log(points)
      }
    )
    mainLayer.add(line)
    mainLayer.draw()
    setSelected({"layerIndex": line.index, "innerIndex": 0})
  }
}

function stopDrag(e, mousePos, setDraggingLine, setSelected) {
  if (e.button === 0) {
    console.log('no')
    setDraggingLine(false)
    setSelected()
  }
}

function Select({ mousePos, mainLayer, toggle }) {
  const [ draggingLine, setDraggingLine ] = useState(false)
  const [ selected, setSelected ] = useState()
  // Object.keys().map((name) => { // ill deal with this later
  useEffect(() => {
    const startDragWrapper = e => startDrag(e, mousePos, draggingLine, setDraggingLine, selected, setSelected, mainLayer)
    const stopDragWrapper = e => stopDrag(e, mousePos, setDraggingLine, setSelected)
    const dragLineWrapper = e => lineCircleMove(e, draggingLine, selected, mainLayer)
    if (toggle) {
      document.addEventListener('mousemove', dragLineWrapper)
      document.addEventListener('mousedown', startDragWrapper)
      document.addEventListener('mouseup', stopDragWrapper)
    }
    return () => {
      document.removeEventListener('mousemove', dragLineWrapper)
      document.removeEventListener('mousedown', startDragWrapper)
      document.removeEventListener('mouseup', stopDragWrapper)
    }
  }, [toggle, mousePos])
  return <></>
}

function ObjectDrawer({ setDragging, toggle, setToggle }) {
  const items = {
    test: [
      {
        func: () => setDragging(true),
        icon: <FontAwesomeIcon icon={faObjectGroup}></FontAwesomeIcon>
      },
      {
        func: () => setToggle(true),
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
            <button className={toggle ? styles.darkenedDrawerButton : styles.drawerButton} onMouseDown={() => setToggle(!toggle)}>
              <FontAwesomeIcon icon={faLinesLeaning}></FontAwesomeIcon>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function drop(e, dragging) {
  // console.log(isMouseHoverCanvas)
  // if (!isMouseHoverCanvas) return
  if (dragging) {
    // e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft, e.pageY - 40 + divCanvas.scrollTop
    Bud({x: e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft, y: e.pageY - 40 + divCanvas.scrollTop})
  }
}

function FakeDraggableObj({ dragging, mousePos, objs, setObjs, isMouseHoverCanvas }) {
  const x = mousePos.x
  const y = mousePos.y
  useEffect(() => {
    const dropWrapper = (e) => drop(e, dragging, objs, setObjs, isMouseHoverCanvas, Bud)
    document.addEventListener('mouseup', dropWrapper)
    console.log('rendered')
    return () => {
      console.log('unrendered')
      document.removeEventListener('mouseup', dropWrapper)
    }
  }, [dragging])
  return (
    <div style={{'top': y-32, 'left': x-34}} className={dragging ? styles.fakeDraggableObj : styles.none} id='fakeDraggableObj'>
      <Hexagon height="80" fill='#00D2FF' stroke='black' strokeWidth='1' ></Hexagon> 
    </div>
  )
}

function DrawCanvas({ setMainLayer }) {
  useEffect(() => {
    document.addEventListener('wheel', preventZoomScroll)
    let index = -1
    const leBuds = Object.keys(spoodawebData).map((name) => {
      index += 1
      return <Bud key={index} x={spoodawebData[name].position.x} y={spoodawebData[name].position.y}></Bud>
    })
    const divCanvas = document.getElementById('divCanvas')
    const stage = new Konva.Stage({
      container: divCanvas,
      x: 0,
      y: 0,
      width: window.innerWidth + 2 * 2000,
      height: window.innerHeight + 2 * 2000
    })
    const mainLayer = new Konva.Layer()
    for (const name in spoodawebData) {
      const bud = Bud(spoodawebData[name].position)
      mainLayer.add(bud)
    }
    stage.add(mainLayer)
    mainLayer.draw()
    console.log(mainLayer)
    setMainLayer(mainLayer)
  }, [])
  /*
  for stage
  
  */
  return (
    <></>
  )
}

function Edit() {
  const navigate = useNavigate()
  const [ middleMouseDown, setMiddleMouseDown ] = useState(false)
  const [ dragging, setDragging ] = useState(false)
  const [ mainLayer, setMainLayer ] = useState()
  const [ toggle, setToggle ] = useState(false)
  const [ mousePos, setMousePos ] = useState({
    x: null,
    y: null
  })
  useEffect(() => {
    const mouseDownWrapper = (e) => {
      mouseDown(e, setMiddleMouseDown)
    }
    const mouseUpWrapper = (e) => {
      mouseUp(e, setMiddleMouseDown, setDragging)
    }
    const mousePosWrapper = (e) => {
      mouseMove(e, middleMouseDown, mousePos, setMousePos)
    }
    document.addEventListener('keydown', preventZoom)
    document.addEventListener('mousedown', mouseDownWrapper)
    document.addEventListener('wheel', preventZoomScroll, { passive: false })
    document.addEventListener('mouseup', mouseUpWrapper)
    document.addEventListener('mousemove', mousePosWrapper)
    
    return () => {
      document.removeEventListener('keydown', preventZoom)
      // document.getElementsByClassName('konvajs-content')[0].removeEventListener('wheel', preventZoomScroll)
      document.removeEventListener('wheel', preventZoomScroll)
      document.removeEventListener('mousedown', mouseDownWrapper)
      document.removeEventListener('mouseup', mouseUpWrapper)
      document.removeEventListener('mousemove', mousePosWrapper)
    }
  }, [middleMouseDown, mousePos])
  return (
    <>
      <Authorizer navigate={navigate} requireAuth={true}></Authorizer>
      <div className={styles.wrapper}>
        <ObjectDrawer setDragging={setDragging} toggle={toggle} setToggle={setToggle} mousePos={mousePos}></ObjectDrawer>
        <FakeDraggableObj
          dragging={dragging}
          setDragging={setDragging}
          mousePos={mousePos}></FakeDraggableObj>
        <Select mousePos={mousePos} mainLayer={mainLayer} toggle={toggle}></Select>
        <div className={styles.divCanvas} id='divCanvas'>
          <DrawCanvas setMainLayer={setMainLayer}></DrawCanvas>
        </div>
      </div>
    </>
  )
}
export default Edit