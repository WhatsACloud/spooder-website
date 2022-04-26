import Konva from 'konva'

const getKonvaObjs = () => {
  return Konva.stages[0].children[0].children
}
export { getKonvaObjs as getKonvaObjs }

const getCanvasMousePos = (x, y) => {
  return {x: x - window.innerWidth * 0.15 + divCanvas.scrollLeft, y: y - 40 + divCanvas.scrollTop}
}
export { getCanvasMousePos as getCanvasMousePos }

const withinRect = (mousePos, startX, startY, endX, endY) => {
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

import { budSample } from './spoodawebSampleData'

const setBud = (setObjsToUpdate, details) => { // { pronounciation, contexts, examples, links, position, type }
  const obj = {...budSample}
  for (const name in details) { // todo: add jest, make a username generator in python
    if (name in obj) {
      const detail = details[name]
      obj[name] = detail
    }
  }
  setObjsToUpdate([obj])
}
export { setBud as setBud }

const isInCanvas = (mousePos) => {
  const startX = window.innerWidth * 0.15
  const startY = 0
  const endX = window.innerWidth
  const endY = window.innerHeight
  return withinRect(mousePos, startX, startY, endX, endY)
}
export { isInCanvas as isInCanvas }

const getHexagonLines = (points) => {
  const lines = []
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
export { getHexagonLines as getHexagonLines }

const a = 2 * Math.PI / 6

const hexagonPoints = (r, x, y) => {
  const points = []
  for (var i = 0; i < 6; i++) {
    points.push({x: x + r * Math.cos(a * i), y: y + r * Math.sin(a * i)})
  }
  return points
}
export { hexagonPoints as hexagonPoints }

const drawHexagon = (ctx, points) => {
  ctx.beginPath()
  for (var i = 0; i < 6; i++) {
    const x = points[i].x
    const y = points[i].y
    ctx.lineTo(x, y)
  }
  ctx.closePath()
}
export { drawHexagon as drawHexagon }

const snapToPreview = (evt) => {
  const radius = 40
  const mousePos = getCanvasMousePos(evt.evt.pageX, evt.evt.pageY)
  const hitLinePoints = evt.target.getAttr('borderPoints')
  const rise = hitLinePoints[1].y - hitLinePoints[0].y
  const run = hitLinePoints[1].x - hitLinePoints[0].x
  const gradient = rise / run
  const highlighter = evt.target.parent.parent.parent.parent.find('.highlighter')[0]
  const bud = evt.target.parent.parent.children[0]
  const hitIndex = evt.target.index+1
  let x
  let y
  if (hitIndex === 2 || hitIndex === 5) {
    x = mousePos.x
    y = evt.target.getAttr('borderPoints')[0].y
  } else if (hitIndex === 3) {
    x = (
      Math.abs(evt.target.getY() - mousePos.y)
      / gradient
      + hitLinePoints[1].x
    )
    y = mousePos.y
  } else if (hitIndex === 6) { // yandere dev moment
    x = (
      - (
        Math.abs(evt.target.getY() - mousePos.y)
        / gradient
      )
      + hitLinePoints[1].x
    )
    y = mousePos.y
  } else if (hitIndex === 1) {
    x = (
      Math.abs(evt.target.getY() - mousePos.y)
      / gradient
      + hitLinePoints[1].x
      + radius / 2
    )
    y = mousePos.y
  } else if (hitIndex === 4) {
    x = (
      - (
        Math.abs(evt.target.getY() - mousePos.y)
        / gradient
      )
      + hitLinePoints[1].x
      - radius / 2
    )
    y = mousePos.y
  }
  
  if (x === undefined) {
    console.log('a')
  }
  let xStartingPointIndex = 0
  let yStartingPointIndex = 1
  if (hitIndex > 3) {
    xStartingPointIndex = 1
    yStartingPointIndex = 0
  }
  if (hitIndex === 3) {
    xStartingPointIndex = 0
    yStartingPointIndex = 0
  } else if (hitIndex === 6) {
    xStartingPointIndex = 1
    yStartingPointIndex = 1
  }
  if (x > hitLinePoints[xStartingPointIndex].x) {
    x = hitLinePoints[xStartingPointIndex].x
  } else if (x < hitLinePoints[Math.abs(xStartingPointIndex-1)].x) { // gets opposite point
    x = hitLinePoints[Math.abs(xStartingPointIndex-1)].x
  }
  if (y > hitLinePoints[yStartingPointIndex].y) {
    y = hitLinePoints[yStartingPointIndex].y
  } else if (y < hitLinePoints[Math.abs(yStartingPointIndex-1)].y) {
    y = hitLinePoints[Math.abs(yStartingPointIndex-1)].y
  }
  highlighter.setX(x)
  highlighter.setY(y)
}
export { snapToPreview as snapToPreview }

const updateLinePos = (lineCircle, x, y) => {
  lineCircle.setX(x)
  lineCircle.setY(y)
  const lineGroup = lineCircle.parent
  const line = lineGroup.children[2]
  const lineTransform = line.getAbsoluteTransform()
  lineTransform.m = [1, 0, 0, 1, 0, 0] // lol
  const end = lineGroup.children[Math.abs(lineCircle.index-1)]
  const newStart = lineTransform.point({x: x, y: y})
  const newEnd = lineTransform.point({x: end.getX(), y: end.getY()})
  line.setPoints([newStart.x, newStart.y, newEnd.x, newEnd.y])
}
export { updateLinePos as updateLinePos }

const getObjById = (id) => {
  const objs = getKonvaObjs()
  for (const obj of objs) {
    if (obj.getAttr('objId') === id) {
      return obj
    }
  }
  return false
}
export { getObjById as getObjById }

const lineCircleMove = (e, draggingLine, selected) => {
  if (isInCanvas({x: e.pageX, y: e.pageY}) && draggingLine) {
    const mousePos = {x: e.pageX, y: e.pageY}
    const canvasMousePos = getCanvasMousePos(mousePos.x, mousePos.y)
    const lineGroup = getObjById(selected.objId).children
    const start = lineGroup[selected.innerIndex]
    updateLinePos(start, canvasMousePos.x, canvasMousePos.y)
  }
}
export { lineCircleMove as lineCircleMove }

import * as Shapes from './Shapes'
import React from 'react'
import { silkSample } from './spoodawebSampleData'

const startDragLine = (e, setDraggingLine, setSelected, setObjsToUpdate, nextObjId, setNextObjId) => {
  console.log(e.pageX, e.pageY)
  if (e.button === 0 && isInCanvas({x: e.pageX, y: e.pageY})) {
    const canvasMousePos = getCanvasMousePos(e.pageX, e.pageY)
    console.log('dragged line')
    setDraggingLine(true)
    const line = {...silkSample}
    line.positions = [canvasMousePos, canvasMousePos]
    line.objId = nextObjId
    setObjsToUpdate([line])
    setSelected({"objId": nextObjId, "innerIndex": 1})
    setNextObjId(nextObjId+1)
  }
}
export { startDragLine as startDragLine }

const stopDragLine = (e, func, lineCircle) => { // todo: remove lineCircle, add mouseup event for border detectors and document
  if (e.button === 0) {
    console.log('no')
    const stage = Konva.stages[0]
    if (stage && lineCircle) {
      const highlighter = stage.find('.highlighter')[0]
      const x = highlighter.getX()
      const y = highlighter.getY()
      updateLinePos(lineCircle, x, y)
    }
    func()
  }
}
export { stopDragLine as stopDragLine }