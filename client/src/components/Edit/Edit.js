import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../Shared/Authorizer'
import styles from './edit.module'
import { Stage, Layer, RegularPolygon, Line } from 'react-konva'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faObjectGroup, faLinesLeaning } from '@fortawesome/free-solid-svg-icons'
import Hexagon from 'react-svg-hexagon'
import { preventZoom, preventZoomScroll } from './PreventDefault'
import { mouseDown, mouseUp, mouseMove } from './Events'

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

function newObj(objs, setObjs, obj, refs, setRefs, ref) {
  const budsCopy = [...objs]
  budsCopy.push(obj)
  setObjs(budsCopy)
  console.log(objs)
}

function Bud({ x, y }) {
  return (
    <RegularPolygon
      x={x}
      y={y}
      sides={6}
      radius={40}
      fill='#00D2FF'
      stroke='black'
      strokeWidth={1}
      draggable={true}></RegularPolygon>
  )
}

function drawLineOnMouseDown(e) {
  console.log(e)
  const mousePos = getCanvasMousePos({x: e.evt.pageX, y: e.evt.pageY})
  // e.target.attrs.points = [mousePos.x, mousePos.y, mousePos.x+100, mousePos.y+100]
  const points = e.target.attrs.points
  console.log(points[0]-15, points[1]-15, points[0]+15, points[1]+15)
  console.log(mousePos)
  const inStart = withinRect(mousePos, points[0]-15, points[1]-15, points[0]+15, points[1]+15)
  console.log('start', inStart)
  const inEnd = withinRect(mousePos, points[2]-15, points[3]-15, points[2]+15, points[3]+15)
  console.log('end', inEnd)
}

function DrawLine({ points }) { // why does this rerender so much lol
  return (
    <>
      <Line
        points={[points[0].x, points[0].y, points[1].x, points[1].y]}
        stroke='black'
        strokeWidth={1}
        onMouseDown={drawLineOnMouseDown}
        draggable={true}
        hitStrokeWidth={30}>
      </Line>
    </>
  )
}

function Select({ mousePos, toggle, id, objs, setObjs, rootPoint, draggingLine, refObjs }) {
  useEffect(() => {
    if (toggle && draggingLine) {
      const canvasMousePos = getCanvasMousePos(mousePos)
      refObjs[id].attrs.points = [rootPoint.x, rootPoint.y, canvasMousePos.x, canvasMousePos.y]
      console.log(refObjs[id].attrs.points)
    }
  }, [mousePos]) 
  return <></>
}

function dragLine(e, objs, setObjs, mousePos, setDraggingLine, setId, setRootPoint) {
  if (e.button === 0 && isInCanvas(mousePos)) {
    console.log('dragged line')
    console.log(objs)
    setDraggingLine(true)
    setId(objs.length)
    setRootPoint(getCanvasMousePos(mousePos))
    newObj(objs, setObjs, (
      <DrawLine points={[
        getCanvasMousePos(mousePos),
        getCanvasMousePos(mousePos)
      ]}
      key={objs.length}></DrawLine>
    ))
  }
}

function undragLine(e, objs, setObjs, mousePos, setDraggingLine, setId) {
  if (e.button === 0) {
    console.log('no')
    setDraggingLine(false)
  }
}

function ObjectDrawer({ objs, setObjs, setDragging, toggle, setToggle, mousePos, refObjs }) { // pls move the whole line drag thing to another component
  const [ draggingLine, setDraggingLine ] = useState(false)
  const [ rootPoint, setRootPoint ] = useState()
  const [ id, setId ] = useState()
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
  // Object.keys().map((name) => { // ill deal with this later
  useEffect(() => {
    const dragLineWrapper = (e) => dragLine(e, objs, setObjs, mousePos, setDraggingLine, setId, setRootPoint)
    const undragLineWrapper = (e) => undragLine(e, objs, setObjs, mousePos, setDraggingLine, setId)
    if (toggle) {
      document.addEventListener('mousedown', dragLineWrapper)
      document.addEventListener('mouseup', undragLineWrapper)
    }
    return () => {
      document.removeEventListener('mousedown', dragLineWrapper)
      document.removeEventListener('mouseup', undragLineWrapper)
    }
  }, [toggle, objs, mousePos])
  return (
    <>
      <Select mousePos={mousePos} toggle={toggle} id={id} objs={objs} rootPoint={rootPoint} setObjs={setObjs} draggingLine={draggingLine} refObjs={refObjs}></Select>
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

function DrawCanvas({ objs, setObjs, setRefObjs, refObjs }) {
  useEffect(() => {
    document.addEventListener('wheel', preventZoomScroll)
    let index = -1
    const leBuds = Object.keys(spoodawebData).map((name) => {
      index += 1
      return <Bud key={index} x={spoodawebData[name].position.x} y={spoodawebData[name].position.y}></Bud>
    })
    setObjs(leBuds)
  }, [])
  console.log(objs[2])
  return (
    <Stage
      x={0}
      y={0}
      width={window.innerWidth + 2 * 2000}
      height={window.innerHeight + 2 * 2000}
      onMouseMove={e => {
        if (e.target.children) {
          setRefObjs(e.target.children[0].children)
        }
      }}>
      <Layer>
        {objs}
      </Layer>
    </Stage>
  )
}

function drop(e, dragging, objs, setObjs) {
  // console.log(isMouseHoverCanvas)
  // if (!isMouseHoverCanvas) return
  if (dragging) {
    // e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft, e.pageY - 40 + divCanvas.scrollTop
    newObj(objs, setObjs, (
      <Bud key={objs.length} x={e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft} y={e.pageY - 40 + divCanvas.scrollTop}></Bud>
    ))
    console.log(objs)
  }
}

function Edit() {
  const navigate = useNavigate()
  const [ middleMouseDown, setMiddleMouseDown ] = useState(false)
  const [ dragging, setDragging ] = useState(false)
  const [ objs, setObjs ] = useState([]) // react objects
  const [ refObjs, setRefObjs ] = useState([]) // konva js objects
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
    const mouseMoveWrapper = (e) => {
      mouseMove(e, middleMouseDown, mousePos, setMousePos)
    }
    document.addEventListener('keydown', preventZoom)
    document.addEventListener('mousedown', mouseDownWrapper)
    document.addEventListener('wheel', preventZoomScroll, { passive: false })
    document.addEventListener('mouseup', mouseUpWrapper)
    document.addEventListener('mousemove', mouseMoveWrapper)
    return () => {
      document.removeEventListener('keydown', preventZoom)
      // document.getElementsByClassName('konvajs-content')[0].removeEventListener('wheel', preventZoomScroll)
      document.removeEventListener('wheel', preventZoomScroll)
      document.removeEventListener('mousedown', mouseDownWrapper)
      document.removeEventListener('mouseup', mouseUpWrapper)
      document.removeEventListener('mousemove', mouseMoveWrapper)
    }
  }, [middleMouseDown, mousePos])
  return (
    <>
      <Authorizer navigate={navigate} requireAuth={true}></Authorizer>
      <div className={styles.wrapper}>
        <ObjectDrawer setDragging={setDragging} objs={objs} setObjs={setObjs} refObjs={refObjs} toggle={toggle} setToggle={setToggle} mousePos={mousePos}></ObjectDrawer>
        <FakeDraggableObj
          dragging={dragging}
          setDragging={setDragging}
          mousePos={mousePos}
          objs={objs}
          setObjs={setObjs}
          useState={useState}
          useEffect={useEffect}></FakeDraggableObj>
        <div className={styles.divCanvas} id='divCanvas'>
          <DrawCanvas objs={objs} setObjs={setObjs} setRefObjs={setRefObjs} refObjs={refObjs}></DrawCanvas>
        </div>
      </div>
    </>
  )
}
export default Edit