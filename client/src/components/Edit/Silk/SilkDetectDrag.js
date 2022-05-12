import React, { useEffect, useState, memo } from 'react'
import * as SilkUtils from './SilkUtils'
import * as utils from '../utils'

const LineDragUpdater = memo(({ toggleCanDragLine, draggingLine, setObjsToUpdate, hoverBudBorder, setDraggingLine, nextObjId, setNextObjId, selectedSilk, setSelectedSilk }) => { // still a functional component
  useEffect(() => {
    let lineCircle
    if (selectedSilk) {
      const line = utils.getKonvaObjById(selectedSilk.objId)
      if (line) {
        lineCircle = line.children[selectedSilk.innerIndex]
      }
    }
    const startDragLineWrapper = e => {
      const canvasMousePos = utils.getCanvasMousePos(e.pageX, e.pageY)
      if (!utils.isInCanvas({x: e.pageX, y: e.pageY})) return
      const currentObjId = utils.getNextObjId()
      SilkUtils.setSilk(setObjsToUpdate, {positions: [canvasMousePos, canvasMousePos]})
      SilkUtils.startDragLine(e, setDraggingLine, setSelectedSilk, currentObjId, 1, toggleCanDragLine)
    }
    const stopDragLineWrapper = e => SilkUtils.stopDragLine(e, lineCircle)
    const dragLineWrapper = e => SilkUtils.lineCircleMove(e, draggingLine, selectedSilk)
    const dropLine = (e) => {
      const line = utils.getKonvaObjById(selectedSilk.objId)
      line.moveToTop()
      if (!utils.isInCanvas({x: e.pageX, y: e.pageY})) SilkUtils.snapLineCircleToLine(selectedSilk) 
      if (hoverBudBorder) {
        SilkUtils.snapLine(selectedSilk)
      } else { // detaches line
        const line = utils.getKonvaObjById(selectedSilk.objId)
        const offsetRootPoses = line.getAttr('offsetRootPoses')
        const mousePos = utils.getCanvasMousePos(e.pageX, e.pageY)
        const rootPos = utils.getRootPos()
        console.log(selectedSilk.innerIndex, Math.abs(selectedSilk.innerIndex-2)+1)
        console.log({...offsetRootPoses}, mousePos)
        offsetRootPoses[selectedSilk.innerIndex-1] = {x: mousePos.x - rootPos.x, y: mousePos.y - rootPos.y}
        console.log(offsetRootPoses)
        line.setAttr('offsetRootPoses', offsetRootPoses)
        const lineCircle = line.children[selectedSilk.innerIndex]
        SilkUtils.removeAttachment(lineCircle)
        utils.updateObj(selectedSilk.objId, {positions: offsetRootPoses})
      }
      setDraggingLine(false)
      setSelectedSilk()
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
  }, [ toggleCanDragLine, draggingLine, selectedSilk, hoverBudBorder ])
  return (
    <></>
  )
})
export { LineDragUpdater as LineDragUpdater }