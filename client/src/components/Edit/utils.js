import Konva from 'konva'

const getStage = () => {
  return Konva.stages[0] 
}
export { getStage }

const getGlobals = () => {
  console.log(window.spoodawebVars)
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
  const mainLayer = getMainLayer()
  getGlobals().nextObjId = amt
}
export { setNextObjId as setNextObjId }

const getNextObjId = () => {
  const mainLayer = getMainLayer()
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

const updateNewObjs = (objId, obj) => {
  const mainLayer = getMainLayer()
  const newObjs = getGlobals().newObjs
  const rootPos = getRootPos()
  const redoFunc = () => {
    const editObjs = {...newObjs}
    editObjs[objId] = obj
    getGlobals().newObjs = editObjs
  }
  const undoFunc = () => {
    getGlobals().newObjs = newObjs
  }
  redoFunc()
}
export { updateNewObjs }

const getRootPos = () => {
  return getMainLayer().getAttr('rootPos')
}
export { getRootPos as getRootPos }

import * as BudUtils from './Bud/BudUtils'

const setRootPos = (rootPos) => {
  for (let obj of getKonvaObjs()) {
    const type = obj.getAttr('objType')
    if (type === 'bud') {
      const bud = obj.children[0]
      bud.setX(obj.getAttr('offsetRootPos').x + rootPos.x)
      bud.setY(obj.getAttr('offsetRootPos').y + rootPos.y)
    } else if (type === 'silk') {
      const silk = obj.children[0]
      const offsetRootPoses = obj.getAttr('offsetRootPoses')
      silk.setPoints([
        offsetRootPoses[0].x + rootPos.x,
        offsetRootPoses[0].y + rootPos.y,
        offsetRootPoses[1].x + rootPos.x,
        offsetRootPoses[1].y + rootPos.y,
      ])
      obj.children[1].setX(offsetRootPoses[0].x + rootPos.x)
      obj.children[1].setY(offsetRootPoses[0].y + rootPos.y)
      obj.children[2].setX(offsetRootPoses[1].x + rootPos.x)
      obj.children[2].setY(offsetRootPoses[1].y + rootPos.y)
    } else {
    }
  }
  getMainLayer().setAttr('rootPos', rootPos)
}
export { setRootPos as setRootPos }

const isInCanvas = (mousePos) => {
  const startX = window.innerWidth * 0.15
  const startY = 0
  const endX = window.innerWidth
  const endY = window.innerHeight
  return withinRect(mousePos, startX, startY, endX, endY)
}
export { isInCanvas as isInCanvas }

const getKonvaObjById = (id=null) => { // pls make it more efficient
  if (id === null) return false
  const objs = getKonvaObjs()
  for (const obj of objs) {
    if (Number(obj.getAttr('objId')) === Number(id)) {
      return obj
    }
  }
  return false
}
export { getKonvaObjById as getKonvaObjById }

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
  console.log(toAdd[0])
  const globals = getGlobals()
  const currentObjs = globals.getAttr('objs')
  const newObjs = {...currentObjs, ...toAdd}
  globals.setAttr('objs', newObjs)
  const currentBudObjs = globals.getAttr('budObjs')
  for (const [ objId, toAddObj ] of Object.entries(toAdd)) {
    if (toAddObj.type === "bud") {
      currentBudObjs[objId] = toAddObj
    }
  }
  globals.setAttr('budObjs', currentBudObjs)
}
export { addObjs }

const updateObj = (objId, attrs) => {
  const obj = getObjById(objId)
  const konvaObj = getKonvaObjById(objId) 
  if ('position' in attrs) {
    konvaObj.setAttr('offsetRootPos', attrs.position)
    const bud = konvaObj.children[0]
    const rootPos = getRootPos()
    bud.setX(attrs.position.x + rootPos.x)
    bud.setY(attrs.position.y + rootPos.y)
  }
  const prevAttachedTo = konvaObj.getAttr('attachedSilkObjId')
  const newObj = {...obj}
  Object.entries(attrs).forEach(([name, val]) => {
    newObj[name] = val
  })
  updateNewObjs(objId, newObj, true)
  if ('positions' in attrs) {
    const rootPos = getRootPos()
    console.log(attrs)
    konvaObj.children[0].setPoints([
      attrs.positions[0].x,
      attrs.positions[0].y,
      attrs.positions[1].x,
      attrs.positions[1].y,
    ])
    konvaObj.children[1].setX(attrs.positions[0].x)
    konvaObj.children[1].setY(attrs.positions[0].y)
    konvaObj.children[2].setX(attrs.positions[1].x)
    konvaObj.children[2].setY(attrs.positions[1].y)
    konvaObj.setAttr('offsetRootPoses', [
      {
        x: attrs.positions[0].x - rootPos.x,
        y: attrs.positions[0].y - rootPos.y,
      },
      {
        x: attrs.positions[1].x - rootPos.x,
        y: attrs.positions[1].y - rootPos.y,
      }
    ])
  }
}
export { updateObj }

import 'regenerator-runtime/runtime'
import api from '../../services/api'

const save = async () => {
  const newObjs = getMainLayer().getAttr('newObjs') 
  const urlString = window.location.search
  let paramString = urlString.split('?')[1];
  let queryString = new URLSearchParams(paramString);
  try {
    const req = {
      spoodawebId: queryString.get('id'),
      spoodawebData: newObjs
    }
    const result = await api.post('/webs/edit', req)
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
export { save as save }