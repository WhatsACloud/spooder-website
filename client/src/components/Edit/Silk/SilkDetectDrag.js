import React, { useEffect, useState, memo } from 'react'
import * as SilkUtils from './SilkUtils'
import * as utils from '../utils'

const LineDragUpdater = memo(({ toggleCanDragLine, draggingLine, setObjsToUpdate, hoverBudBorder, setDraggingLine, nextObjId, setNextObjId, selected, setSelected }) => { // still a functional component
  useEffect(() => {
    let lineCircle
    if (selected) {
      const line = utils.getObjById(selected.objId)
      if (line) {
        lineCircle = line.children[selected.innerIndex]
      }
    }
    const startDragLineWrapper = e => {
      const canvasMousePos = utils.getCanvasMousePos(e.pageX, e.pageY)
      if (!utils.isInCanvas({x: e.pageX, y: e.pageY})) return
      const currentObjId = utils.getNextObjId()
      SilkUtils.setSilk(setObjsToUpdate, {positions: [canvasMousePos, canvasMousePos]})
      SilkUtils.startDragLine(e, setDraggingLine, setSelected, currentObjId, 1, toggleCanDragLine)
    }
    const stopDragLineWrapper = e => SilkUtils.stopDragLine(e, lineCircle)
    const dragLineWrapper = e => SilkUtils.lineCircleMove(e, draggingLine, selected)
    const dropLine = (e) => {
      const line = utils.getObjById(selected.objId)
      line.moveToTop()
      if (!utils.isInCanvas({x: e.pageX, y: e.pageY})) SilkUtils.snapLineCircleToLine(selected) 
      if (hoverBudBorder) {
        SilkUtils.snapLine(selected)
      } else { // detaches line
        const line = utils.getObjById(selected.objId)
        const offsetRootPoses = line.getAttr('offsetRootPoses')
        const mousePos = utils.getCanvasMousePos(e.pageX, e.pageY)
        const rootPos = utils.getRootPos()
        offsetRootPoses[selected.innerIndex-1] = {x: mousePos.x - rootPos.x, y: mousePos.y - rootPos.y}
        line.setAttr('offsetRootPoses', offsetRootPoses)
        const lineCircle = line.children[selected.innerIndex]
        const attachedTo = utils.getObjById(lineCircle.getAttr('attachedToObjId'))
        if (attachedTo) {
          const newObjs = [...attachedTo.getAttr('attachedSilkObjId')]
          newObjs.splice(attachedTo, 1)
          attachedTo.setAttr('attachedSilkObjId', newObjs)
          lineCircle.setAttr('attachedToObjId', null)
        }
        utils.updateObj(selected.objId, {positions: offsetRootPoses})
      }
      setDraggingLine(false)
      setSelected()
    }
    if (toggleCanDragLine) {
      document.addEventListener('mousedown', startDragLineWrapper)
      document.addEventListener('mousemove', dragLineWrapper)
    } else {
      document.removeEventListener('mousedown', startDragLineWrapper)
      document.removeEventListener('mousemove', dragLineWrapper)
    }
    if (draggingLine) {
      document.addEventListener('mouseup', dropLine)
    }
    if (draggingLine && hoverBudBorder) {
      document.addEventListener('mouseup', stopDragLineWrapper)
    } else {
      document.removeEventListener('mouseup', stopDragLineWrapper)
    }
    return () => {
      document.removeEventListener('mousemove', dragLineWrapper)
      document.removeEventListener('mousedown', startDragLineWrapper)
      document.removeEventListener('mouseup', stopDragLineWrapper)
      document.removeEventListener('mouseup', dropLine)
    }
  }, [ toggleCanDragLine, draggingLine, selected, hoverBudBorder ])
  return (
    <></>
  )
})
export { LineDragUpdater as LineDragUpdater }