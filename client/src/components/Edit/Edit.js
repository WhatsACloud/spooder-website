import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../Shared/Authorizer'
import styles from './edit.module'
import { Stage, Layer, RegularPolygon } from 'react-konva'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins, faObjectGroup } from '@fortawesome/free-solid-svg-icons'
import Hexagon from 'react-svg-hexagon'

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

const preventZoomKeys = {
  "=": true,
  "+": true,
  "-": true,
  "_": true
}

const preventZoom = e => {
  if (e.ctrlKey === true && (preventZoomKeys[e.key])) {
    console.log('success')
    e.preventDefault()
  }
}

const preventZoomScroll = e => {
  console.log(e)
  if (e.ctrlKey) {
    e.preventDefault()
  }
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

function ObjectDrawer({ objs, setDragging, buds, setBuds }) {
  const createBud = (e) => { // e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft, e.pageY - 40 + divCanvas.scrollTop
    setDragging(true)
    console.log(buds)
    if (buds) {
      const budsCopy = [...buds]
      console.log('hey')
      budsCopy.push(
        <Bud
          key={buds.length}
          x={e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft}
          y={e.pageY - 40 + divCanvas.scrollTop}></Bud>
      )
      setBuds(budsCopy)
    }
  }
  return (
    <div className={styles.objectDrawer}>
      <div className={styles.box}>
        <div className={styles.obj}>
          <p>test</p>
          <button className={styles.drawerButton} onMouseDown={e => createBud(e)}>
            <FontAwesomeIcon icon={faObjectGroup}></FontAwesomeIcon>
          </button>
        </div>
      </div>
    </div>
  )
}

const mouseDown = (e, setMiddleMouseDown) => {
  if (e.button === 1) {
    setMiddleMouseDown(true)
  }
}

const mouseUp = (e, setMiddleMouseDown, setDragging) => {
  if (e.button === 1) {
    setMiddleMouseDown(false)
  } else if (e.button === 0) {
    setDragging(false)
  }
}

function createLine() {
  
}

const mouseMove = (e, middleMouseDown, mousePos, setMousePos) => {
  const divCanvas = document.getElementById('divCanvas')
  const x = e.pageX
  const y = e.pageY
  if ((!middleMouseDown) || (!mousePos.y || !mousePos.x)) {
    setMousePos({
      x: x,
      y: y
    })
    return
  }
  const xDiff = mousePos.x - x
  const yDiff = mousePos.y - y
  const multi = 8
  // divCanvas.scrollBy(-xDiff*multi, -yDiff*multi)
  divCanvas.scrollLeft += -xDiff*multi
  divCanvas.scrollTop += -yDiff*multi
  setMousePos({
    x: x,
    y: y
  })
}

/*
to do:
1. add drawer DONE
2. add ability to add objects DONE
3. add silk
*/

function drag(e, dragging, buds, setBuds) {
  if (dragging) {
    const selected = buds[buds.length - 1]
    console.log(selected)
    selected.props.x = e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft
    selected.props.y = e.pageY - 40 + divCanvas.scrollTop
    // const hexagon = createHexagon(e.pageX - window.innerWidth * 0.15, e.pageY - 40) // x offset: the drawer takes up 15% of window, and need offset to position middle of hexagon
    // e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft, e.pageY - 40 + divCanvas.scrollTop

  }
}

function FakeDraggableObj({ dragging, mousePos, buds, setBuds }) {
  const x = mousePos.x
  const y = mousePos.y
  useEffect(() => {
    const dragWrapper = (e) => drag(e, dragging, buds, setBuds)
    document.addEventListener('mousemove', dragWrapper)
    console.log('rendered')
    return () => {
      console.log('unrendered')
      document.removeEventListener('mousemove', dragWrapper)
    }
  }, [dragging])
  return (
    <div style={{'top': y-32, 'left': x-34}} className={dragging ? styles.fakeDraggableObj : styles.none} id='fakeDraggableObj'>
      
    </div>
  )
  // <Hexagon height="80" fill='#00D2FF' stroke='black' strokeWidth='1' ></Hexagon>
}

function DrawCanvas({ buds, setBuds }) {
  useEffect(() => {
    document.addEventListener('wheel', preventZoomScroll)
    let index = -1
    const leBuds = Object.keys(spoodawebData).map((name) => {
      index += 1
      return <Bud key={index} x={spoodawebData[name].position.x} y={spoodawebData[name].position.y}></Bud>
    })
    console.log(leBuds)
    setBuds(leBuds)
  }, [])
  return (
    <Stage
      x={0}
      y={0}
      width={window.innerWidth + 2 * 2000}
      height={window.innerHeight + 2 * 2000}>
      <Layer>
        {buds}
      </Layer>
    </Stage>
  )
}

function Edit() {
  const navigate = useNavigate()
  const [ middleMouseDown, setMiddleMouseDown ] = useState(false)
  const [ mousePos, setMousePos ] = useState({
    x: null,
    y: null
  })
  const [ dragging, setDragging ] = useState(false)
  const [ buds, setBuds ] = useState([])
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
        <ObjectDrawer setDragging={setDragging} buds={buds} setBuds={setBuds}></ObjectDrawer>
        <FakeDraggableObj dragging={dragging} setDragging={setDragging} mousePos={mousePos} buds={buds} setBuds={setBuds}></FakeDraggableObj>
        <div className={styles.divCanvas} id='divCanvas'>
          <DrawCanvas buds={buds} setBuds={setBuds}></DrawCanvas>
        </div>
      </div>
    </>
  )
}
export default Edit