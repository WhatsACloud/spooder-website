import React, { useEffect, useState } from 'react'
import * as reactKonva from 'react-konva'
import { getHexagonLines, hexagonPoints, drawHexagon, stopDragLine, getKonvaObjs, getObjById, updateLinePos, getCanvasMousePos, getRootPos } from './HelperFuncs'

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

import { lineCircleMove, startDragLine } from './HelperFuncs'

function SilkEnd({ points, setDraggingLine, setSelected, setToggleCanDragLine }) {
  const circleDragmoveFunc = evt => lineCircleMove(evt.evt, true, {"objId": evt.target.parent.getAttr('objId'), "innerIndex": evt.target.index}) 
  const stopDragLineWrapper = (e) => {
    document.removeEventListener('mouseup', stopDragLineWrapper)
  }
  return (
    <reactKonva.Circle
      radius={5}
      x={points[0].x}
      y={points[0].y}
      fill='red'
      stroke='red'
      strokeWidth={4}
      hitStrokeWidth={30}
      draggable={true}
      attachedToObjId={null}
      onMouseDown={(e) => {
        const objId = e.target.parent.getAttr('objId')
        document.addEventListener('mouseup', stopDragLineWrapper)
        setToggleCanDragLine(false)
        startDragLine(e.evt, setDraggingLine, setSelected, objId, e.target.index, false)
      }}
      onDragMove={circleDragmoveFunc}>
    </reactKonva.Circle>
  )
}
export { SilkEnd as SilkEnd }

function Silk({ points, setDraggingLine, objId, setSelected, setToggleCanDragLine }) {
  const lineDragmoveFunc = evt => {
    const line = evt.target
    const lineGroup = line.parent.children
    const points = line.getPoints()
    const start = lineGroup[1]
    const end = lineGroup[2]
    const lineTransform = line.getAbsoluteTransform()
    const newStart = lineTransform.point({x: points[2], y: points[3]})
    const newEnd = lineTransform.point({x: points[0], y: points[1]})
    start.setX(newStart.x)
    start.setY(newStart.y)
    end.setX(newEnd.x)
    end.setY(newEnd.y)
  }
  const lineDragendFunc = evt => {
    const line = evt.target
    const points = line.getPoints()
  }
  const getOffsetRootPoses = () => {
    const rootPos = getRootPos()
    const offsetX = points[0].x - rootPos.x 
    const offsetY = points[0].y - rootPos.y 
    return [
      {x: offsetX, y: offsetY},
      {x: offsetX, y: offsetY}
    ] 
  } 
  return (
    <reactKonva.Group
      objType='silk'
      objId={objId}
      offsetRootPoses={getOffsetRootPoses()}>
      <reactKonva.Line
        points={[points[0].x, points[0].y, points[1].x, points[1].y]}
        stroke='black'
        strokeWidth={1}
        hitStrokeWidth={30}
        draggable={true}
        onDragMove={lineDragmoveFunc}
        onDragEnd={lineDragendFunc}></reactKonva.Line>
      <SilkEnd
        points={points}
        setSelected={setSelected}
        setToggleCanDragLine={setToggleCanDragLine}
        setDraggingLine={setDraggingLine}></SilkEnd>
      <SilkEnd
        points={points}
        setSelected={setSelected}
        setToggleCanDragLine={setToggleCanDragLine}
        setDraggingLine={setDraggingLine}></SilkEnd>
    </reactKonva.Group>
  )
}
export { Silk as Silk }

function Bud({ x, y, objId }) {
  console.log(objId)
  const rootPos = getRootPos()
  const radius = 40
  const strokeWidth = 40
  const lines = getHexagonLines(hexagonPoints(radius, x, y))
  const hitLines = getHexagonLines(hexagonPoints(radius+strokeWidth, x, y))
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
          updateLinePos(obj, budX - offset.x, budY - offset.y)
        }
      }}
      onDragStart={evt => {
        const bud = evt.target
        bud.parent.setAttr('lastMousePos', {x: evt.evt.pageX, y: evt.evt.pageY})
      }}
      onDragEnd={evt => {
        console.log(evt)
        const obj = evt.target.parent
        const bud = evt.target
        const offsetRootPos = obj.getAttr('offsetRootPos')
        const mousePos = {x: evt.evt.pageX, y: evt.evt.pageY}
        const previousMousePos = obj.getAttr('lastMousePos')
        console.log(offsetRootPos.x, mousePos.x, previousMousePos.x)
        obj.setAttr('offsetRootPos', {x: offsetRootPos.x + mousePos.x - previousMousePos.x, y: offsetRootPos.y + mousePos.y - previousMousePos.y})
        const rootPos = getRootPos()
        const newOffsetRootPos = obj.getAttr('offsetRootPos')
        // console.log(rootPos.x, newOffsetRootPos.x)
        bud.setX(rootPos.x + newOffsetRootPos.x)
        bud.setY(rootPos.y + newOffsetRootPos.y)
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
            const lines = getHexagonLines(renderedBud.getAttr('points'))
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