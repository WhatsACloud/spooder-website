import React, { useEffect, useState } from 'react'
import * as utils from '../utils'
import Konva from 'konva'
import { Silk } from '../Silk/SilkShape'
import * as drawConfig from './konvaDrawConfigs'
import { setBud } from './BudUtils'

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
    del: false,
  }
  
  attachedTosProxyDelete = (target, property) => {
    const attachedTo = target[property]
    const bud = utils.getObjById(attachedTo)
    delete target[property]
    delete this.attachedSilk[attachedTo]
    delete bud.attachedSilk[this.objId]
    this.checkForUpdate('attachedTos')
    return true
  }
  
  attachedTosProxySet = (target, property, value) => {
    if (property !== "length") {
      if (!target.includes(value)) {
        Reflect.set(target, property, value)
        this.checkForUpdate('attachedTos')
        return true
      }
    }
    return true
  }
  attachedTosProxyGet = (target, property) => {
    if (property === "splice") {
      const origMethod = target[property]
      return (...args) => {
        origMethod.apply(target, args)
        this.checkForUpdate('attachedTos')
      }
    }
    return target[property]
  }
  objProxyDelete = (target, property) => {
    delete target[property]
    this.checkForUpdate(property)
    return true
  }
  objProxySet = (target, property, value) => {
    Reflect.set(target, property, value)
    this.checkForUpdate(property)
    return true
  }
  attachedTosProxyConfig = {
    deleteProperty: this.attachedTosProxyDelete,
    set: this.attachedTosProxySet,
    get: this.attachedTosProxyGet
  }
  objProxyConfig = {
    deleteProperty: this.objProxyDelete,
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
      utils.addToNewObjs(this.objId)
    } else {
      utils.delFromNewObjs(this.objId)
    }
  }
  attachedSilk = {}
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
  get del() { return this.json.del }
  set word(word) {
    this.bud.setText(word)
    this.json.word = word
    this.checkForUpdate('word')
  }
  set definition(definition) { this.json.definition = definition; this.checkForUpdate('definition') }
  set sound(sound) { this.json.sound = sound; this.checkForUpdate('sound') }
  set context(context) { this.json.context = context; this.checkForUpdate('context') }
  set example(example) { this.json.example = example; this.checkForUpdate('example') }
  set link(link) {
    if (link >= 0 && link <= 1) {
      this.json.link = link
      this.checkForUpdate('link')
    }
  }
  set attachedTos(attachedTos) { this.json.attachedTos = new Proxy(attachedTos, this.attachedTosProxyConfig) }
  set position(position) { this.json.position = new Proxy(position, this.objProxyConfig) }
  set objId(objId) { this.json.objId = objId; this.checkForUpdate('objId') }
  set del(del) { this.json.del = del; this.checkForUpdate('del')}
  json = JSON.parse(JSON.stringify(BudJson.base))
  _originalJson = null
  constructor(bud, leJson) {
    this.bud = bud
    for (const attr of Object.keys(this.json)) {
      if (attr === 'del') continue
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
  konvaObj = null
  dragging = false
  new = false
  selected = false
  _followMouse = false
  textObj = null
  tsts = null // time since test started
  loaded = false
  mouseFollower = (e) => {
    const { x, y } = utils.getCanvasMousePos(e.clientX, e.clientY)
    this.konvaObj.setX(x)
    this.konvaObj.setY(y)
    this.updateSilks()
  }
  mouseFollowerUp = (e) => {
    document.removeEventListener('mouseup', this.mouseFollowerUp)
    document.removeEventListener('mousemove', this.mouseFollower)
    const canvasMousePos = utils.getCanvasMousePos(e.clientX, e.clientY)
    const { x, y } = utils.calcPosByKonvaPos(canvasMousePos.x, canvasMousePos.y)
    this.x = x
    this.y = y
    this.followMouse = false
  }
  get followMouse() { return this._followMouse }
  set followMouse(followMouse) {
    if (followMouse) {
      document.addEventListener('mousemove', this.mouseFollower)
      document.addEventListener('mouseup', this.mouseFollowerUp)
    } else {
      document.removeEventListener('mousemove', this.mouseFollower)
      document.removeEventListener('mouseup', this.mouseFollowerUp)
    }
    this._followMouse = followMouse
  }
  get del() { return this.json.del }
  set del(del) { this.json.del = del }
  parsed = false

  json = null

  get objId() { return this.json.objId }
  set objId(id) { this.json.objId = id }

  get position() { return this.json.position }

  get x() {return this.position.x}
  get y() {return this.position.y}
  set x(leX) {
    this.json.position.x = leX
    this.updateKonvaObj(leX)
  }
  set y(leY) {
    this.json.position.y = leY
    this.updateKonvaObj(null, leY)
  }

  get attachedSilk() { return this.json.attachedSilk }

  get attachedTos() { return this.json.attachedTos }

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
    } else if (modes.gluing && (this !== utils.getGlobals().selected.obj)) {
      const selected = utils.getGlobals().selected
      if (selected.type === utils.ObjType.Bud) {
        const bud = selected.obj
        const silkId = utils.getNextSilkId()
        new Silk(silkId, bud, this)
      }
    } else {
      this.select()
    }
  }
  setText = (word) => {
    const fontSize = 50
    const wordLength = word.length
    const calcX = () => -(wordLength / 4 * fontSize)
    const calcY = () => -(wordLength / 6 * fontSize)
    if (word) {
      if (!this.textObj) {
        const text = new Konva.Text({
          text: word,
          fontSize: fontSize,
          x: calcX(),
          y: calcY(),
          fill: 'white',
          shadowColor: 'black',
          shadowOffset: {x: 2, y: 2},
        })
        this.textObj = text
        this.konvaObj.add(text)
        console.log(word, 'text', this.konvaObj)
        return
      }
      this.textObj.setText(word)
      this.textObj.setX(calcX())
      this.textObj.setY(calcY())
    } else {
      if (this.textObj) { this.destroyText() }
    }
  }
  destroyText = () => {
    this.textObj.destroy()
    this.textObj = null
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
  mouseDown = (e) => {
    const globals = utils.getGlobals()
    if (globals.modes.autoDrag) {
      this.konvaObj.setDraggable(false)
      const objId = utils.getNextObjId()
      const bud = new Bud(objId, this.x, this.y)
      utils.setNextObjId(objId+1)
      new Silk(utils.getNextSilkId(), bud, this, true)
      const redoFunc = () => {
        bud.redo()
        utils.setNextObjId(objId+1)
        new Silk(utils.getNextSilkId(), bud, this, true)
      }
      const undoFunc = () => {
        bud.undo()
        utils.setNextObjId(objId)
      }
      bud.followMouse = true
      utils.addToHistory(undoFunc, redoFunc)
    }
    const func = () => {
      this.konvaObj.setDraggable(true)
      document.removeEventListener('mouseup', func)
    }
    document.addEventListener('mouseup', func)
    e.cancelBubble = true
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
    this.json = new BudJson(this, leJson)
  }
  select = () => {
    this.selected = true
    utils.viewObj(this.objId)
    const budShape = this.konvaObj.children[0]
    const selectFunc = () => {
      budShape.setStrokeWidth(5)
      budShape.setStroke('black')
    }
    const unselectFunc = () => {
      budShape.setStrokeWidth(0)
    }
    utils.selectObj(this, utils.ObjType.Bud, budShape, selectFunc, unselectFunc)
  }
  init = (position) => {
    this.loaded = true
    const radius = 40
    let pos
    if (position) {
      pos = position
    } else {
      pos = {x: this.x, y: this.y}
    }
    const konvaPos = utils.calcKonvaPosByPos({x: pos.x, y: pos.y})
    const budGroup = new Konva.Group(drawConfig.budGroupConfig(konvaPos.x, konvaPos.y))
    budGroup.on('dragmove', this.dragMove)
    budGroup.on('dragend', this.dragEnd)
    budGroup.on('click', this.click)
    budGroup.on('dragstart', this.dragStart)
    budGroup.on('mousedown', this.mouseDown)
    budGroup.on('mouseup', (e) => { e.cancelBubble = true })
    const budShape = new Konva.Shape(drawConfig.budShapeConfig())
    budGroup.add(budShape)
    utils.getBudGroup().add(budGroup)
    this.konvaObj = budGroup
  }
  delete = () => {
    this.undo()
    utils.addToHistory(this.redo, this.undo)
  }
  unload = () => {
    if (this.loaded) {
      this.konvaObj.destroy()
      this.textObj = null
      const [ bounds1, bounds2 ] = utils.calcScreenBounds()
      for (const silk of Object.values(this.attachedSilk)) {
        const pos1in = utils.withinRect(bounds1, bounds2, silk.pos1)
        const pos2in = utils.withinRect(bounds1, bounds2, silk.pos2)
        if (pos1in || pos2in) continue
        silk.unload()
      }
      this.loaded = false
    }
  }
  load = () => {
    if (!this.loaded) {
      this.init()
      this.setText(this.json.word)
      for (const silk of Object.values(this.attachedSilk)) {
        silk.init()
      }
    }
  }
  undo = () => {
    this.konvaObj.destroy()
    for (const silk of Object.values(this.attachedSilk)) {
      silk._delete()
    }
    if (this.new) {
      utils.delFromNewObjs(this.objId)
      return
    }
    this.del = true
  }
  redo = () => {
    this.del = false
    this.init()
    this.updateKonvaObj()
    if (this.new) {
      utils.addToNewObjs(this.objId)
    }
  }
  constructor(nextObjId, x=null, y) {
    utils.addObjs({[nextObjId]: this})
    if (x === null) return
    this.json = new BudJson(this, JSON.parse(JSON.stringify(BudJson.base)))
    this.json.initialising = true
    this.new = true
    nextObjId = Number(nextObjId)
    this.init()
    this.x = x
    this.y = y
    this.objId = nextObjId
    this.json.initialising = false
  }
}
export { Bud }