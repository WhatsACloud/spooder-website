import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../Shared/Authorizer'
import styles from './edit.module'
import konva from 'konva'
import { KonvaNodeEvent } from 'konva/lib/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins, faObjectGroup } from '@fortawesome/free-solid-svg-icons'

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

function ObjectDrawer({ objs, dragging, setDragging }) {
  return (
    <div className={styles.objectDrawer}>
      <div className={styles.box}>
        <div className={styles.obj}>
          <p>test</p>
          <button className={styles.drawerButton} onMouseDown={() => setDragging(true)}>
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

const mouseMove = (e, middleMouseDown, mousePos, setMousePos) => {
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
  divCanvas.scrollBy(-xDiff*multi, -yDiff*multi)
  setMousePos({
    x: x,
    y: y
  })
}

/*
to do:
1. add drawer DONE
2. add ability to add objects
3. add silk
*/

function drag(e, dragging) {
  if (dragging) {
  }
}

function FakeDraggableObj({ dragging, mousePos }) {
  const x = mousePos.x
  const y = mousePos.y
  useEffect(() => {
    const dragWrapper = (e) => drag(e, dragging)
    document.addEventListener('mousemove', dragWrapper)
    console.log('rendered')
    return () => {
      console.log('unrendered')
      document.removeEventListener('mousemove', dragWrapper)
    }
  }, [dragging])
  return (
    <div style={{'top': y, 'left': x}} className={dragging ? styles.fakeDraggableObj : styles.none} id='fakeDraggableObj'>
      this is a test
    </div>
  )
}

function DrawCanvas() {
  useEffect(() => {
    const stage = new konva.Stage({
      container: document.getElementById('divCanvas'),
      x: 200,
      y: 0,
      width: window.innerWidth + 2 * 2000,
      height: window.innerHeight + 2 * 2000
    })
    const mainLayer = new konva.Layer()
    // document.getElementsByClassName('konvajs-content')[0].addEventListener('wheel', preventZoomScroll)
    document.addEventListener('wheel', preventZoomScroll)

    for (const name in spoodawebData) {
      const bud = spoodawebData[name]
      const hexagon = new konva.RegularPolygon({
        x: bud.position.x,
        y: bud.position.y,
        sides: 6,
        radius: 40,
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 1,
        draggable: true,
      })
      /*
      const line = new konva.Line({
        points: [],
        stroke: 'green',
        strokeWidth: 2,
        lineJoin: 'round'
      })
      */
      mainLayer.add(hexagon)
    }
    stage.add(mainLayer)
  }, [])
  return <></>
}

function Edit() {
  const navigate = useNavigate()
  const [ middleMouseDown, setMiddleMouseDown ] = useState(false)
  const [ mousePos, setMousePos ] = useState({
    x: null,
    y: null
  })
  const [ dragging, setDragging ] = useState(false)
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
        <ObjectDrawer setDragging={setDragging}></ObjectDrawer>
        <FakeDraggableObj dragging={dragging} setDragging={setDragging} mousePos={mousePos}></FakeDraggableObj>
        <div className={styles.divCanvas} id='divCanvas'></div>
      </div>
      <DrawCanvas></DrawCanvas>
    </>
  )
}
export default Edit