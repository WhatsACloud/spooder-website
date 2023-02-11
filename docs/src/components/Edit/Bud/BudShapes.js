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
    categId: 0,
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
    if (var2 !== null && var1.constructor !== var2.constructor) throw new Error(`WARNING: setting ${var1} of type ${typeof var1} as ${var2} which is of type ${typeof var2}`)
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
  get categId() { return this.json.categId }
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
  set categId(categId) {
    this.json.categId = categId
    const color = utils.getGlobals().categories.getById(categId).color
    const interval = setInterval(() => {
      if (this.bud.konvaObj) {
        this.bud.konvaObj.findOne('#budShape').setAttr('fill', color)
        this.bud.konvaObj.findOne('#budShape').setAttr('shadowColor', color)
        clearInterval(interval)
      }
    }, 100)
    this.checkForUpdate('categId')
  }
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

/*

           YBBBGGGGPPPP5555YJJJ??JJJ??JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ???^           
           #@@@@@@@@&&&&&&&BBGGGBBGGPGGBBBBBBBBBGGGGBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBGGGPG7           
           B@@@@&&&&&&&&&&#GGPGGGP55PPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGBBBBBBBBBBBBGGPPPPP7           
           B@@@&&&&&&&&&&&#GGGGP5555PGGGGGGGGGPGGGGGGGGGGGGGGGGGGGGGGGGGBBBBBBGGGPPPPPPG7           
           B@@@@@@&&&&&&&&BGGP5YY55PGGGGPPPPPPPPPPPPPGGGGGGGGGGGGGGGGGGGGGGGGGGGGP55PPPG?           
           B@@@@@@@&@@@@@&GP5YYY5PPGGGGGPPPPPPPPPPPPPPPPPPPPGPPPPGGGGGGGGGGGGGGGPPP5PPPP7           
           B@@@@@@@@@&&&@&P5YY5PPPGGGGGGGP555PPPPPPPPPPPPPPPPPPPPPPPGGGGGGGGGGGPPPP55PPP7           
           G&&@@@@@@&&&&&G55PPPGGGGGGGGGGGP55555PPPPPPPPPP555555555PPPPGGGGGPPPPP555555P7           
           G&&&@@@@@&&&&GPPPPPPPGGGGGBBBGGG555555PPPPPPPPPPPP555YYYYY55PPPPPPP55555555PP7           
           G&&&&&@&&&&&#PPPGGGGGB###&&&BGGGBG5555PPPPPPPPPPPPPP555YYYY5555555555555555PP7           
           G&&&&&&&&&&&&#####&&&&@@@&&BGGGGB&#GPPPPPPPPGPPPPPPPPPP5555555555YYYY55555PPP7           
           G&&&&&&&&&&&@@@@@@@@@@&&#BGGGGGGGB&&&#BGGGGGGPPPPPPPPPPPPP5555YYYYYYY555PPPPP!           
           G&&&&&&&&&@&&@@@&&##BBBGGGGGGGGGGGPG#&&&&############BGGGPPP5YYYYYJYY55PPPP557           
           G&&&&&&&&&&&&&@@&GGGGGGGGGGGGGGGGGGGGGB&&@@@@@@@@@@@&&&&#GGPP5YJJJJY55PPPP55BY           
           G&&&&&&&&&&&&&&&&#BGGGGGGGGGGGGGGGGGGGGGGBB#&&&@@@@@@@&&&&BGP5YJJJJ5PPGGP5G#&Y           
           G&&&&&&&&&&&&&&&&&&&#BGGGBBBGGGGGGGGGGGGGGGGGGGBBB#&&@@@@&&BG5YJJJYPGGPPG#&&@P           
           G&&&&&&&&&&&&&&&&&&@@&##&&&&&#BBGPGBBGBBBGBGGGGGGGGGGB#&&&&&BPYJJY5PGB##&&@@@5           
           G&&&&&&&&&&&&&&&&@@@@@@@P5#@@@@#GPGBBBBBBBBB#BBBBBGGGGGGGB#&BPYJY5GB&@@@@@@&&5           
           G@&&&&&&&&&&&@@@@@@@@@@5!J#@@&#@#PGBBBBB#&&&&@@&&##BGGGGGGGBBPYJYPG&&BP#@&&&&5           
           G@&&&&&&&&&@@@@@@@@@@@@J7P@@@&&@#PGBBB##&#GG#@@@@@@&#BBBGBBBGYJYG##BBB&@@&&&&5           
           G@&&&&&@&@@@@@@@@@@@@&B#GP#&&@@@GPGBBB#&BJ?P&@&#&@@@@&#BBBBG5JYB#BB#&@@@@@@&@P           
           B@@@@@@@@@@@@@@@@@@@@#5G###&&&#G5GBBBB#&P?Y&@@&B@@@B#@#GPPP5JY####&@@@@@@@@&@P           
           B@@@@@@@@@@@@@@@@@@@@#5PGBBBBG55PGBBBB#&BYYB&&@@@@B5G#PYJJ??JPB#&@@@@@@@@@@@@P           
           B@@@@@@@@&#&@@@@@@@@@&PPPPP55Y5PBBBBB###&#BGB#&&&#BBB5J??777G&@@@@@@@@@@@@@@@G           
           B@@@@@@@@@@&&&&&&&&&&&BPGP55Y5GBBBBBBBB##########BBG5YJ??7Y#@@@@@@@@@@@@@@@@@G           
           B@@@@@@@@@@@@@@&&&&&&@#PP5YYPGGBBBBBGGBBBBBBBBBBGGPP5YYYJ5&@@@@@@@@@@@@@@@@@@G           
           B@@@@@@@@@@@@@@@@&@@@@#55YYPGGGGGGGGGGBGGGGGGGGGGGGGGPP5P&&&#&&&@@@@@@@@@@@@@G           
           #@@@@@@@@@@@@@@@@&&&&&5YY55P5555555PGGGGGGGBBBBBBBBGGP55G&@##&&&&&@@@&&G&@@@@G           
           #@@@@@@@@@@@@@@@@&&&&PYYY55YJJ???JY5PPPGBBBBBBBBBBGGP55&BPB######&&&&@#5@@@@@G           
           #@@@@@@@@@@@@@@@@&&&BYYYYYJ?7777?JYYY5PBBBBBBBBBGGGPY5&@&B#######&&&@&#&@@@@@P           
           #@@@@@@@@@@@@@@@@@&GYJJJ?777!!!7?JYY5GBBBBBBBBBGGP5YY&                                   
           #@@@@@@@@@@@@@@@@&5YJJ??77!777?Y5PPGGGBBBBBBBGGP55Y5&                                    
           #@@@@@@@@@@@@@@@@@BPP5J????JY5PP5YYYYY5PGBBBBGP5YY5&                                     
           #@@@@@@@@@@@@@@@@@&#BBGPPPPGGP5YJJJ???JYPGBBGP55YP                                       
           #@@@@@@@@@@@@@&@@@@@@&&BG#####BGP555PP5JYPBBGP55B                                        
           #@@@@@@@@@@@@@@@@@@@@@@BB&@@&&#BBGP55PGBGGBBGPP#                                         
           YGGGGGGPPPPPPPPPPPPPPP5?J5PPP5YJJJJJ?777?JJ?77Y5555PPPPGGPPPPGGGGGGGGGGGGGGGB?

No separating code into multiple files?

*/


class Bud {
  konvaObj = null
  get shapeObj() {
    return this.konvaObj.findOne('#budShape')
  }
  dragging = false
  new = false
  selected = false
  _followMouse = false
  textObj = null
  tsts = null // time since test started
  loaded = false
  viewing = false
  oldAttachedSilk = null
  type = 'bud'

  get categColor() {
    return utils.getGlobals().categories.getById(this.json?.categId)?.color
  }

	// given a set instead
	hasAtLeastNeighboursRecurse = (trackedSet, neighbourAmt) => {
		const initialExplored = new Set(trackedSet)
		for (const attachedTo of this.attachedTos) {
			trackedSet.add(attachedTo)
		}
		if (trackedSet.length >= neighbourAmt) return true
		for (const attachedTo of this.attachedTos) {
			if (attachedTo in initialExplored) continue
			if (utils.getObjById(attachedTo).hasAtLeastNeighboursRecurse(trackedSet, neighbourAmt)) return true
		}
		return false
	}

	hasAtLeastNeighbours = (neighbourAmt) => {
		if (this.attachedTos.length === 0) return false
		const tracked = new Set()
		tracked.add(this.objId)
		const toExplore = [this.objId]
		const explored = new Set()
		while (toExplore.length > 0) {
			const current = toExplore.shift()
			const currentObj = utils.getObjById(current)
			//console.log(current, currentObj.attachedTos, [...explored], [...tracked])
			for (const attachedTo of currentObj.attachedTos) {
				tracked.add(attachedTo)
				//console.log(current, attachedTo, [...explored], [...toExplore], explored.has(attachedTo), toExplore.includes(attachedTo))
				if (!(explored.has(attachedTo)) && !(toExplore.includes(attachedTo))) {
					toExplore.push(attachedTo)
				}
			}
			explored.add(current)
			if (tracked.size >= neighbourAmt) return true
		}
		return false
	}

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
    utils.getGlobals().dragging = true
  }
  click = (e) => {
    e.cancelBubble = true
    console.log(e.evt.button)
    if(e.evt.button !== 0) return
    if (e.evt.shiftKey) {
      this.select()
      return
    }
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
    } else if (modes.gluing && (this !== utils.getGlobals().selected.buds[this.objId])) {
      const selectedItems = utils.getGlobals().selected.buds
      for (const { obj } of Object.values(selectedItems)) {
        const silkId = utils.getNextSilkId()
        new Silk(silkId, obj, this)
      }
    } else {
      this.select(true)
    }
  }
  dblclick = () => {
    this.view()
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
    utils.getGlobals().dragging = false
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
  view = () => {
    utils.viewObj(this.objId)
    this.viewing = true
    // this.select(true)
    this.unselect()
  }
  _select = () => {
    this.selected = true
    const highlight = new Konva.Shape(drawConfig.budShapeConfig())
    highlight.id('highlight')
    const offset = 5
    highlight.setAttr('radius', 40 + offset)
    highlight.setAttr('fill', 'black')
    this.konvaObj.add(highlight)
    highlight.setZIndex(0)
  }
  unselect = () => {
    this.selected = false
    const highlight = this.konvaObj.findOne('#highlight')
    highlight?.destroy()
  }
  select = (clear=false) => {
    const budShape = this.shapeObj
    utils.selectObj(this, utils.ObjType.Bud, this._select, clear)
  }
  init = (position, _objId) => {
    this.loaded = true
    const radius = 40
    let pos
    if (position) {
      pos = position
    } else {
      pos = {x: this.x, y: this.y}
    }
    let objId
    if (_objId) {
      objId = _objId
    } else {
      objId = this.objId
    }
    const konvaPos = utils.calcKonvaPosByPos({x: pos.x, y: pos.y})
    const budGroup = new Konva.Group(drawConfig.budGroupConfig(konvaPos.x, konvaPos.y, objId))
    budGroup.on('dragmove', this.dragMove)
    budGroup.on('dragend', this.dragEnd)
    budGroup.on('click', this.click)
    budGroup.on('dblclick', this.dblclick)
    budGroup.on('dragstart', this.dragStart)
    budGroup.on('mousedown', this.mouseDown)
    budGroup.on('mouseup', (e) => { e.cancelBubble = true })
    const budShape = new Konva.Shape(drawConfig.budShapeConfig())
    budShape.setAttr('fill', this.categColor)
    budShape.setAttr('shadowColor', this.categColor)
    budGroup.add(budShape)
    utils.getBudGroup().add(budGroup)
    this.konvaObj = budGroup
  }
  _delete = () => { // for polymorphism
    this.undo()
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
    if (!this.loaded && !(this.del)) {
      this.init()
      this.setText(this.json.word)
      for (const silk of Object.values(this.attachedSilk)) {
        silk.init()
      }
      if (this.objId in utils.getGlobals().selected.buds) this.select()
    }
  }
  undo = () => {
    this.konvaObj.destroy()
    this.textObj = null
    this.oldAttachedSilk = {...this.attachedSilk}
    for (const silk of Object.values(this.attachedSilk)) {
      silk._delete()
    }
    if (this.new) {
      utils.delFromNewObjs(this.objId)
      return
    }
    this.del = true
    this.loaded = false
  }
  restore = () => { this.redo() } // for polymorphism
  redo = () => {
    this.del = false
    this.init()
    this.setText(this.json.word)
    for (const silk of Object.values(this.oldAttachedSilk)) {
      silk.restore()
    }
    if (this.new) {
      utils.addToNewObjs(this.objId)
    }
  }
  initSilk = () => {
  }
  constructor(nextObjId, x=null, y) {
    utils.addObjs({[nextObjId]: this})
    if (x === null) return
    this.json = new BudJson(this, JSON.parse(JSON.stringify(BudJson.base)))
    this.json.initialising = true
    this.new = true
    nextObjId = Number(nextObjId)
    this.init(null, nextObjId)
    this.x = x
    this.y = y
    this.objId = nextObjId
    this.json.initialising = false
  }
}
export { Bud }
