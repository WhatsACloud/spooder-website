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

function Bud({ x, y, objId, setSelectedObj, setObjsToUpdate, setDragging, setTriggerDragLine }) {
  const rootPos = utils.getRootPos()
  const radius = 40
  const strokeWidth = 40
  const lines = BudUtils.getHexagonLines(BudUtils.hexagonPoints(radius, x, y))
  const hitLines = BudUtils.getHexagonLines(BudUtils.hexagonPoints(radius+strokeWidth, x, y))
  const hitAreas = lines.map((line, lineIndex) => {
    return (
      <reactKonva.Shape
        key={lineIndex}
        x={x}
        y={y}
        borderPoints={line}
        // fill='rgba(0, 0, 0, 0)'
        fill='black'
        sceneFunc={(ctx, shape) => {
          const hitLine = hitLines[lineIndex]
          ctx.beginPath()
          ctx.lineTo(hitLine[0].x-2*x, hitLine[0].y-2*y)
          ctx.lineTo(line[0].x-2*x, line[0].y-2*y)
          ctx.lineTo(line[1].x-2*x, line[1].y-2*y)
          ctx.lineTo(hitLine[1].x-2*x, hitLine[1].y-2*y)
          ctx.fillStrokeShape(shape)
        }}>
      </reactKonva.Shape>
    )
  })
  const normalDragMoveEvt = (evt) => {
    const bud = evt.target
    const attachedObjIds = bud.parent.getAttr('attachedSilkObjId')
    for (const { objId, offset, innerIndex } of attachedObjIds) {
      const obj = utils.getKonvaObjById(objId).children[innerIndex]
      const budX = bud.getX() 
      const budY = bud.getY() 
      updateLinePos(obj, budX - offset.x, budY - offset.y)
    }
    BudUtils.updateBudHitGroups(bud, bud.parent.children[1].children)
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
      attachedSilkObjId={[]}>
        <reactKonva.Shape
          x={x}
          y={y}
          radius={radius}
          fill='#00D2FF'
          stroke='black'
          strokeWidth={1}
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
            }
            document.addEventListener('mouseup', mouseUpEvt)
            mainLayer.setAttr('addedObj', false)
          }}
          onDragEnd={evt => {
            const obj = evt.target.parent
            const bud = evt.target
            const offsetRootPos = obj.getAttr('offsetRootPos')
            const mousePos = {x: evt.evt.pageX, y: evt.evt.pageY}
            const previousMousePos = obj.getAttr('lastMousePos')
            obj.setAttr('offsetRootPos', {x: offsetRootPos.x + mousePos.x - previousMousePos.x, y: offsetRootPos.y + mousePos.y - previousMousePos.y})
            const rootPos = utils.getRootPos()
            const newOffsetRootPos = obj.getAttr('offsetRootPos')
            bud.setX(rootPos.x + newOffsetRootPos.x)
            bud.setY(rootPos.y + newOffsetRootPos.y)
            BudUtils.updateBudHitGroups(bud, obj.children[1].children)
            utils.updateObj(obj.getAttr('objId'), {position: {x: newOffsetRootPos.x, y: newOffsetRootPos.y}})
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
        <reactKonva.Group
          x={x}
          y={y}>
          {hitAreas}
        </reactKonva.Group>
    </reactKonva.Group>
  )
}
export { Bud as Bud }