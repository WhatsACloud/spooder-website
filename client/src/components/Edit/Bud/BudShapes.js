import React, { useEffect, useState } from 'react'
import * as utils from '../utils'
import Konva from 'konva'
import { Silk } from '../Silk/SilkShape'
import * as drawConfig from './konvaDrawConfigs'

const isArray = (val) => { return val.constructor === Array }
const isObject = (val) => { return val.constructor === Object }

const compare = (var1, var2, func=null) => { // checks if is object or array, and does things accordingly
  if (isObject(var1) && isObject(var2)) {
    if (!(compareObjects(var1, var2))) return false
  } else if (isArray(var1) && isArray(var2)) {
    if (!(compareArrays(var1, var2))) return false
  } else {
    return func ? func() : true
  }
  return true
}

const compareArrays = (arr1, arr2) => {
  if (!(isArray(arr1)) || !(isArray(arr2))) return false
  if (arr1.length !== arr2.length) return false
  for (const e of arr1) {
    if (!(arr2.includes(e))) return false
  }
  return true
}

const compareObjects = (arr1, arr2) => {
  if (!(isObject(arr1)) || !(isObject(arr2))) return false
  if (arr1.length !== arr2.length) return false
  for (const key of Object.keys(arr1)) {
    const same = compare(arr1[key], arr2[key], () => {
      if (arr1[key] !== arr2[key]) return false
      return true
    })
    if (!same) return false
  }
  return true
}

class BudJson {
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
  proxyDelete = (target, property) => {
    delete target[property]
    BudJson.checkForUpdate(property)
    return true
  }
  arrProxySet = (target, property, value) => {
    let plsCheck = false
    if (property === "length") plsCheck = true
    if (!target.includes(value)) plsCheck = true
    if (plsCheck) {
      Reflect.set(target, property, value)
      this.checkForUpdate(property)
      return true
    }
    return false
  }
  objProxySet = (target, property, value) => {
    Reflect.set(target, property, value)
    this.checkForUpdate(property)
    return true
  }
  arrProxyConfig = {
    deleteProperty: this.proxyDelete,
    set: this.arrProxySet
  }
  objProxyConfig = {
    deleteProperty: this.proxyDelete,
    set: this.objProxySet
  }
  checkForUpdate(attr) {
    if (this.initialising) return
    if (attr === 'x' || attr === 'y') attr = 'position'
    const var1 = this._originalJson[attr]
    const var2 = this.json[attr]
    let check = false
    if (var1.constructor !== var2.constructor) throw new Error(`WARNING: setting ${var1} of type ${typeof var1} as ${var2} which is of type ${typeof var2}`)
    if (isArray(var1)) {
      if (!(compareArrays(var1, var2))) check = true
    } else if (isObject(var1)) {
      if (!(compareObjects(var1, var2))) check = true
    } else {
      if (var1 !== var2) check = true
    }
    if (check) {
      console.log(this, var1, var2)
      utils.addToNewObjs(this.objId)
    } else {
      utils.delFromNewObjs(this.objId)
    }
  }
  initialising = true
  get word() { return this.json.word }
  get definition() { return this.json.definition }
  get sound() { return this.json.sound }
  get context() { return this.json.context }
  get example() { return this.json.example }
  get link() { return this.json.link }
  get attachedTos() { return this.json.attachedTos }
  get position() { return this.json.position }
  get objId() { return this.json.objId }
  set word(word) { this.checkForUpdate('word'); this.json.word = word }
  set definition(definition) { this.checkForUpdate('definition'); this.json.definition = definition}
  set sound(sound) { this.checkForUpdate('sound'); this.json.sound = sound}
  set context(context) { this.checkForUpdate('context'); this.json.context = context}
  set example(example) { this.checkForUpdate('example'); this.json.example = example}
  set link(link) { this.checkForUpdate('link'); this.json.link = link}
  set attachedTos(attachedTos) { this.checkForUpdate('attachedTos'); this.json.attachedTos = new Proxy(attachedTos, this.arrProxyConfig)}
  set position(position) { this.checkForUpdate('position'); this.json.position = new Proxy(position, this.objProxyConfig)}
  set objId(objId) { this.checkForUpdate('objId'); this.json.objId = objId }
  json = JSON.parse(JSON.stringify(BudJson.base))
  _originalJson = null
  constructor(leJson) {
    for (const attr of Object.keys(this.json)) {
      if (!(attr in leJson)) {
        console.warn(`WARNING: given JSON does not contain (${attr}) of type ${typeof this.json[attr]} (${this.objId})`)
        continue
      } else if (BudJson.base[attr] !== null && !(typeof BudJson.base[attr] === typeof leJson[attr])) {
        console.warn(`WARNING: (${leJson[attr]}) should be of type ${typeof this.json[attr]}, not ${typeof leJson[attr]}. (${this.objId})`)
        continue
      }
      this[attr] = leJson[attr]
    }
    this._originalJson = JSON.parse(JSON.stringify(this.json))
    this.initialising = false
  }
}

class Bud {
  loaded = null
  konvaObj = null
  dragging = false
  del = false
  parsed = false

  json = null
  setJsonAttr(attr, val) {
    const equals = this.json[attr] !== val
    const arrayEquals = isArray(val) ? compareArrays(this.json[attr], val) : false
    const objectEquals = isObject(val) ? compareObjects(this.json[attr], val) : false
    if (equals || arrayEquals || objectEquals) {
      this.json[attr] = val
      return
    }
  }
  getJsonAttr(attr) {
    return this.json[attr]
  }

  get objId() { return this.json.objId }
  set objId(id) { this.json.objId = id }

  originalPos = {x: null, y: null}

  get x() {return this.json.position.x}
  get y() {return this.json.position.y}
  set x(leX) {
    this.json.position.x = leX
    this.updateKonvaObj(leX)
  }
  set y(leY) {
    this.json.position.y = leY
    this.updateKonvaObj(null, leY)
  }

  originalAttachedTos = []
  attachedSilk = {}
  get attachedTos() { return this.json.attachedTos }
  setAttachedTos = (attachedTos) => {
    this.json.attachedTos = attachedTos
    for (const attachedToId of attachedTos) {
      const attachedBud = utils.getObjById(attachedToId)
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

  updateKonvaObj = (leX, leY) => {
    const { x, y } = utils.calcKonvaPosByPos({x: leX ?? this.x, y: leY ?? this.y})
    if (x) this.konvaObj.setX(x)
    if (y) this.konvaObj.setY(y)
  }
  dragStart = () => {
    this.dragging = true
  }
  click = () => {
    const modes = utils.getGlobals().modes
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
      const selected = utils.getGlobals().selected
      if (selected.type === utils.ObjType.Bud) {
        const bud1 = utils.getObjById(selected.id)
        const silkId = utils.getNextSilkId()
        new Silk(silkId, bud1, this)
      }
    } else {
      this.select()
    }
  }
  checkForJsonUpdate() {
  }
  updateSilks = () => {
    for (const silk of Object.values(this.attachedSilk)) {
      silk.updateKonvaObj()
    }
  }
  calcNewPos = () => {
    const { x, y } = utils.calcPosByKonvaPos(this.konvaObj.getX(), this.konvaObj.getY())
    return {newX: x, newY: y}
  }
  dragMove = () => {
    // const { newX, newY } = this.calcNewPos()
    // this.x = newX
    // this.y = newY
    this.updateSilks()
  }
  dragEnd = () => {
    this.dragging = false
    const oldX = this.x
    const oldY = this.y
    const { newX, newY } = this.calcNewPos()
    const undoFunc = () => {
      this.x = oldX
      this.y = oldY
      this.updateSilks()
    }
    const redoFunc = () => {
      this.x = newX
      this.y = newY
      this.updateSilks()
    }
    utils.addToHistory(undoFunc, redoFunc)
    redoFunc()
  }
  fromJson = (leJson) => {
    this.json = new BudJson(leJson)
  }
  select = () => {
    const budShape = this.konvaObj.children[0]
    const selectFunc = () => {
      budShape.setStrokeWidth(5)
      budShape.setStroke('black')
    }
    const unselectFunc = () => {
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
  constructor(nextObjId, x=null, y, loaded=false) { // loaded meaning loaded from database
    utils.addObjs({[nextObjId]: this})
    if (x === null) return
    this.json = new BudJson(BudJson.base)
    nextObjId = Number(nextObjId)
    this.loaded = loaded
    this.position = {x: x, y: y}
    this.init(nextObjId, loaded)
  }
}
export { Bud }