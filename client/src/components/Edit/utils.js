import Konva from 'konva'

const getStage = () => {
  return Konva.stages[0] 
}
export { getStage }

const getGlobals = () => {
  return window.spoodawebVars
}
export { getGlobals }

const getMainLayer = () => {
  return getStage().children[0]
}
export { getMainLayer }

const getBudGroup = () => {
  return getMainLayer().children[1]
}
export { getBudGroup }

const getSilkGroup = () => {
  return getMainLayer().children[0]
}
export { getSilkGroup }

const getSilkById = (id) => {
  const silks = getGlobals().silkObjs
  return silks[Number(id)]
}
export { getSilkById }

const getObjs = () => {
  return getGlobals()?.objs
}
export { getObjs }

const addToHistory = (undoFunc, redoFunc) => {
  const globals = getGlobals()
  const history = globals.history
  const historyIndex = globals.historyIndex
  if (history.length > 0 && history[historyIndex+1]) {
    history.splice(historyIndex+1, history.length-historyIndex)
  }
  history.push({undo: undoFunc, redo: redoFunc})
  globals.history = history
  globals.historyIndex = historyIndex+1
}
export { addToHistory }

const getCanvasMousePos = (x, y) => {
  return {
    x: (
      x
    ),
    y: (
      y
      - window.innerHeight * 0.08
    )
  }
}
export { getCanvasMousePos }

const calcScreenBounds = () => {
  const rootPos = getRootPos()
  const bound1 = getCanvasMousePos(-rootPos.x, -rootPos.y)
  bound1.x = -rootPos.x
  const divCanvas = document.getElementById('divCanvas')
  const bound2 = { x: bound1.x + divCanvas.offsetWidth, y: bound1.y + divCanvas.offsetHeight }
  const padding = 500
  bound1.x -= padding
  bound1.y -= padding
  bound2.x += padding
  bound2.y += padding
  return [ bound1, bound2 ]
}
export { calcScreenBounds }

const withinRect = (start, end, point) => {
  const x = point.x
  const y = point.y
  if (end.x < start.x && end.y < start.y) {
    const leStart = start
    start = end
    end = leStart
  }
  if (start.x - end.x >= 0) {
    const leStart = {...start}
    start = {x: end.x, y: start.y}
    end = {x: leStart.x, y: end.y}
  }
  if (start.y - end.y >= 0) {
    const leStart = {...start}
    start = {x: start.x, y: end.y}
    end = {x: end.x, y: leStart.y}
  }
  const xStartIn = x > start.x
  const yStartIn = y > start.y
  const xEndIn = x < end.x
  const yEndIn = y < end.y
  if (xStartIn && yStartIn && xEndIn && yEndIn) {
    return true
  }
  return false
}
export { withinRect }

const inRange = (start, end, num) => {
  const within1 = start <= num && end >= num
  const within2 = end <= num && start >= num
  return within1 || within2
}

const linesIntersect = (line1, line2) => {
  const slope1 = (line1[0].y - line1[1].y) / (line1[0].x - line1[1].x)
  const c1 = line1[0].y - (slope1 * line1[0].x)
  const slope2 = (line2[0].y - line2[1].y) / (line2[0].x - line2[1].x)
  const c2 = line2[0].y - (slope2 * line2[0].x)
  // 0 = slope1 * x + c1 - y
  // 0 = slope2 * x + c2 - y
  // (slope1 * x) + c1 = (slope2 * x) + c2
  // (slope1 - slope2) * x =  c2 - c1
  const x = (c2 - c1) / (slope1 - slope2)
  const y = slope1 * x + c1

  const within1x = inRange(line1[0].x, line1[1].x, x)
  const within2x = inRange(line2[0].x, line2[1].x, x)

  const within1y = inRange(line1[0].y, line1[1].y, y)
  const within2y = inRange(line2[0].y, line2[1].y, y)
  return within1x && within2x && within1y && within2y
}
export { linesIntersect }

const setNextObjId = (amt) => {
  getGlobals().nextObjId = amt
}
export { setNextObjId as setNextObjId }

const getNextObjId = () => {
  const currentNextObjId = getGlobals().nextObjId
  return currentNextObjId
}
export { getNextObjId as getNextObjId }

const getNextHighestAttr = (arr, attrName) => {
  const attrs = []
  for (const e of arr) {
    attrs.push(e[attrName])
  }
  if (attrs.length > 0) {
    const result = Math.max(...attrs)
    if (!isNaN(result)) return result+1
  } else return 0
}
export { getNextHighestAttr }

let timeout

const sendSaveEvt = () => {
  console.log('ran')
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    console.log('this is infuriating')
    const evt = new CustomEvent('save', {
      detail: {
        status: true,
      }
    })
    document.dispatchEvent(evt)
  }, 500)
}

const addToNewObjs = (objId) => {
  if (objId === null) throw new Error
  const newObjs = getGlobals().newObjs
  if (!(newObjs.includes(objId))) {
    newObjs.push(objId)
    sendSaveEvt()
  }
}
export { addToNewObjs }

const delFromNewObjs = (objId) => {
  const newObjs = getGlobals().newObjs
  for (let i = 0; i < newObjs.length; i++) {
    const id = newObjs[i]
    if (id === objId) {
      newObjs.splice(i, 1)
      sendSaveEvt()
    }
  }
}
export { delFromNewObjs }

const getRootPos = () => {
  return getGlobals().rootPos
}
export { getRootPos }

const calcKonvaPosByPos = (pos, leRootPos=null) => {
  const rootPos = leRootPos || getRootPos()
  return {
    x: pos.x + rootPos.x,
    y: pos.y + rootPos.y,
  }
}
export { calcKonvaPosByPos }

const calcPosByKonvaPos = (x, y, leRootPos=null) => {
  const rootPos = leRootPos || getRootPos()
  return {
    x: x - rootPos.x,
    y: y - rootPos.y,
  }
}
export { calcPosByKonvaPos }

const setCursor = (cursorType) => {
  document.getElementById('root').style.cursor = cursorType
}
export { setCursor }

const reloadObjs = () => {
  const [ bound1, bound2 ] = calcScreenBounds()
  for (const [ objId, obj ] of Object.entries(getObjs())) {
    const inRect = withinRect(bound1, bound2, obj.position)
    if (!inRect) obj.unload()
    if (inRect) obj.load()
  }
}
export { reloadObjs }

import * as BudUtils from './Bud/BudUtils'

const setRootPos = (rootPos) => {
  getGlobals().rootPos = rootPos
  for (const [ objId, obj ] of Object.entries(getObjs())) {
    if (!obj.dragging) {
      obj.updateKonvaObj()
    }
  }
  for (const [ silkId, silk ] of Object.entries(getGlobals().silkObjs)) {
    silk.updateKonvaObj()
  }
}
export { setRootPos }

class ObjType {
  static Bud = Symbol("bud")
  static Silk = Symbol("Silk")
  static All = Symbol("All")
  static Default = Symbol("Default")
}
export { ObjType }

const viewObj = (objId=null) => {
  getReactNamespace('viewing').setVal(objId)
  getGlobals().viewing = objId
}
export { viewObj }

const clearSelected = () => {
  for (const { obj } of Object.values(getGlobals().selected)) {
    obj.unselect()
  }
  getGlobals().selected = {}
}
export { clearSelected }

const selectObj = (obj, type, selectFunc, clear=false) => {
  const objId = obj.objId || obj.silkId
  if (clear) clearSelected()
  getGlobals().selected[objId] = {obj: obj, type: type}
  selectFunc()
}
export { selectObj }

const unselect = () => {
  if (getGlobals().unselectFunc) {
    getGlobals().unselectFunc()
  }
}
export { unselect }

const isInCanvas = (mousePos) => {
  const startX = window.innerWidth * 0.15
  const startY = 0
  const endX = window.innerWidth
  const endY = window.innerHeight
  return withinRect({x: startX, y: startY}, {x: endX, y: endY}, mousePos)
}
export { isInCanvas as isInCanvas }

const getNextSilkId = () => {
  return Object.keys(getGlobals().silkObjs).length
}
export { getNextSilkId }

const addToSilks = (silk) => {
  const silks = getGlobals().silkObjs
  // silk.silkId = Object.keys(silks).length
  silks[silk.silkId] = silk
}
export { addToSilks }

const delFromSilks = (silkId) => {
  const silks = getGlobals().silkObjs
  delete silks[silkId]
}
export { delFromSilks }

const getObjById = (id=null) => {
  const objs = getObjs() 
  if (id === null || !objs) return false
  return objs[id]
}
export { getObjById }

const getHighlighter = () => {
  const stage = getStage()
  const highlighter = stage.find('.highlighter')[0]
  return highlighter
}
export { getHighlighter }

const addObjs = (toAdd) => {
  const globals = getGlobals()
  const currentObjs = globals.objs
  const newObjs = {...currentObjs, ...toAdd}
  globals.objs = newObjs
}
export { addObjs }

import 'regenerator-runtime/runtime'
import api from '../../services/api'
import { select } from './Select'

const save = async () => {
  const newObjs = getGlobals().newObjs
  const toSend = {}
  for (const objId of newObjs) {
    const objJson = getObjById(objId).json
    toSend[objId] = objJson.json
    objJson._originalJson = JSON.parse(JSON.stringify(objJson.json))
  }
  try {
    const req = {
      spoodawebId: getGlobals().spoodawebId,
      categories: getGlobals().categories.toJSON(),
      spoodawebData: toSend,
    }
    const result = await api.post('/webs/edit', req)
    getGlobals().newObjs = []
  } catch(err) {
    err = err.response
    console.log(err)
  }
  // below simulates the thing reloading

  // const rootPos = getRootPos()
  // Object.entries(objs).forEach(([objId, obj]) => {
  //   const konvaObj = getKonvaObjById(objId)
  //   if (obj.type === "bud") {
  //     konvaObj.children[0].setX(obj.position.x + rootPos.x)
  //     konvaObj.children[0].setY(obj.position.y + rootPos.y)
  //   } else {
  //     konvaObj.children[0].setPoints([
  //       obj.positions[0].x + rootPos.x,
  //       obj.positions[0].y + rootPos.y,
  //       obj.positions[1].x + rootPos.x,
  //       obj.positions[1].y + rootPos.y,
  //     ])
  //   }
  // })
} 
export { save }

import React, { useEffect, useState } from 'react'

function SetGlobalSetter({ setVal, namespace }) {
  useEffect(() => {
    getGlobals().react[namespace] = {}
    getGlobals().react[namespace].setVal = setVal
  }, [])
  return <></>
}

function SetGlobalReactSetter({ val, setVal, namespace }) {
  useEffect(() => {
    getGlobals().react[namespace].val = val
    }, [ val ])
  return (
    <SetGlobalSetter setVal={setVal} namespace={namespace}></SetGlobalSetter>
  )
}
export { SetGlobalReactSetter }

const getReactNamespace = (namespace) => {
  if (getGlobals()) {
    return getGlobals().react[namespace]
  }
  return false
}
export { getReactNamespace }

const isFocused = () => {
  return document.activeElement === document.getElementById('root').parentElement
}
export { isFocused }

import { search } from 'fast-fuzzy'

const searchInBud = (query, col) => {
  return search(query, Object.values(getObjs()), { keySelector: (obj) => obj.json[col], returnMatchData: true, ignoreSymbols: false })
    .map(data => {
      return {obj: data.item, string: data.original, key: col}
    })
}

const searchInCateg = (query, col) => {
  return search(query, Object.values(getGlobals().categories.categories), { keySelector: (obj) => obj[col], returnMatchData: true })
    .map(data => {
      return {obj: data.item, string: data.original, key: col}
    })
}

const filterOptions = {
  word: true,
  definition: true,
  sound: true,
  context: true,
  example: true,
  name: true,
}
export { filterOptions }

const searchFor = (query, queryTypes) => {
  if (query.length === 0) return getGlobals()?.recentlyViewed
  const searchSet = new Set()
  for (const [ option, can ] of Object.entries(queryTypes)) {
    if (!can) continue
    if (!(Object.keys(filterOptions).includes(option))) {
      throw new Error(`WARNING: queryType ( ${option} ) is not valid.`)
    }
    if (option === 'name') { searchSet.add(...searchInCateg(query, option)); continue }
    searchSet.add(...searchInBud(query, option))
  }
  const searchResults = [...searchSet]
  const undefinedIndex = searchResults.indexOf(undefined)
  if (undefinedIndex >= 0) {
    searchResults.splice(undefinedIndex, 1)
  }
  return searchResults
}
export { searchFor }

const addToRecentlyViewed = (object) => {
  switch (object.type) {
    case "bud":
      if (getGlobals().inRecentlyViewed.bud[object.json.objId]) return
      getGlobals().inRecentlyViewed.bud[object.json.objId] = true
      break
    case "category":
      if (getGlobals().inRecentlyViewed.category[object.categId]) return
      getGlobals().inRecentlyViewed.category[object.categId] = true
      break
  }
  getGlobals().recentlyViewed.unshift({ obj: object, string: object.json ? object.json.word : object.name })
  if (getGlobals().recentlyViewed.length > 5) {
    getGlobals().recentlyViewed.pop()
  }
}
export { addToRecentlyViewed }

import { Silk } from './Silk/SilkShape'

const link = () => {
  const leSelectedItems = getGlobals().selected
  for (const [ objId, selected1 ] of Object.entries(leSelectedItems)) {
    const selectedItems = {...leSelectedItems}
    delete selectedItems[objId]
    for (const selected2 of Object.values(selectedItems)) {
      if (selected1.type === ObjType.Bud && selected2.type === ObjType.Bud) {
        const bud1 = selected1.obj
        const bud2 = selected2.obj
        const objId2 = bud2.objId
        if (!(bud1.json.attachedTos.includes(objId2))) {
          const silkId = getNextSilkId()
          new Silk(silkId, bud1, bud2)
        }
      }
    }
  }
}
export { link }