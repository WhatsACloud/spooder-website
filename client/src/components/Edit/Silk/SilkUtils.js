import * as SilkShapes from './SilkShape'
import * as utils from '../utils'
import React from 'react'

import { silkSample } from '../spoodawebSampleData'

const setSilk = (setObjsToUpdate, details) => {
  const nextObjId = utils.getNextObjId()
  const line = {...silkSample}
  for (const name in details) {
    if (name in line) {
      const detail = details[name]
      line[name] = detail
    }
  }
  setObjsToUpdate({[nextObjId]: line})
  utils.updateNewObjs(nextObjId, line)
  utils.setNextObjId(nextObjId+1)
}
export { setSilk as setSilk }

const startDragLine = (e, setSelectedSilk, objId, innerIndex, toggleCanDragLine) => {
  if (e.button === 0 && utils.isInCanvas({x: e.pageX, y: e.pageY})) {
    const newSelectedSilk = {"objId": objId, "innerIndex": innerIndex}
    setSelectedSilk(newSelectedSilk)
    const interval = setInterval(() => {
      const renderedLine = utils.getKonvaObjById(objId)
      if (renderedLine) {
        renderedLine.moveToBottom()
        clearInterval(interval)
      }
    }, 500)
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

const snapLine = (selectedSilk) => {
  const stage = utils.getStage()
  const highlighter = stage.find('.highlighter')[0]
  const line = utils.getKonvaObjById(selectedSilk.objId)
  const lineCircle = line.children[selectedSilk.innerIndex]
  const attachedTo = utils.getKonvaObjById(highlighter.getAttr('attachedObjId'))
  console.log(highlighter.getAttr('attachedObjId'))
  console.log(lineCircle.getX(), lineCircle.getY())
  lineCircle.setAttr('attachedToObjId', attachedTo.getAttr('objId'))
  const newAttachedSilkToBud = attachedTo.getAttr('attachedSilkObjId')
  if (!newAttachedSilkToBud[selectedSilk.objId]) {
    newAttachedSilkToBud[selectedSilk.objId] = selectedSilk.innerIndex
  }
  attachedTo.setAttr('attachedSilkObjId', newAttachedSilkToBud)
  updateLinePos(lineCircle, highlighter.getX(), highlighter.getY())
  const offsetRootPoses = line.getAttr('offsetRootPoses')
  const rootPos = utils.getRootPos()
  offsetRootPoses[Math.abs(selectedSilk.innerIndex-1)] = {x: highlighter.getX() - rootPos.x, y: highlighter.getY() - rootPos.y}
  line.setAttr('offsetRootPoses', offsetRootPoses)
  utils.updateObj(selectedSilk.objId, {
    positions: offsetRootPoses,
    [`attachedTo${selectedSilk.innerIndex}`]: lineCircle.getAttr('attachedToObjId')
  })
  const bud = attachedTo
  const budObjId = bud.getAttr('objId')
  console.log(utils.getObjById(budObjId))
  utils.updateObj(budObjId, {
    attachedTo: {...utils.getObjById(budObjId).attachedTo, [line.getAttr('objId')]: selectedSilk.innerIndex}
  })
}
export { snapLine as snapLine }

const snapLineCircleToLine = (selectedSilk) => { // pls fix ltr it doesnt work if innerIndex is 2
  const stage = getStage()
  const lineGroup = getKonvaObjById(selectedSilk.objId)
  const line = lineGroup.children[0]
  const lineCircle = lineGroup.children[selectedSilk.innerIndex]
  console.log(selectedSilk)
  console.log('snap')
  if (selectedSilk.innerIndex === 1) {
    lineCircle.setX(line.getPoints()[0])
    lineCircle.setY(line.getPoints()[1])
  } else if (selectedSilk.innerIndex === 2) {
    lineCircle.setX(line.getPoints()[2])
    lineCircle.setY(line.getPoints()[3])
  }
}
export { snapLineCircleToLine as snapLineCircleToLine }

const lineCircleMove = (e, draggingLine, selectedSilk) => {
  if (utils.isInCanvas({x: e.pageX, y: e.pageY}) && draggingLine) {
    const mousePos = {x: e.pageX, y: e.pageY}
    const canvasMousePos = utils.getCanvasMousePos(mousePos.x, mousePos.y)
    const lineGroup = utils.getKonvaObjById(selectedSilk.objId).children
    const start = lineGroup[selectedSilk.innerIndex]
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

const removeAttachment = (lineCircle) => {
  const attachedTo = utils.getKonvaObjById(lineCircle.getAttr('attachedToObjId'))
  if (attachedTo) {
    const newObjs = {...attachedTo.getAttr('attachedSilkObjId')}
    delete newObjs[Number(lineCircle.parent.getAttr('objId'))]
    attachedTo.setAttr('attachedSilkObjId', newObjs)
    lineCircle.setAttr('attachedToObjId', null)
    return true
  }
  return false
}
export { removeAttachment }