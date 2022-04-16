import React, { memo, useEffect, useRef, useState } from 'react'
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
2. Add ability for silk to be able to be dragged after placement DONE
3. optimise the whole thing
4. Add ability for silk to be glued onto a bud or other silk
5. add saving ability
*/

function getCanvasMousePos(x, y) {
  return {x: x - window.innerWidth * 0.15 + divCanvas.scrollLeft, y: y - 40 + divCanvas.scrollTop}
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

function getHexagonLines(points) {
  const lines = []
  const a = 2 * Math.PI / 6
  let lastPoint = points[0]
  for (let i = 1; i < 7; i++) {
    let newPoint = points[i]
    if (newPoint === undefined) {
      newPoint = points[0]
    }
    lines.push([
      lastPoint,
      newPoint
    ])
    lastPoint = newPoint
  }
  return lines
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI/180)
}

const a = 2 * Math.PI / 6

function hexagonPoints(r, x, y) {
  const points = []
  for (var i = 0; i < 6; i++) {
    points.push({x: x + r * Math.cos(a * i), y: y + r * Math.sin(a * i)})
  }
  return points
}

function drawHexagon(ctx, points) {
  ctx.beginPath()
  for (var i = 0; i < 6; i++) {
    const x = points[i].x
    const y = points[i].y
    ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function Bud({ x, y, borderOn }) {
  /*
  gradient = rise / run
  rise = 
  */
  borderOn = (evt) => {
  }
  const bud = new Konva.Group()
  const radius = 40
  const strokeWidth = 40
  const renderedBud = new Konva.Shape({
    x: x,
    y: y,
    radius: radius,
    fill: '#00D2FF',
    stroke: 'black',
    strokeWidth: 1,
    draggable: true,
    points: hexagonPoints(radius, x, y),
    sceneFunc: (ctx, shape) => {
      const points = hexagonPoints(shape.getAttr('radius'), 0, 0)
      drawHexagon(ctx, points)
      ctx.fillStrokeShape(shape)
    }
  })
  renderedBud.on('dragmove', (evt) => {
    const renderedBud = evt.target
    const x = renderedBud.getX()
    const y = renderedBud.getY()
    const siblings = evt.target.parent.children.slice(1)
    for (const siblingIndex in siblings) {
      const hit = siblings[siblingIndex]
      hit.setX(x)
      hit.setY(y)
    }
  })
  // hitBorderBud.on('mousemove', borderOn)
  bud.add(renderedBud)
  const lines = getHexagonLines(renderedBud.getAttr('points'))
  const hitLines = getHexagonLines(hexagonPoints(radius+strokeWidth, x, y))
  for (const lineIndex in lines) {
    const line = lines[lineIndex]
    console.log(line)
    const hitArea = new Konva.Shape({
      x: x,
      y: y,
      fill: 'black',
      sceneFunc: (ctx, shape) => {
        const hitLine = hitLines[lineIndex]
        ctx.beginPath()
        ctx.lineTo(line[0].x-x, line[0].y-y)
        ctx.lineTo(line[1].x-x, line[1].y-y)
        ctx.lineTo(hitLine[1].x-x, hitLine[1].y-y)
        ctx.lineTo(hitLine[0].x-x, hitLine[0].y-y)
        ctx.fillStrokeShape(shape)
      }
    })
    bud.add(hitArea)
  }
  return bud
}

function lineCircleMove(e, draggingLine, selected, mainLayer) {
  if (isInCanvas({x: e.pageX, y: e.pageY}) && draggingLine) {
    const mousePos = {x: e.pageX, y: e.pageY}
    const canvasMousePos = getCanvasMousePos(mousePos.x, mousePos.y)
    console.log(selected.innerIndex)
    const lineGroup = mainLayer.children[selected.layerIndex].children
    const start = lineGroup[selected.innerIndex]
    const end = lineGroup[Math.abs(selected.innerIndex-2)+1]
    const line = lineGroup[0]
    // console.log(newStart)
    start.setX(canvasMousePos.x)
    start.setY(canvasMousePos.y)
    // line.setPoints([newStart.x, newStart.y, newEnd.x, newEnd.y])
    const lineTransform = line.getAbsoluteTransform()
    lineTransform.m = [1, 0, 0, 1, 0, 0] // lol
    const newStart = lineTransform.point({x: canvasMousePos.x, y: canvasMousePos.y})
    const newEnd = lineTransform.point({x: end.getX(), y: end.getY()})
    line.setPoints([newStart.x, newStart.y, newEnd.x, newEnd.y])
  }
}

function Circle(points, dragmoveFunc) {
  const circle = new Konva.Circle({
    radius: 5,
    x: points[0].x,
    y: points[0].y,
    fill: 'black',
    stroke: 'black',
    strokeWidth: 4,
    hitStrokeWidth: 30,
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
  group.add(line, circleStart, circleEnd)
  return group
}

function startDrag(e, draggingLine, setDraggingLine, selected, setSelected, mainLayer) {
  console.log(e.pageX, e.pageY)
  if (e.button === 0 && isInCanvas({x: e.pageX, y: e.pageY})) {
    const canvasMousePos = getCanvasMousePos(e.pageX, e.pageY)
    console.log('dragged line')
    setDraggingLine(true)
    const line = drawLine(
      [canvasMousePos, canvasMousePos],
      evt => lineCircleMove(evt.evt, true, {"layerIndex": evt.target.parent.index, "innerIndex": evt.target.index}, mainLayer),
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
      }
    )
    mainLayer.add(line)
    mainLayer.draw()
    setSelected({"layerIndex": line.index, "innerIndex": 1})
  }
}

function stopDrag(e, setDraggingLine, setSelected) {
  if (e.button === 0) {
    console.log('no')
    setDraggingLine(false)
    setSelected()
  }
}

const Select = memo(function Select({ mainLayer, toggle }) {
  const [ draggingLine, setDraggingLine ] = useState(false)
  const [ selected, setSelected ] = useState()
  // Object.keys().map((name) => { // ill deal with this later
  useEffect(() => {
    const startDragWrapper = e => startDrag(e, draggingLine, setDraggingLine, selected, setSelected, mainLayer)
    const stopDragWrapper = e => stopDrag(e, setDraggingLine, setSelected)
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
  }, [toggle, draggingLine, selected])
  return <></>
})

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

function drop(e, dragging, mainLayer) {
  // console.log(isMouseHoverCanvas)
  // if (!isMouseHoverCanvas) return
  if (dragging && isInCanvas({x: e.pageX, y: e.pageY})) {
    console.log('placed!')
    // e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft, e.pageY - 40 + divCanvas.scrollTop
    const bud = Bud(getCanvasMousePos(e.pageX, e.pageY))
    mainLayer.add(bud)
    mainLayer.draw()
  }
}

function FakeDraggableObj({ dragging, mousePos, mainLayer }) {
  const x = mousePos.x
  const y = mousePos.y
  useEffect(() => {
    const dropWrapper = (e) => drop(e, dragging, mainLayer)
    document.addEventListener('mouseup', dropWrapper)
    return () => {
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
    const budAnchorHighlighter = new Konva.Circle({
      radius: 5,
      x: 0,
      y: 0,
      fill: 'black'
    })
    mainLayer.add(budAnchorHighlighter)
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
  const [ hoverBudBorder, setHoverBudBorder ] = useState(false)
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
          mousePos={mousePos}
          mainLayer={mainLayer}></FakeDraggableObj>
        <Select mainLayer={mainLayer} toggle={toggle}></Select>
        <div className={styles.divCanvas} id='divCanvas'>
          <DrawCanvas setMainLayer={setMainLayer}></DrawCanvas>
        </div>
      </div>
    </>
  )
}
export default Edit