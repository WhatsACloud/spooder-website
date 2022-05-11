import React, { useEffect, useState } from 'react'
import * as reactKonva from 'react-konva'
import * as SilkUtils from './SilkUtils'
import * as utils from '../utils'
import { select } from '../Select'

function SilkEnd({ points, setDraggingLine, setSelectedSilk, setToggleCanDragLine, setSelectedObj }) {
  const circleDragmoveFunc = evt => SilkUtils.lineCircleMove(evt.evt, true, {"objId": evt.target.parent.getAttr('objId'), "innerIndex": evt.target.index}) 
  const stopDragLineWrapper = (e) => {
    document.removeEventListener('mouseup', stopDragLineWrapper)
  }
  return (
    <reactKonva.Circle
      radius={5}
      x={points.x}
      y={points.y}
      fill='red'
      stroke='red'
      strokeWidth={4}
      hitStrokeWidth={30}
      draggable={true}
      attachedToObjId={null}
      onDragStart={(e) => {
        const objId = e.target.parent.getAttr('objId')
        document.addEventListener('mouseup', stopDragLineWrapper)
        setToggleCanDragLine(false)
        SilkUtils.startDragLine(e.evt, setDraggingLine, setSelectedSilk, objId, e.target.index, false)
      }}
      onDragMove={circleDragmoveFunc}
      onMouseDown={evt => {select(evt, setSelectedObj)}}>
    </reactKonva.Circle>
  )
}
export { SilkEnd as SilkEnd }

function Silk({ points, setDraggingLine, objId, setSelectedSilk, setToggleCanDragLine, setSelectedObj }) {
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
    const lineGroup = evt.target.parent
    const objId = lineGroup.getAttr('objId')
    const points = SilkUtils.getLinePos(lineGroup)
    console.log(points[0], points[1])
    console.log(line.getPoints())
    const offsetRootPoses = lineGroup.getAttr('offsetRootPoses')
    const rootPos = utils.getRootPos()
    const newOffsetRootPoses = [
      {x: points[0].x - rootPos.x, y: points[0].y - rootPos.y},
      {x: points[1].x - rootPos.x, y: points[1].y - rootPos.y},
    ]
    lineGroup.setAttr('offsetRootPoses', newOffsetRootPoses)
    utils.updateObj(objId, {positions: newOffsetRootPoses})
  }
  const getOffsetRootPoses = () => {
    const rootPos = utils.getRootPos()
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
        onDragEnd={lineDragendFunc}
        onMouseDown={evt => {select(evt, setSelectedObj)}}></reactKonva.Line>
      <SilkEnd
        points={points[0]}
        setSelectedSilk={setSelectedSilk}
        setToggleCanDragLine={setToggleCanDragLine}
        setSelectedObj={setSelectedObj}
        setDraggingLine={setDraggingLine}></SilkEnd>
      <SilkEnd
        points={points[1]}
        setSelectedSilk={setSelectedSilk}
        setToggleCanDragLine={setToggleCanDragLine}
        setSelectedObj={setSelectedObj}
        setDraggingLine={setDraggingLine}></SilkEnd>
    </reactKonva.Group>
  )
}
export { Silk as Silk }