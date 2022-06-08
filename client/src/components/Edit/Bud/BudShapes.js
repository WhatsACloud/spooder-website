import React, { useEffect, useState } from 'react'
import * as utils from '../utils'
import Konva from 'konva'
import { Silk } from '../Silk/SilkShape'
import * as drawConfig from './konvaDrawConfigs'

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
  konvaObj = null
  dragging = false
  del = false
  parsed = false

  json = JSON.parse(JSON.stringify(Bud.base))

  get objId() { return this.json.objId }
  set objId(id) { this.json.objId = id }

  oldX = null
  oldY = null

  originalPos = {x: null, y: null}

  get position() {return this.json.position}
  get x() {return this.position.x}
  get y() {return this.position.y}
  set position(lePos) {
    if (!(isNaN(lePos.x)) && !(isNaN(lePos.y))) {
      this.json.position = lePos
      if (this.konvaObj) {
        this.updateKonvaObj()
      }
      return
    }
    console.warn(`WARNING: position given is invalid, given ${lePos} (bud ${this.objId})`)
  }
  set x(leX) {
    this.position.x = leX
    this.updateKonvaObj(leX)
  }
  set y(leY) {
    this.position.y = leY
    this.konvaObj.setY(utils.calcKonvaPosByPos({x: this.x, y: leY}).y) // reason being calculation of konvaObj by rootPos was a nightmare sooooo just in case
  }

  originalAttachedTos = []
  attachedSilk = {}
  get attachedTos() { return this.json.attachedTos }
  setAttachedTos = (attachedTos) => {
    this.json.attachedTos = attachedTos
    for (const attachedToId of attachedTos) {
      const attachedBud = utils.getObjById(attachedToId)
      console.log(attachedToId, attachedBud)
      if (!attachedBud) {
        const silkId = utils.getNextSilkId()
        new Silk(silkId, false, this)
      } else {
        attachedBud.attachedSilk[this.objId].fillInBud(this)
      }
    }
  }
  addToAttached = (silk) => {
    this.attachedSilk[silk.silkId] = silk
  }
  delFromAttached = (silkId) => {
    delete this.attachedSilk[silkId]
  }

  updateKonvaObj = (leX=this.x, leY=this.y) => {
    const { x, y } = utils.calcKonvaPosByPos({x: leX, y: leY})
    if (x) this.konvaObj.setX(x)
    if (y) this.konvaObj.setY(y)
  }
  dragStart = () => {
    console.log(utils.getObjs(), utils.getGlobals().silkObjs)
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
          utils.addToNewObjs(this.objId)
          utils.addToNewObjs(bud1.objId)
        }
        const undoFunc = () => {
          utils.getGlobals().silkObjs[silkId].delete()
          if (JSON.stringify(this.originalAttachedTos) == JSON.stringify(this.json.attachedTos)) {
            utils.delFromNewObjs(this.objId)
            utils.delFromNewObjs(bud1.objId)
          }
        }
        redoFunc()
        utils.addToHistory(undoFunc, redoFunc)
      }
    } else {
      this.select()
    }
  }
  updateSilks = () => {
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
  init = (objId, loaded=true) => {
    const radius = 40
    const budGroup = new Konva.Group(drawConfig.budGroupConfig(this.x, this.y))
    budGroup.on('dragmove', this.dragMove)
    budGroup.on('dragend', this.dragEnd)
    budGroup.on('click', this.click)
    budGroup.on('dragstart', this.dragStart)
    const budShape = new Konva.Shape(drawConfig.budShapeConfig())
    budGroup.add(budShape)
    const mainLayer = utils.getMainLayer()
    mainLayer.add(budGroup)
    this.konvaObj = budGroup
    if (this.loaded === false) {
      utils.addToNewObjs(objId)
      this.loaded = true
      return
    }
    this.originalPos.x = this.x
    this.originalPos.y = this.y
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
    this.position = {x: x, y: y}
    this.init(nextObjId, loaded)
    utils.addObjs({[nextObjId]: this})
  }
}
export { Bud }