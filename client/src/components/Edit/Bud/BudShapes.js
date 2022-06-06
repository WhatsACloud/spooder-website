import React, { useEffect, useState } from 'react'
import * as utils from '../utils'
import * as BudUtils from './BudUtils'
import { lineCircleMove, updateLineCirclePos } from '../Silk/SilkUtils'
import { select } from '../Select'
import Konva from 'konva'

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

// function Bud({ x, y, objId, setSelectedObj, setObjsToUpdate, setDragging, setTriggerDragLine, setHoverBud, attachedSilkObjId }) {
//   const normalDragMoveEvt = (evt) => {
//     const bud = evt.target
//     const attachedObjIds = bud.parent.getAttr('attachedSilkObjId')
//     for (const [ objId, innerIndex ] of Object.entries(attachedObjIds)) {
//       const obj = utils.getKonvaObjById(objId).children[innerIndex]
//       const budX = bud.getX() 
//       const budY = bud.getY() 
//       updateLineCirclePos(obj, budX, budY)
//     }
//   }
//   const mouseMoveEvt = e => {
//     const silkObjId = utils.getNextObjId()-1
//     lineCircleMove(e, true, {objId: silkObjId, innerIndex: 1})
//   }
//   return (
//     <reactKonva.Group
//       name='bud'
//       objType='bud'
//       objId={objId}
//       offsetRootPos={{x: x - rootPos.x, y: y - rootPos.y}}
//       lastMousePos={{x: 0, y: 0}}
//       attachedSilkObjId={attachedSilkObjId || {}}>
//         {/* <reactKonva.Shape
//           x={x}
//           y={y}
//           strokeWidth={0}
//           radius={radius+10}
//           sceneFunc={(ctx, shape) => {
//             const points = BudUtils.hexagonPoints(shape.getAttr('radius'), 0, 0) // why is this not the same as points variable above???
//             BudUtils.drawHexagon(ctx, points)
//             ctx.fillStrokeShape(shape)
//           }}
//           fillRadialGradientStartPoint={{ x: 0, y: 0 }}
//           fillRadialGradientStartRadius={radius}
//           fillRadialGradientEndPoint={{ x: 0, y: 0 }}
//           fillRadialGradientEndRadius={radius+40}
//           fillRadialGradientColorStops={[0, "#9bedff", 0.05, 'rgba(0, 0, 0, 0)']}
//           // fillLinearGradientColorStops={[0, "#000046", 0.5, "#1CB5E0"]}
//           >
//         </reactKonva.Shape> */}
//         <reactKonva.Shape
//           x={x}
//           y={y}
//           radius={radius}
//           strokeWidth={0}
//           fillLinearGradientStartPoint={{ x: -100, y: 0 }}
//           fillLinearGradientEndPoint={{ x: 100, y: 150 }}
//           fillLinearGradientColorStops={[0, "#000046", 0.5, "#1CB5E0"]}
//           shadowColor='black'
//           shadowBlur={10}
//           shadowOffset={{ x: 10, y: 10 }}
//           shadowOpacity={0.5}
//           onDragMove={normalDragMoveEvt}
//           onDragStart={evt => {
//             const bud = evt.target
//             bud.parent.setAttr('lastMousePos', {x: evt.evt.pageX, y: evt.evt.pageY})
//           }}
//           onMouseDown={evt => {
//             const globals = utils.getGlobals()
//             if (globals.modes.autoDrag) {
//               document.addEventListener('mousemove', mouseMoveEvt)
//               setDragging(true)
//               setTriggerDragLine(evt.target)
//             }
//             const mouseUpEvt = evt => {
//               document.removeEventListener('mousemove', mouseMoveEvt)
//               document.removeEventListener('mouseup', mouseUpEvt)
//               const mainLayer = utils.getMainLayer()
//               const interval = setInterval(() => {
//                 if (globals.addedObj) {
//                   clearInterval(interval)
//                   const newBudId = utils.getNextObjId()-1
//                   const newBud = utils.getKonvaObjById(newBudId)
//                   const currentBud = utils.getKonvaObjById(objId)
//                   const silkId = newBudId-1
//                   const silk = utils.getKonvaObjById(silkId)
//                   console.log(newBud, currentBud, silk)
//                   const newBudAttachedSilk = {
//                     ...newBud.getAttr('attachedSilkObjId'),
//                     [silkId]: 1
//                   }
//                   const currentBudAttachedSilk = {
//                     ...currentBud.getAttr('attachedSilkObjId'),
//                     [silkId]: 2
//                   }
//                   silk.children[1].setAttr('attachedTosObjId', newBudId)
//                   silk.children[2].setAttr('attachedTosObjId', objId)
//                   utils.updateObj(newBudId, {attachedTos: newBudAttachedSilk})
//                   utils.updateObj(objId, {attachedTos: currentBudAttachedSilk})
//                   utils.updateObj(silkId, {
//                     attachedTos1: newBudId,
//                     attachedTos2: objId
//                   })
//                 }
//               }, 1000)
//             }
//             document.addEventListener('mouseup', mouseUpEvt)
//             globals.addedObj = false
//           }}
//           onDragEnd={evt => {
//             const obj = evt.target.parent
//             const objId = obj.getAttr('objId')
//             const offsetRootPos = obj.getAttr('offsetRootPos')
//             const mousePos = {x: evt.evt.pageX, y: evt.evt.pageY}
//             const previousMousePos = obj.getAttr('lastMousePos')
//             const oldOffsetRootPos = obj.getAttr('offsetRootPos')
//             const newOffsetRootPos = {
//               x: offsetRootPos.x + mousePos.x - previousMousePos.x,
//               y: offsetRootPos.y + mousePos.y - previousMousePos.y
//             }
//             const attachedObjIds = obj.getAttr('attachedSilkObjId')
//             const oldOffsetRootPoses = []
//             const redoFunc = () => {
//               // obj.setAttr('offsetRootPos', newOffsetRootPos)
//               utils.updateObj(objId, {position: newOffsetRootPos})
//               for (const [ objId, innerIndex ] of Object.entries(attachedObjIds)) {
//                 const line = utils.getKonvaObjById(objId)
//                 const offsetRootPoses = line.getAttr('offsetRootPoses')
//                 oldOffsetRootPoses.push(offsetRootPoses)
//                 offsetRootPoses[innerIndex-1] = {x: newOffsetRootPos.x, y: newOffsetRootPos.y}
//                 utils.updateObj(objId, {positions: offsetRootPoses})
//               }
//             }
//             const undoFunc = () => {
//               console.log('undone')
//               utils.updateObj(objId, {position: oldOffsetRootPos})
//             }
//             utils.addToHistory(undoFunc, redoFunc)
//             redoFunc()
//           }}
//           onMouseEnter={evt => {
//             const globals = utils.getGlobals()
//             const bud = evt.target
//             if (globals.modes.autoDrag) {
//               bud.setDraggable(false)
//             } else {
//               bud.setDraggable(true)
//             }
//             if (globals.draggingLine) {
//               setHoverBud(true)
//               const highlighter = utils.getStage().find('.highlighter')[0]
//               highlighter.setVisible(true)
//               highlighter.setAttr('attachedObjId', bud.parent.getAttr('objId'))
//               highlighter.setX(bud.getX())
//               highlighter.setY(bud.getY())
//             }
//           }}
//           onMouseLeave={evt => {
//             setHoverBud(false)
//             const highlighter = utils.getStage().find('.highlighter')[0]
//             highlighter.setVisible(false)
//             highlighter.setAttr('attachedObjId', null)
//             highlighter.setX(-1)
//             highlighter.setY(-1)
//           }}
//           draggable={true}
//           points={BudUtils.hexagonPoints(radius, x, y)}
//           sceneFunc={(ctx, shape) => {
//             const points = BudUtils.hexagonPoints(shape.getAttr('radius'), 0, 0) // why is this not the same as points variable above???
//             BudUtils.drawHexagon(ctx, points)
//             ctx.fillStrokeShape(shape)
//           }}
//           onClick={evt => {select(evt, setSelectedObj)}}>
//         </reactKonva.Shape>
//     </reactKonva.Group>
//   )
// }
// export { Bud as Bud }

class Bud {
  static base = {
    word: '',
    definition: '',
    sound: '',
    context: '',
    example: '',
    link: 0,
    attachedTos: {},
    position: {x: 0, y: 0},
    objId: null,
  }
  loaded = null
  _position = {x: 0, y: 0}
  get position() {return this._position}
  set position(lePos) {
    if (!(isNaN(lePos.x)) && !(isNaN(lePos.y))) {
      this._position = lePos
      this.json.position = lePos
      const konvaPos = utils.calcKonvaPosByPos(lePos)
      this.konvaObj.setX(konvaPos.x) // reason being calculation of konvaObj by rootPos was a nightmare sooooo just in case
      this.konvaObj.setY(konvaPos.y)
      return
    }
    console.warn(`WARNING: position given is invalid, given ${lePos} (bud ${this.objId})`)
  }
  get x() {return this.position.x}
  get y() {return this.position.y}
  set x(leX) {
    this.position.x = leX
    this.json.position.x = leX
    this.konvaObj.setX(utils.calcKonvaPosByPos({x: leX, y: this.y}).x) // reason being calculation of konvaObj by rootPos was a nightmare sooooo just in case
  }
  set y(leY) {
    this.position.y = leY
    this.json.position.y = leY
    this.konvaObj.setY(utils.calcKonvaPosByPos({x: this.x, y: leY}).y) // reason being calculation of konvaObj by rootPos was a nightmare sooooo just in case
  }
  konvaObj = null
  dragging = false
  del = false
  objId = null
  json = {...Bud.base}
  fromJson = () => {
    const sifted = {}
    for (attr in Object.keys(leJson)) {
      if (!(attr in Bud.base)) {
        console.warn(`WARNING: given JSON contains (${attr}) of value (${leJson[attr]}) which is not an attribute of bud. (bud ${this.objId})`)
        continue
      } else if (!(typeof Bud.base[attr] === typeof leJson[attr])) {
        console.warn(`WARNING: (${attr}) should be of type ${typeof Bud.base[attr]}, not ${typeof leJson[attr]}. (${this.objId})`)
        continue
      }
      sifted[attr] = leJson[attr]
    }
    this._json = sifted
    console.log(this._json)
  }
  init = (objId) => {
    if (this.loaded === null) console.warn('Please set the bud.loaded variable before init!')
    const rootPos = utils.getRootPos()
    const radius = 40
    const budGroup = new Konva.Group({
      x: 0,
      y: 0,
      draggable: true,
    })
    budGroup.on('dragstart', () => {
      this.dragging = true
    })
    budGroup.on('dragend', () => {
      this.dragging = false
      const rootPos = utils.getRootPos()
      const newX = this.konvaObj.getX()
      const newY = this.konvaObj.getY()
      this.x = newX - rootPos.x
      this.y = newY - rootPos.y
    })
    const budShape = new Konva.Shape({
      strokeWidth: 0,
      radius: radius,
      sceneFunc: (ctx, shape) => {
        const points = BudUtils.hexagonPoints(shape.getAttr('radius'), 0, 0) // why is this not the same as points variable above???
        BudUtils.drawHexagon(ctx, points)
        ctx.fillStrokeShape(shape)
      },
      fillLinearGradientStartPoint: { x: -100, y: 0 },
      fillLinearGradientEndPoint: { x: 100, y: 150 },
      fillLinearGradientColorStops: [0, "#000046", 0.5, "#1CB5E0"],
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 0.5,
    })
    budGroup.add(budShape)
    const mainLayer = utils.getMainLayer()
    mainLayer.add(budGroup)
    this.konvaObj = budGroup
    if (this.loaded === false) {
      utils.addToNewObjs(objId)
    }
  }
  undo = () => {
    this.konvaObj.destroy()
    this.del = true
  }
  redo = () => {
    this.del = false
    this.init(this.objId)
    this.position = {x: this.x, y: this.y}
  }
  delete = () => {
  }
  constructor(nextObjId, x, y, loaded=false) { // loaded meaning loaded from database
    nextObjId = Number(nextObjId)
    this.loaded = loaded
    console.log(this.loaded)
    this.init(nextObjId)
    this.position = {x: x, y: y}
    utils.addObjs({[Number(nextObjId)]: this})
  }
}
export { Bud }