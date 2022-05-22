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
  const [ makingLine, setMakingLine ] = useState(false) // if true that means initialising line
  useEffect(() => {
    let lineCircle
    let redoFunc, undoFunc
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
      SilkUtils.startDragLine(e, setSelectedSilk, currentObjId, 1)
      setMakingLine(true)
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
      console.log('dropped line')
      const line = utils.getKonvaObjById(selectedSilk.objId)
      line.moveToBottom()
      if (!utils.isInCanvas({x: e.pageX, y: e.pageY})) SilkUtils.snapLineCircleToLine(selectedSilk) 
      const highlighter = utils.getHighlighter()
      const budId = highlighter.getAttr('attachedObjId')
      const x = highlighter.getX()
      const y = highlighter.getY()
      const offsetRootPoses = line.getAttr('offsetRootPoses')
      const newOffsetRootPoses = [...offsetRootPoses]
      const mousePos = utils.getCanvasMousePos(e.pageX, e.pageY)
      const rootPos = utils.getRootPos()
      newOffsetRootPoses[Math.abs(selectedSilk.innerIndex-1)] = {x: mousePos.x - rootPos.x, y: mousePos.y - rootPos.y}
      console.log(makingLine)
      if (makingLine) {
        redoFunc = () => {
          SilkUtils.setSilk(setObjsToUpdate, {positions: newOffsetRootPoses})
        }
        undoFunc = () => {
          console.log(utils.getMainLayer())
          const konvaObj = utils.getKonvaObjById(selectedSilk.objId)
          console.log(konvaObj, selectedSilk.objId)
          konvaObj.destroy()
        }
      } else {
        if (hoverBud) {
          console.log(selectedSilk.innerIndex)
          SilkUtils.snapLine(selectedSilk, budId, x, y)
        } else { // detaches line
          const lineCircle = line.children[selectedSilk.innerIndex]
          redoFunc = () => {
            line.setAttr('offsetRootPoses', newOffsetRootPoses)
            SilkUtils.removeAttachment(lineCircle)
            utils.updateObj(selectedSilk.objId, {
              positions: newOffsetRootPoses,
              innerIndex: selectedSilk.innerIndex
            })
          }
          undoFunc = () => {
            line.setAttr('offsetRootPoses', offsetRootPoses)
            SilkUtils.snapLine(selectedSilk, budId, x, y)
            utils.updateObj(selectedSilk.objId, {
              positions: offsetRootPoses,
              innerIndex: selectedSilk.innerIndex
            })
          }
        }
      }
      utils.addToHistory(undoFunc, redoFunc)
      if (!makingLine) {
        redoFunc()
      }
      setDraggingLine(false)
      setSelectedSilk()
      setMakingLine(false)
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
  }, [ toggleCanDragLine, draggingLine, selectedSilk, hoverBud, triggerDragLine, makingLine ])
  return (
    <></>
  )
})
export { LineDragUpdater as LineDragUpdater }