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
export { getMainLayer as getMainLayer }

const getKonvaObjs = () => {
  return getMainLayer().children
}
export { getKonvaObjs as getKonvaObjs }

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

const getHistory = () => {
  return getMainLayer().getAttr('history')
}
export { getHistory }

const getCanvasMousePos = (x, y) => {
  return {
    x: (
      x
      - window.innerWidth * 0.15
      + divCanvas.scrollLeft
    ),
    y: (
      y
      - 40
      + divCanvas.scrollTop
      - window.innerHeight * 0.1
    )
  }
}
export { getCanvasMousePos }

const withinRect = (mousePos, startX, startY, endX, endY) => {
  const x = mousePos.x
  const y = mousePos.y
  const xStartIn = x > startX
  const yStartIn = y > startY
  const xEndIn = x < endX
  const yEndIn = y < endY
  if (xStartIn && yStartIn && xEndIn && yEndIn) {
    return true
  }
  return false
}

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

import * as BudUtils from './Bud/BudUtils'

const setRootPos = (rootPos) => {
  for (const [ objId, obj ] of Object.entries(getObjs())) {
    if (!obj.dragging) {
      const pos = calcKonvaPosByPos(obj.position, rootPos)
      obj.konvaObj.setX(pos.x)
      obj.konvaObj.setY(pos.y)
    }
  }
  getGlobals().rootPos = rootPos
}
export { setRootPos }

const isInCanvas = (mousePos) => {
  const startX = window.innerWidth * 0.15
  const startY = 0
  const endX = window.innerWidth
  const endY = window.innerHeight
  return withinRect(mousePos, startX, startY, endX, endY)
}
export { isInCanvas as isInCanvas }

const getObjById = (id=null) => {
  if (id === null) return false
  const objs = getObjs() 
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
  console.log(toAdd)
  const globals = getGlobals()
  const currentObjs = globals.objs
  const newObjs = {...currentObjs, ...toAdd}
  globals.objs = newObjs
  const currentBudObjs = globals.budObjs
  for (const [ objId, toAddObj ] of Object.entries(toAdd)) {
    if (toAddObj.type === "bud") {
      currentBudObjs[objId] = toAddObj
    }
  }
  globals.budObjs = currentBudObjs
}
export { addObjs }

import 'regenerator-runtime/runtime'
import api from '../../services/api'

const save = async () => {
  const newObjs = getGlobals().newObjs
  const toSend = {}
  for (const objId of newObjs) {
    toSend[objId] = getObjById(objId).json
  }
  console.log(newObjs)
  console.log(toSend)
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
export { save as save }