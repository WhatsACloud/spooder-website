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
1. Touch up silk
2. Add ability for silk to be glued onto a bud or other silk
3. optimise the whole thing
4. add saving ability
*/

function getCanvasMousePos(mousePos) {
  console.log(divCanvas.scrollLeft)
  return {x: mousePos.x - window.innerWidth * 0.15 + divCanvas.scrollLeft, y: mousePos.y - 40 + divCanvas.scrollTop}
}

function newObj(objs, setObjs, obj, refs, setRefs, ref) {
  const budsCopy = [...objs]
  budsCopy.push(obj)
  console.log('newObj')
  console.log(budsCopy)
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

function DrawLine({ points }) { // why does this rerender so much lol
  return (
    <Line
      points={[points[0].x, points[0].y, points[1].x, points[1].y]}
      stroke='black'
      strokeWidth={1}>
    </Line>
  )
}

function Select({ mousePos, toggle, id, objs, setObjs, rootPoint, draggingLine }) {
  useEffect(() => {
    if (toggle && draggingLine) {
      const newObjs = [...objs]
      newObjs[id] = (
        <DrawLine points={[
          rootPoint,
          getCanvasMousePos(mousePos)
        ]}
        key={objs.length}></DrawLine>
      )
      setObjs(newObjs)
    }
  }, [mousePos]) 
  return <></>
}

function dragLine(e, objs, setObjs, mousePos, setDraggingLine, setId, setRootPoint) {
  if (e.button === 0) {
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

function ObjectDrawer({ objs, setObjs, setDragging, toggle, setToggle, mousePos }) { // pls move the whole line drag thing to another component
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
    console.log(mousePos)
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
      <Select mousePos={mousePos} toggle={toggle} id={id} objs={objs} rootPoint={rootPoint} setObjs={setObjs} draggingLine={draggingLine}></Select>
      <div className={styles.objectDrawer}>
        <div className={styles.box}>
          <div className={styles.obj}>
            <p>test</p>
            <button className={styles.drawerButton} onMouseDown={() => setDragging(true)}>
              <FontAwesomeIcon icon={faObjectGroup}></FontAwesomeIcon>
            </button>
            <button className={styles.drawerButton} onMouseDown={() => setToggle(!toggle)}>
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

function DrawCanvas({ objs, setObjs }) {
  useEffect(() => {
    document.addEventListener('wheel', preventZoomScroll)
    let index = -1
    const leBuds = Object.keys(spoodawebData).map((name) => {
      index += 1
      return <Bud key={index} x={spoodawebData[name].position.x} y={spoodawebData[name].position.y}></Bud>
    })
    console.log(leBuds)
    setObjs(leBuds)
  }, [])
  return (
    <Stage
      x={0}
      y={0}
      width={window.innerWidth + 2 * 2000}
      height={window.innerHeight + 2 * 2000}>
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
  const [ objs, setObjs ] = useState([])
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
        <ObjectDrawer setDragging={setDragging} objs={objs} setObjs={setObjs} toggle={toggle} setToggle={setToggle} mousePos={mousePos}></ObjectDrawer>
        <FakeDraggableObj
          dragging={dragging}
          setDragging={setDragging}
          mousePos={mousePos}
          objs={objs}
          setObjs={setObjs}
          useState={useState}
          useEffect={useEffect}></FakeDraggableObj>
        <div className={styles.divCanvas} id='divCanvas'>
          <DrawCanvas objs={objs} setObjs={setObjs}></DrawCanvas>
        </div>
      </div>
    </>
  )
}
export default Edit