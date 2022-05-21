import React, { useEffect, useState } from 'react'
import * as reactKonva from 'react-konva'
import * as utils from '../utils'
import * as BudUtils from './BudUtils'
import { lineCircleMove, updateLinePos } from '../Silk/SilkUtils'
import { select } from '../Select'

function BudAnchorHighlighter() {
  return (
    <reactKonva.Circle
      radius={5}
      x={0}
      y={0}
      fill='grey'
      name='highlighter'
      attachedObjId={null}
      visible={false}>

    </reactKonva.Circle>
  )
}
export { BudAnchorHighlighter as BudAnchorHighlighter }

function Bud({ x, y, objId, setSelectedObj, setObjsToUpdate, setDragging, setTriggerDragLine, setHoverBud, attachedSilkObjId }) {
  const rootPos = utils.getRootPos()
  const radius = 40
  const normalDragMoveEvt = (evt) => {
    const bud = evt.target
    const attachedObjIds = bud.parent.getAttr('attachedSilkObjId')
    for (const [ objId, innerIndex ] of Object.entries(attachedObjIds)) {
      const obj = utils.getKonvaObjById(objId).children[innerIndex]
      const budX = bud.getX() 
      const budY = bud.getY() 
      updateLinePos(obj, budX, budY)
    }
  }
  const mouseMoveEvt = e => {
    const silkObjId = utils.getNextObjId()-1
    lineCircleMove(e, true, {objId: silkObjId, innerIndex: 1})
  }
  return (
    <reactKonva.Group
      name='bud'
      objType='bud'
      objId={objId}
      offsetRootPos={{x: x - rootPos.x, y: y - rootPos.y}}
      lastMousePos={{x: 0, y: 0}}
      attachedSilkObjId={attachedSilkObjId || {}}>
        <reactKonva.Shape
          x={x}
          y={y}
          radius={radius}
          fill='#00D2FF'
          stroke='black'
          strokeWidth={0}
          onDragMove={normalDragMoveEvt}
          onDragStart={evt => {
            const bud = evt.target
            bud.parent.setAttr('lastMousePos', {x: evt.evt.pageX, y: evt.evt.pageY})
          }}
          onMouseDown={evt => {
            const mainLayer = utils.getMainLayer()
            const modes = mainLayer.getAttr('modes').modes
            if (modes.autoDrag) {
              document.addEventListener('mousemove', mouseMoveEvt)
              setDragging(true)
              setTriggerDragLine(evt.target)
            }
            const mouseUpEvt = evt => {
              document.removeEventListener('mousemove', mouseMoveEvt)
              document.removeEventListener('mouseup', mouseUpEvt)
              const mainLayer = utils.getMainLayer()
              const interval = setInterval(() => {
                if (mainLayer.getAttr('addedObj')) {
                  clearInterval(interval)
                  const newBudId = utils.getNextObjId()-1
                  const newBud = utils.getKonvaObjById(newBudId)
                  const currentBud = utils.getKonvaObjById(objId)
                  const silkId = newBudId-1
                  const silk = utils.getKonvaObjById(silkId)
                  console.log(newBud, currentBud, silk)
                  const newBudAttachedSilk = {
                    ...newBud.getAttr('attachedSilkObjId'),
                    [silkId]: 1
                  }
                  const currentBudAttachedSilk = {
                    ...currentBud.getAttr('attachedSilkObjId'),
                    [silkId]: 2
                  }
                  silk.children[1].setAttr('attachedToObjId', newBudId)
                  silk.children[2].setAttr('attachedToObjId', objId)
                  utils.updateObj(newBudId, {attachedTo: newBudAttachedSilk})
                  utils.updateObj(objId, {attachedTo: currentBudAttachedSilk})
                  utils.updateObj(silkId, {
                    attachedTo1: newBudId,
                    attachedTo2: objId
                  })
                }
              }, 1000)
            }
            document.addEventListener('mouseup', mouseUpEvt)
            mainLayer.setAttr('addedObj', false)
          }}
          onDragEnd={evt => {
            const obj = evt.target.parent
            const objId = obj.getAttr('objId')
            const offsetRootPos = obj.getAttr('offsetRootPos')
            const mousePos = {x: evt.evt.pageX, y: evt.evt.pageY}
            const previousMousePos = obj.getAttr('lastMousePos')
            const oldOffsetRootPos = obj.getAttr('offsetRootPos')
            const newOffsetRootPos = {
              x: offsetRootPos.x + mousePos.x - previousMousePos.x,
              y: offsetRootPos.y + mousePos.y - previousMousePos.y
            }
            const attachedObjIds = obj.getAttr('attachedSilkObjId')
            const oldOffsetRootPoses = []
            const redoFunc = () => {
              // obj.setAttr('offsetRootPos', newOffsetRootPos)
              utils.updateObj(objId, {position: newOffsetRootPos}, true)
              for (const [ objId, innerIndex ] of Object.entries(attachedObjIds)) {
                const line = utils.getKonvaObjById(objId)
                const offsetRootPoses = line.getAttr('offsetRootPoses')
                oldOffsetRootPoses.push(offsetRootPoses)
                offsetRootPoses[innerIndex-1] = {x: newOffsetRootPos.x, y: newOffsetRootPos.y}
                utils.updateObj(objId, {positions: offsetRootPoses}, true)
              }
            }
            const undoFunc = () => {
              // obj.setAttr('offsetRootPos', oldOffsetRootPos)
              console.log('undone')
              utils.updateObj(objId, {position: oldOffsetRootPos}, true)
              // for (let index = 0; index < Object.keys(attachedObjIds); index++) {
              //   utils.updateObj(objId, {positions: }, true)
              // }
            }
            utils.addToHistory(undoFunc, redoFunc)
            redoFunc()
          }}
          onMouseEnter={evt => {
            const mainLayer = utils.getMainLayer()
            const modes = mainLayer.getAttr('modes').modes
            const bud = evt.target
            if (modes.autoDrag) {
              bud.setDraggable(false)
            } else {
              bud.setDraggable(true)
            }
            if (mainLayer.getAttr('draggingLine')) {
              setHoverBud(true)
              const highlighter = utils.getStage().find('.highlighter')[0]
              highlighter.setVisible(true)
              highlighter.setAttr('attachedObjId', bud.parent.getAttr('objId'))
              highlighter.setX(bud.getX())
              highlighter.setY(bud.getY())
            }
          }}
          onMouseLeave={evt => {
            setHoverBud(false)
            const highlighter = utils.getStage().find('.highlighter')[0]
            highlighter.setVisible(false)
            highlighter.setAttr('attachedObjId', null)
            highlighter.setX(-1)
            highlighter.setY(-1)
          }}
          draggable={true}
          points={BudUtils.hexagonPoints(radius, x, y)}
          sceneFunc={(ctx, shape) => {
            const points = BudUtils.hexagonPoints(shape.getAttr('radius'), 0, 0) // why is this not the same as points variable above???
            BudUtils.drawHexagon(ctx, points)
            ctx.fillStrokeShape(shape)
          }}
          onClick={evt => {select(evt, setSelectedObj)}}>
        </reactKonva.Shape>
    </reactKonva.Group>
  )
}
export { Bud as Bud }