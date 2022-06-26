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

const getObjs = () => {
  return getGlobals().objs
}
export { getObjs }

const addToHistory = (undoFunc, redoFunc) => {
  const globals = getGlobals()
  const history = globals.history
  const historyIndex = globals.historyIndex
  if (history.length > 0 && history[historyIndex+1]) {
    console.log(historyIndex+1, history.length-historyIndex)
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
      - window.innerWidth * 0.15
    ),
    y: (
      y
      - 40
      - window.innerHeight * 0.1
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
  const padding = 0
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

const addToNewObjs = (objId) => {
  if (objId === null) throw new Error
  const newObjs = getGlobals().newObjs
  if (!(newObjs.includes(objId))) {
    newObjs.push(objId)
  }
}
export { addToNewObjs }

const delFromNewObjs = (objId) => {
  const newObjs = getGlobals().newObjs
  for (let i = 0; i < newObjs.length; i++) {
    const id = newObjs[i]
    if (id === objId) {
      newObjs.splice(i, 1)
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
  console.log('reloaded')
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
}
export { ObjType }

const viewObj = (objId=null) => {
  getReactNamespace('viewing').setVal(objId)
}
export { viewObj }

const selectObj = (obj, type, konvaObj, selectFunc, unselectFunc) => {
  getGlobals().selected = {obj: obj, type: type}
  console.log('selected', getGlobals().selected)
  selectFunc()
  const click = () => {
    if (getGlobals().dragging) {
      getGlobals().dragging = false
      return
    }
    console.log('unselected')
    getGlobals().selected = null
    unselectFunc()
    document.getElementById('divCanvas').removeEventListener('click', click)
  }
  const mouseleave = () => {
    console.log('left')
    document.getElementById('divCanvas').addEventListener('click', click)
    konvaObj.off('mouseleave', mouseleave)
  }
  getGlobals().unselectFunc = click
  konvaObj.on('mouseleave', mouseleave)
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
  return withinRect(mousePos, startX, startY, endX, endY)
}
export { isInCanvas as isInCanvas }

const getNextSilkId = () => {
  return Object.keys(getGlobals().silkObjs).length
}
export { getNextSilkId }

const addToSilks = (silk) => {
  const silks = getGlobals().silkObjs
  // silk.silkId = Object.keys(silks).length
  // console.log(silk)
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
  console.log(newObjs)
  for (const objId of newObjs) {
    const objJson = getObjById(objId).json
    toSend[objId] = objJson.json
    objJson._originalJson = JSON.parse(JSON.stringify(objJson.json))
    console.log(objJson._originalJson, objJson.json)
  }
  try {
    const req = {
      spoodawebId: getGlobals().spoodawebId,
      spoodawebData: toSend
    }
    const result = await api.post('/webs/edit', req)
  } catch(err) {
    err = err.response
    console.log(err)
  }
  getGlobals().newObjs = []
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
  return getGlobals().react[namespace]
}
export { getReactNamespace }