import React, { useEffect, useState } from 'react'
import * as reactKonva from 'react-konva'
import { getHexagonLines, hexagonPoints, drawHexagon, stopDrag } from './HelperFuncs'

function budAnchorHighlighter() {
  return (
    <reactKonva.Circle
      radius={5}
      x={0}
      y={0}
      fill='grey'
      name='highlighter'
      visible={false}>

    </reactKonva.Circle>
  )
}
export { budAnchorHighlighter as budAnchorHighlighter }

function SilkEnd({ points, dragmoveFunc, setDraggingLine }) {
  const stopDragWrapper = (e) => {
    stopDrag(e, () => {
      setDraggingLine(false)
      removeEventListener('mouseup', stopDragWrapper)
    })
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
      onMouseDown={() => {
        setDraggingLine(true)
        addEventListener('mouseup', stopDragWrapper)
      }}
      onDragMove={dragmoveFunc}>
    </reactKonva.Circle>
  )
}
export { SilkEnd as SilkEnd }

function Silk(points, circleDragmoveFunc, lineDragmoveFunc, lineDragendFunc, setDraggingLine) {
  return (
    <reactKonva.Group>
      <SilkEnd
        points={points}
        circleDragmoveFunc={circleDragmoveFunc}
        setDraggingLine={setDraggingLine}></SilkEnd>
      <SilkEnd
        points={points}
        circleDragmoveFunc={circleDragmoveFunc}
        setDraggingLine={setDraggingLine}></SilkEnd>
      <reactKonva.Line
        points={[points[0].x, points[0].y, points[1].x, points[1].y]}
        stroke='black'
        strokeWidth={1}
        hitStrokeWidth={30}
        draggable={true}
        onDragMove={lineDragmoveFunc}
        onDragEnd={lineDragendFunc}></reactKonva.Line>
    </reactKonva.Group>
  )
}
export { Silk as Silk }

function Bud({ x, y }) {
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
  return (
    <reactKonva.Group
      name='bud'>
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