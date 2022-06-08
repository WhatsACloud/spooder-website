import React, { useEffect, useState } from 'react'
import Konva from 'konva'

import * as SilkUtils from './SilkUtils'
import * as utils from '../utils'
import { select } from '../Select'

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
  silkObj = null
  highlight = null
  _pos1 = {x: null, y: null}
  _pos2 = {x: null, y: null}
  silkId = null
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
    if (bud) {
      if (this._bud1) {
        this._bud1.delFromAttached(this.silkId)
      }
      bud.addToAttached(this)
      this.pos1 = bud.position
    }
    this._bud1 = bud
  }
  set bud2(bud) {
    if (bud) {
      if (this._bud2) {
        this._bud2.delFromAttached(this.silkId)
      }
      bud.addToAttached(this)
      this.pos2 = bud.position
    }
    this._bud2 = bud
  }
  fillInBud = (bud) => {
    if (this.bud1 === false) {
      this.bud1 = bud
      return
    } else if (this.bud2 === false) {
      this.bud2 = bud
      return
    }
    console.log('nothing to fill in')
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
    console.log('updated silk')
    this.pos1 = utils.calcPosByKonvaPos(this.bud1.konvaObj.getX(), this.bud1.konvaObj.getY())
    this.pos2 = utils.calcPosByKonvaPos(this.bud2.konvaObj.getX(), this.bud2.konvaObj.getY())
    // this.pos1 = this.bud1.position
    // this.pos2 = this.bud2.position
    this.silkObj.setPoints(this.getKonvaPoints())
    this.highlight?.setPoints(this.getKonvaPoints())
  }
  mouseDown = () => {
    this.select()
  }
  delete = () => {
    delete this.bud1.attachedSilk[this.silkId]
    delete this.bud2.attachedSilk[this.silkId]
    const attachedTos1 = this.bud1.json.attachedTos
    for (let i = 0; i < attachedTos1.length; i++) {
      if (attachedTos1[i] === this.bud2.objId) {
        attachedTos1.splice(i, 1)
      }
    }
    const attachedTos2 = this.bud2.json.attachedTos
    for (let i = 0; i < attachedTos2.length; i++) {
      if (attachedTos2[i] === this.bud1.objId) {
        attachedTos2.splice(i, 1)
      }
    }
    utils.delFromSilks(this.silkId)
    this.konvaObj.destroy()
  }
  select = () => {
    console.log('selected')
    const highlight = new Konva.Line({
        points: this.getKonvaPoints(),
        stroke: 'blue',
        strokeWidth: 5,
        hitStrokeWidth: 0,
    })
    this.silkObj.setPoints(this.getKonvaPoints())
    const selectFunc = () => {
      this.highlight = highlight
      this.konvaObj.add(highlight)
      this.silkObj.setZIndex(1)
      highlight.setZIndex(0)
    }
    const unselectFunc = () => {
      this.highlight = null
      highlight.destroy()
    }
    utils.selectObj(this.silkId, utils.ObjType.Silk, this.konvaObj, selectFunc, unselectFunc)
  }
  init = () => {
    // this.pos1 = this.bud1.position
    this.pos1 = this.bud1 ? this.bud1.position : this.pos1
    const group = new Konva.Group()
    group.on('mousedown', this.mouseDown)
    const line = new Konva.Line({
        points: this.getKonvaPoints(),
        stroke: 'black',
        strokeWidth: 1,
        hitStrokeWidth: 30,
    })
    group.add(line)
    this.konvaObj = group
    this.silkObj = line
    utils.getMainLayer().add(group)
    utils.addToSilks(this)
  }
  constructor(silkId, bud1, bud2) {
    this.bud1 = bud1
    this.bud2 = bud2
    if (bud2) {
      bud1.json?.attachedTos.push(bud2.objId)
    }
    if (bud1) {
      bud2.json?.attachedTos.push(bud1?.objId)
    }
    this.silkId = silkId
    this.init()
  }
}
export { Silk }