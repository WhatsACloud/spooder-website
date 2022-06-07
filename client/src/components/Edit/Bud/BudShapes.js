import React, { useEffect, useState } from 'react'
import * as utils from '../utils'
import * as BudUtils from './BudUtils'
import Konva from 'konva'
import { Silk } from '../Silk/SilkShape'

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

class Bud {
  static base = {
    word: '',
    definition: '',
    sound: '',
    context: '',
    example: '',
    link: 0,
    attachedTos: [],
    position: {x: 0, y: 0},
    objId: null,
  }
  loaded = null
  _position = {x: 0, y: 0}
  originalPos = {x: null, y: null}
  attachedSilk = {}
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
  oldX = null
  oldY = null
  konvaObj = null
  dragging = false
  del = false
  get objId() { return this.json.objId }
  set objId(id) { this.json.objId = id }
  json = {...Bud.base}
  addToAttached = (silk) => {
    this.attachedSilk[silk.silkId] = silk
  }
  delFromAttached = (silkId) => {
    delete this.attachedSilk[silkId]
  }
  dragStart = () => {
    this.dragging = true
    this.oldX = this.x
    this.oldY = this.y
  }
  click = () => {
    console.log('selected')
    const modes = utils.getGlobals().modes
    console.log(this.objId !== utils.getGlobals().selected, modes.gluing)
    if (modes.autoDrag) {
      this.konvaObj.setDraggable(false)
      const mousemove = () => {
        // ill do ltr
      }
      const mouseup = () => {
        this.konvaObj.setDraggable(true)
        document.removeEventListener('mouseup', mouseup)
        document.removeEventListener('mousemove', mousemove)
      }
      document.addEventListener('mouseup', mouseup)
      document.addEventListener('mousemove', mousemove)
    } else if (modes.gluing && (this.objId !== utils.getGlobals().selected)) {
      console.log('pls glue')
      const selected = utils.getGlobals().selected
      if (selected.type === utils.ObjType.Bud) {
        const bud1 = utils.getObjById(selected.id)
        const silkId = utils.getNextSilkId()
        const redoFunc = () => {
          new Silk(silkId, bud1, this)
        }
        const undoFunc = () => {
          utils.getGlobals().silkObjs[silkId].delete()
        }
        redoFunc()
        utils.addToHistory(undoFunc, redoFunc)
      }
    } else {
      this.select()
    }
  }
  updateSilks = () => {
    console.log(this.attachedSilk)
    for (const [ silkId, silk ] of Object.entries(this.attachedSilk)) {
      silk.update()
    }
  }
  calcNewPos = () => {
    const { x, y } = utils.calcPosByKonvaPos(this.konvaObj.getX(), this.konvaObj.getY())
    return {newX: x, newY: y}
  }
  dragMove = () => {
    const { newX, newY } = this.calcNewPos()
    this.x = newX
    this.y = newY
    this.updateSilks()
  }
  dragEnd = () => {
    this.dragging = false
    const oldX = this.oldX
    const oldY = this.oldY
    const { newX, newY } = this.calcNewPos()
    const undoFunc = () => {
      this.x = oldX
      this.y = oldY
      console.log(oldX, this.originalPos.x, oldY, this.originalPos.y)
      if (oldX === this.originalPos.x && oldY === this.originalPos.y) {
        utils.delFromNewObjs(this.objId)
      }
      this.updateSilks()
    }
    const redoFunc = () => {
      console.log('dragEnd redo')
      this.x = newX
      this.y = newY
      utils.addToNewObjs(this.objId)
      this.updateSilks()
    }
    utils.addToHistory(undoFunc, redoFunc)
    redoFunc()
    this.oldX = this.x
    this.oldY = this.y
  }
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
  select = () => {
    const budShape = this.konvaObj.children[0]
    const selectFunc = () => {
      budShape.setStrokeWidth(5)
      budShape.setStroke('black')
    }
    const unselectFunc = () => {
      console.log('unselected')
      budShape.setStrokeWidth(0)
    }
    utils.selectObj(this.objId, utils.ObjType.Bud, budShape, selectFunc, unselectFunc)
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
    budGroup.on('dragmove', this.dragMove)
    budGroup.on('dragend', this.dragEnd)
    budGroup.on('click', this.click)
    budGroup.on('dragstart', this.dragStart)
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
    utils.delFromNewObjs(this.objId)
  }
  redo = () => {
    this.del = false
    this.init(this.objId)
    this.position = {x: this.x, y: this.y}
  }
  constructor(nextObjId, x, y, loaded=false) { // loaded meaning loaded from database
    nextObjId = Number(nextObjId)
    this.loaded = loaded
    this.init(nextObjId)
    this.position = {x: x, y: y}
    if (loaded === true) {
      this.originalPos.x = this.x
      this.originalPos.y = this.y
    }
    utils.addObjs({[Number(nextObjId)]: this})
    this.loaded = true
  }
}
export { Bud }