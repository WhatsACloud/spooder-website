import React, { useEffect, useState, memo } from 'react'
import * as SilkUtils from './SilkUtils'
import * as utils from '../utils'

const LineDragUpdater = memo(({
  toggleCanDragLine,
  draggingLine,
  setObjsToUpdate,
  hoverBud,
  setDraggingLine,
  selectedSilk,
  setSelectedSilk,
  setTriggerDragLine,
  triggerDragLine
  }) => { // still a functional component
  useEffect(() => {
    let lineCircle
    if (selectedSilk) {
      const line = utils.getKonvaObjById(selectedSilk.objId)
      if (line) {
        lineCircle = line.children[selectedSilk.innerIndex]
      }
    }
    const startDragging = (e, canvasMousePos) => {
      if (!utils.isInCanvas(canvasMousePos)) return
      setDraggingLine(true)
      const currentObjId = utils.getNextObjId()
      SilkUtils.setSilk(setObjsToUpdate, {positions: [canvasMousePos, canvasMousePos]})
      SilkUtils.startDragLine(e, setSelectedSilk, currentObjId, 1, toggleCanDragLine)
    }
    const startDragLineWrapper = (e) => {
      const canvasMousePos = utils.getCanvasMousePos(e.pageX, e.pageY)
      startDragging(e, canvasMousePos)
    }
    if (triggerDragLine) {
      console.log(triggerDragLine)
      const budPos = {x: triggerDragLine.getX(), y: triggerDragLine.getY()}
      startDragging({button: 0, pageX: budPos.x, pageY: budPos.y}, budPos)
      setTriggerDragLine(false)
    }
    const stopDragLineWrapper = e => SilkUtils.stopDragLine(e, lineCircle)
    const dragLineWrapper = e => SilkUtils.lineCircleMove(e, draggingLine, selectedSilk)
    const dropLine = (e) => {
      const line = utils.getKonvaObjById(selectedSilk.objId)
      line.moveToBottom()
      if (!utils.isInCanvas({x: e.pageX, y: e.pageY})) SilkUtils.snapLineCircleToLine(selectedSilk) 
      if (hoverBud) {
        console.log(selectedSilk.innerIndex)
        SilkUtils.snapLine(selectedSilk)
      } else { // detaches line
        const offsetRootPoses = line.getAttr('offsetRootPoses')
        const mousePos = utils.getCanvasMousePos(e.pageX, e.pageY)
        const rootPos = utils.getRootPos()
        // const oppositePointPos = offsetRootPoses[Math.abs(selectedSilk.innerIndex-2)]
        offsetRootPoses[Math.abs(selectedSilk.innerIndex-1)] = {x: mousePos.x - rootPos.x, y: mousePos.y - rootPos.y}
        console.log(Math.abs(selectedSilk.innerIndex-1))
        // offsetRootPoses[selectedSilk.innerIndex-1] = oppositePointPos
        line.setAttr('offsetRootPoses', offsetRootPoses)
        const lineCircle = line.children[selectedSilk.innerIndex]
        SilkUtils.removeAttachment(lineCircle)
        console.log(selectedSilk.innerIndex)
        console.log(`attachedTo${selectedSilk.innerIndex}`)
        utils.updateObj(selectedSilk.objId, {
          positions: offsetRootPoses,
          innerIndex: selectedSilk.innerIndex
        })
      }
      setDraggingLine(false)
      setSelectedSilk()
    }
    utils.getMainLayer().setAttr('draggingLine', draggingLine)
    if (toggleCanDragLine) {
      document.addEventListener('mousedown', startDragLineWrapper)
    } else {
      document.removeEventListener('mousedown', startDragLineWrapper)
    }
    if (draggingLine) {
      document.addEventListener('mousemove', dragLineWrapper)
      document.addEventListener('mouseup', dropLine)
    } else {
      document.removeEventListener('mousemove', dragLineWrapper)
      document.removeEventListener('mouseup', dropLine)
    }
    if (draggingLine && hoverBud) {
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
  }, [ toggleCanDragLine, draggingLine, selectedSilk, hoverBud, triggerDragLine ])
  return (
    <></>
  )
})
export { LineDragUpdater as LineDragUpdater }