import * as SilkShapes from './SilkShape'
import * as utils from '../utils'
import React from 'react'

import { silkSample } from '../spoodawebSampleData'

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
  utils.setNextObjId(nextObjId+1)
}
export { setSilk as setSilk }

const startDragLine = (e, setDraggingLine, setSelected, objId, innerIndex, toggleCanDragLine) => {
  if (e.button === 0 && utils.isInCanvas({x: e.pageX, y: e.pageY})) {
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