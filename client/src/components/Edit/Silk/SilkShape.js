import React, { useEffect, useState } from 'react'
import Konva from 'konva'

import * as SilkUtils from './SilkUtils'
import * as utils from '../utils'
import { select } from '../Select'

function SilkEnd({ points, setDraggingLine, setSelectedSilk, setToggleCanDragLine, setSelectedObj, attachedToObjId }) {
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
      attachedToObjId={attachedToObjId || null}
      onDragStart={(e) => {
        const objId = e.target.parent.getAttr('objId')
        document.addEventListener('mouseup', stopDragLineWrapper)
        setToggleCanDragLine(false)
        setDraggingLine(true)
        SilkUtils.startDragLine(e.evt, setSelectedSilk, objId, e.target.index, false)
      }}
      onDragMove={circleDragmoveFunc}
      onClick={evt => {select(evt, setSelectedObj)}}>
    </reactKonva.Circle>
  )
}
export { SilkEnd as SilkEnd }

// function Silk({ points, setDraggingLine, objId, setSelectedSilk, setToggleCanDragLine, setSelectedObj, attachedTo1, attachedTo2 }) {
//   const lineDragmoveFunc = evt => {
//     const line = evt.target
//     const lineGroup = line.parent.children
//     const points = line.getPoints()
//     const start = lineGroup[1]
//     const end = lineGroup[2]
//     const lineTransform = line.getAbsoluteTransform()
//     const newStart = lineTransform.point({x: points[2], y: points[3]})
//     const newEnd = lineTransform.point({x: points[0], y: points[1]})
//     start.setX(newStart.x)
//     start.setY(newStart.y)
//     end.setX(newEnd.x)
//     end.setY(newEnd.y)
//   }
//   const lineDragendFunc = evt => {
//     const lineGroup = evt.target.parent
//     const objId = lineGroup.getAttr('objId')
//     const points = SilkUtils.getLinePos(lineGroup)
//     const offsetRootPoses = lineGroup.getAttr('offsetRootPoses')
//     const oldRootPos = utils.getRootPos()
//     const redoFunc = () => {
//       const rootPos = utils.getRootPos()
//       // const lineGroup = utils.getKonvaObjById(objId)
//       console.log(rootPos)
//       lineGroup.setAttr('offsetRootPoses', [
//         {x: points[0].x + rootPos.x, y: points[0].y + rootPos.y},
//         {x: points[1].x + rootPos.x, y: points[1].y + rootPos.y},
//       ])
//       // utils.updateObj(objId, {positions: [
//       //   {x: points[0].x + rootPos.x, y: points[0].y + rootPos.y},
//       //   {x: points[1].x + rootPos.x, y: points[1].y + rootPos.y},
//       // ]}, true)
//     }
//     const undoFunc = () => {
//       const rootPos = utils.getRootPos()
//       // const lineGroup = utils.getKonvaObjById(objId)
//       lineGroup.setAttr('offsetRootPoses', [
//         {x: offsetRootPoses[0].x + rootPos.x, y: offsetRootPoses[0].y + rootPos.y},
//         {x: offsetRootPoses[1].x + rootPos.x, y: offsetRootPoses[1].y + rootPos.y},
//       ])
//       // utils.updateObj(objId, {positions: [
//       //   {x: offsetRootPoses[0].x + rootPos.x, y: offsetRootPoses[0].y + rootPos.y},
//       //   {x: offsetRootPoses[1].x + rootPos.x, y: offsetRootPoses[1].y + rootPos.y},
//       // ]}, true)
//     }
//     utils.addToHistory(undoFunc, redoFunc)
//     redoFunc()
//   }
//   const rootPos = utils.getRootPos()
//   const getOffsetRootPoses = () => {
//     const offsetX1 = points[0].x 
//     const offsetY1 = points[0].y 
//     const offsetX2 = points[1].x 
//     const offsetY2 = points[1].y 
//     return [
//       {x: offsetX1, y: offsetY1},
//       {x: offsetX2, y: offsetY2}
//     ] 
//   } 
//   return (
//     <reactKonva.Group
//       objType='silk'
//       objId={objId}
//       offsetRootPoses={getOffsetRootPoses()}>
//       <reactKonva.Line
//         points={[
//           points[0].x + rootPos.x,
//           points[0].y + rootPos.y,
//           points[1].x + rootPos.x,
//           points[1].y + rootPos.y,
//         ]}
//         stroke='black'
//         strokeWidth={1}
//         hitStrokeWidth={30}
//         draggable={true}
//         onDragStart={evt => {
//           const silkGroup = evt.target.parent
//           SilkUtils.removeAttachment(silkGroup.children[1])
//           SilkUtils.removeAttachment(silkGroup.children[2])
//         }}
//         onDragMove={lineDragmoveFunc}
//         onDragEnd={lineDragendFunc}
//         onClick={evt => {select(evt, setSelectedObj)}}></reactKonva.Line>
//       <SilkEnd
//         points={{x: points[0].x + rootPos.x, y: points[0].y + rootPos.y}}
//         setSelectedSilk={setSelectedSilk}
//         setToggleCanDragLine={setToggleCanDragLine}
//         objId={objId}
//         attachedToObjId={attachedTo1}
//         setSelectedObj={setSelectedObj}
//         setDraggingLine={setDraggingLine}></SilkEnd>
//       <SilkEnd
//         points={{x: points[1].x + rootPos.x, y: points[1].y + rootPos.y}}
//         setSelectedSilk={setSelectedSilk}
//         setToggleCanDragLine={setToggleCanDragLine}
//         attachedToObjId={attachedTo2}
//         objId={objId}
//         setSelectedObj={setSelectedObj}
//         setDraggingLine={setDraggingLine}></SilkEnd>
//     </reactKonva.Group>
//   )
// }
// export { Silk as Silk }

class Silk {
  konvaObj = null
  _pos1 = null
  _pos2 = null
  get pos1() {return this._pos1}
  get pos2() {return this._pos2}
  set pos1(pos) {this._pos1 = pos}
  set pos2(pos) {this._pos2 = pos}
  _bud1 = null
  _bud2 = null
  get bud1() {return this._bud1}
  get bud2() {return this._bud2}
  // set bud1(id) { this._setBud('_bud1Id', '_pos1', id) }
  // set bud2(id) { this._setBud('_bud2Id', '_pos2', id) }
  set bud1(bud) {
    this._bud1 = bud
    this.pos1 = bud.position
  }
  set bud2(bud) {
    this._bud2 = bud
    this.pos2 = bud.position
  }
  getKonvaPoints = () => {
    const newPos1 = utils.calcKonvaPosByPos(this.pos1)
    const newPos2 = utils.calcKonvaPosByPos(this.pos2)
    return [
      newPos1.x,
      newPos1.y,
      newPos2.x,
      newPos2.y,
    ]

  }
  update = () => {
    this.pos1 = utils.calcPosByKonvaPos(this.bud1.konvaObj.getX(), this.bud1.konvaObj.getY())
    this.pos2 = utils.calcPosByKonvaPos(this.bud2.konvaObj.getX(), this.bud2.konvaObj.getY())
    this.konvaObj.children[0].setPoints(this.getKonvaPoints())
  }
  init = () => {
    this.pos1 = this.bud1
    const group = new Konva.Group()
    const line = new Konva.Line({
        points: this.getKonvaPoints(),
        stroke: 'black',
        strokeWidth: 1,
        hitStrokeWidth: 30,
    })
    group.add(line)
    this.konvaObj = group
    utils.getMainLayer().add(group)
  }
  constructor(bud1, bud2) {
    this.bud1 = bud1
    this.bud2 = bud2
    this.init()
  }
}
export { Silk }