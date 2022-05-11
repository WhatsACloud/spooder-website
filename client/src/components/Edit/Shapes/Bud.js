import React, { useEffect, useState } from 'react'
import * as reactKonva from 'react-konva'
import * as utils from '../utils'

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

function Bud({ x, y, objId }) {
  const rootPos = utils.getRootPos()
  const radius = 40
  const strokeWidth = 40
  const lines = utils.getHexagonLines(hexagonPoints(radius, x, y))
  const hitLines = utils.getHexagonLines(hexagonPoints(radius+strokeWidth, x, y))
  const hitAreas = lines.map((line, lineIndex) => {
    return (
      <reactKonva.Shape
        key={lineIndex}
        x={x}
        y={y}
        borderPoints={line}
        fill='rgba(0, 0, 0, 0)'
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
  return (
    <reactKonva.Group
      name='bud'
      objType='bud'
      objId={objId}
      offsetRootPos={{x: x - rootPos.x, y: y - rootPos.y}}
      lastMousePos={{x: 0, y: 0}}
      attachedSilkObjId={[]}
      onDragMove={(evt) => {
        const bud = evt.target
        const attachedObjIds = bud.parent.getAttr('attachedSilkObjId')
        for (const { objId, offset, innerIndex } of attachedObjIds) {
          const obj = getObjById(objId).children[innerIndex]
          const budX = bud.getX() 
          const budY = bud.getY() 
          utils.updateLinePos(obj, budX - offset.x, budY - offset.y)
        }
      }}
      onDragStart={evt => {
        const bud = evt.target
        bud.parent.setAttr('lastMousePos', {x: evt.evt.pageX, y: evt.evt.pageY})
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
        updateObj(obj.getAttr('objId'), {position: {x: newOffsetRootPos.x, y: newOffsetRootPos.y}})
      }}>
        <reactKonva.Shape
          x={x}
          y={y}
          radius={radius}
          fill='#00D2FF'
          stroke='black'
          strokeWidth={1}
          draggable={true}
          points={hexagonPoints(radius, x, y)}
          sceneFunc={(ctx, shape) => {
            const points = hexagonPoints(shape.getAttr('radius'), 0, 0) // why is this not the same as points variable above???
            drawHexagon(ctx, points)
            ctx.fillStrokeShape(shape)
          }}
          onDragMove={(evt) => {
            const renderedBud = evt.target
            const x = renderedBud.getX()
            const y = renderedBud.getY()
            renderedBud.setAttr('points', hexagonPoints(radius, x, y))
            const lines = utils.getHexagonLines(renderedBud.getAttr('points'))
            const siblings = evt.target.parent.children[1].children
            for (const siblingIndex in siblings) {
              const hit = siblings[siblingIndex]
              hit.setX(x)
              hit.setY(y)
              hit.setAttr('borderPoints', lines[siblingIndex])
            }
          }}>
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