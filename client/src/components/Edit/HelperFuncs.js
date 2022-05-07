import Konva from 'konva'

const getStage = () => {
  return Konva.stages[0] 
}
export { getStage as getStage }

const getMainLayer = () => {
  return getStage().children[0]
}
export { getMainLayer as getMainLayer }

const getKonvaObjs = () => {
  return getMainLayer().children
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

const setNextObjId = (amt) => {
  const mainLayer = getMainLayer()
  mainLayer.setAttr('nextObjId', amt)
}

const getNextObjId = () => {
  const mainLayer = getMainLayer()
  const currentNextObjId = mainLayer.getAttr('nextObjId')
  return currentNextObjId
}
export { getNextObjId as getNextObjId }

const updateNewObjs = (objId, obj) => {
  const mainLayer = getMainLayer()
  const newObjs = mainLayer.getAttr('newObjs')
  newObjs[objId] = obj
  mainLayer.setAttr('newObjs', newObjs)
}
export { updateNewObjs as updateNewObjs }

import { budSample } from './spoodawebSampleData'

const setBud = (setObjsToUpdate, details) => { // { pronounciation, contexts, examples, links, position, type }
  const obj = {...budSample}
  for (const name in details) {
    if (name in obj) {
      const detail = details[name]
      obj[name] = detail
    }
  }
  const nextObjId = getNextObjId()
  setObjsToUpdate({[nextObjId]: obj})
  updateNewObjs(nextObjId, obj)
  setNextObjId(nextObjId+1)
}
export { setBud as setBud }

import { silkSample } from './spoodawebSampleData'

const setSilk = (setObjsToUpdate, details) => {
  const nextObjId = getNextObjId()
  const line = {...silkSample}
  for (const name in details) {
    if (name in line) {
      const detail = details[name]
      line[name] = detail
    }
  }
  setObjsToUpdate({[nextObjId]: line})
  updateNewObjs(nextObjId, line)
  setNextObjId(nextObjId+1)
}
export { setSilk as setSilk }

const getRootPos = () => {
  return getMainLayer().getAttr('rootPos')
}
export { getRootPos as getRootPos }

const setRootPos = (rootPos) => {
  for (let obj of getKonvaObjs()) {
    const type = obj.getAttr('objType')
    if (type === 'bud') {
      const bud = obj.children[0]
      bud.setX(obj.getAttr('offsetRootPos').x + rootPos.x)
      bud.setY(obj.getAttr('offsetRootPos').y + rootPos.y)
    } else if (type === 'silk') {
      const silk = obj.children[0]
      silk.setPoints([
        obj.getAttr('offsetRootPoses')[0].x + rootPos.x,
        obj.getAttr('offsetRootPoses')[0].y + rootPos.y,
        obj.getAttr('offsetRootPoses')[1].x + rootPos.x,
        obj.getAttr('offsetRootPoses')[1].y + rootPos.y,
      ])
      const silkEnds = [obj.children[1], obj.children[2]]
      for (const index in silkEnds) {
        const silkEnd = silkEnds[index]
        silkEnd.setX(obj.getAttr('offsetRootPoses')[index].x + rootPos.x)
        silkEnd.setY(obj.getAttr('offsetRootPoses')[index].y + rootPos.y)
      }
    } else {
    }
  }
  getMainLayer().setAttr('rootPos', rootPos)
}
export { setRootPos as setRootPos }

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
  const line = lineGroup.children[0]
  const lineTransform = line.getAbsoluteTransform()
  lineTransform.m = [1, 0, 0, 1, 0, 0] // lol
  const end = lineGroup.children[Math.abs(lineCircle.index-2)+1]
  const newStart = lineTransform.point({x: x, y: y})
  const newEnd = lineTransform.point({x: end.getX(), y: end.getY()})
  line.setPoints([newStart.x, newStart.y, newEnd.x, newEnd.y])
}
export { updateLinePos as updateLinePos }

const getLinePos = (lineGroup) => {
  const line = lineGroup.children[0]
  const lineTransform = line.getAbsoluteTransform()
  lineTransform.m = [1, 0, 0, 1, 0, 0] // lol
  const start = lineGroup.children[1]
  const end = lineGroup.children[2]
  const newStart = lineTransform.point({x: start.getX(), y: start.getY()})
  const newEnd = lineTransform.point({x: end.getX(), y: end.getY()})
  return [newStart, newEnd]
}
export { getLinePos as getLinePos}

const getObjById = (id=null) => {
  if (id === null) return false
  const objs = getKonvaObjs()
  for (const obj of objs) {
    if (Number(obj.getAttr('objId')) === Number(id)) {
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

const startDragLine = (e, setDraggingLine, setSelected, objId, innerIndex, toggleCanDragLine) => {
  if (e.button === 0 && isInCanvas({x: e.pageX, y: e.pageY})) {
    setDraggingLine(true)
    setSelected({"objId": objId, "innerIndex": innerIndex})
    const renderedLine = getObjById(objId)
    renderedLine.moveToBottom()
  }
}
export { startDragLine as startDragLine }

const stopDragLine = (e, lineCircle) => { // todo: remove lineCircle, add mouseup event for border detectors and document
  if (e.button === 0) {
    console.log('no')
    const stage = Konva.stages[0]
    if (stage && lineCircle) {
      const highlighter = stage.find('.highlighter')[0]
      const x = highlighter.getX()
      const y = highlighter.getY()
      updateLinePos(lineCircle, x, y)
    }
  }
}
export { stopDragLine as stopDragLine }

const snapLine = (selected) => {
  const stage = getStage()
  const highlighter = stage.find('.highlighter')[0]
  const line = getObjById(selected.objId)
  const lineCircle = line.children[selected.innerIndex]
  const attachedTo = getObjById(highlighter.getAttr('attachedObjId'))
  console.log(highlighter.getAttr('attachedObjId'))
  const bud = attachedTo.children[0]
  const budX = bud.getX() 
  const budY = bud.getY() 
  const offset = {x: budX - highlighter.getX(), y: budY - highlighter.getY()}
  console.log(lineCircle.getX(), lineCircle.getY())
  lineCircle.setAttr('attachedToObjId', attachedTo.getAttr('objId'))
  const newAttachedSilkToBud = attachedTo.getAttr('attachedSilkObjId')
  newAttachedSilkToBud.push({"objId": selected.objId, "offset": offset, "innerIndex": selected.innerIndex})
  attachedTo.setAttr('attachedSilkObjId', newAttachedSilkToBud)
  updateLinePos(lineCircle, highlighter.getX(), highlighter.getY())
}
export { snapLine as snapLine }

const snapLineCircleToLine = (selected) => { // pls fix ltr it doesnt work if innerIndex is 2
  const stage = getStage()
  const lineGroup = getObjById(selected.objId)
  const line = lineGroup.children[0]
  const lineCircle = lineGroup.children[selected.innerIndex]
  console.log(selected)
  console.log('snap')
  if (selected.innerIndex === 1) {
    lineCircle.setX(line.getPoints()[0])
    lineCircle.setY(line.getPoints()[1])
  } else if (selected.innerIndex === 2) {
    lineCircle.setX(line.getPoints()[2])
    lineCircle.setY(line.getPoints()[3])
  }
}
export { snapLineCircleToLine as snapLineCircleToLine }

const addObjs = (toAdd) => {
  const layer = getMainLayer()
  const currentObjs = layer.getAttr('objs')
  const newObjs = {...currentObjs, ...toAdd}
  layer.setAttr('objs', newObjs)
}
export { addObjs as addObjs }

const updateObj = (objId, attrs) => {
  const mainLayer = getMainLayer()
  const obj = mainLayer.getAttr('objs')[objId]
  const newObjs = mainLayer.getAttr('newObjs')
  Object.entries(attrs).forEach(([name, val]) => {
    obj[name] = val
  })
  console.log(!(objId in Object.keys(newObjs)))
  if (!(objId in Object.keys(newObjs))) {
    obj.operation = 'edit'
  }
  updateNewObjs(objId, obj)
  const konvaObj = getObjById(objId) 
  if ('position' in attrs) {
    console.log(konvaObj)
  }
  if ('positions' in attrs) {
    const rootPos = getRootPos()
    konvaObj.children[0].setPoints([
      attrs.positions[0].x + rootPos.x,
      attrs.positions[0].y + rootPos.y,
      attrs.positions[1].x + rootPos.x,
      attrs.positions[1].y + rootPos.y
    ])
  }
}
export { updateObj as updateObj }

const save = () => {
  const newObjs = getMainLayer().getAttr('newObjs') 
  console.log(newObjs)
  // below simulates the thing reloading

  // const rootPos = getRootPos()
  // Object.entries(objs).forEach(([objId, obj]) => {
  //   const konvaObj = getObjById(objId)
  //   if (obj.type === "bud") {
  //     konvaObj.children[0].setX(obj.position.x + rootPos.x)
  //     konvaObj.children[0].setY(obj.position.y + rootPos.y)
  //   } else {
  //     konvaObj.children[0].setPoints([
  //       obj.positions[0].x + rootPos.x,
  //       obj.positions[0].y + rootPos.y,
  //       obj.positions[1].x + rootPos.x,
  //       obj.positions[1].y + rootPos.y,
  //     ])
  //   }
  // })
} 
export { save as save }