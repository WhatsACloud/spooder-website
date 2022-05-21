import Konva from 'konva'

const getStage = () => {
  return Konva.stages[0] 
}
export { getStage as getStage }

const getMainLayer = () => {
  return getStage().children[0]
}
export { getMainLayer as getMainLayer }

const getKonvaObjs = () => {
  return getMainLayer().children
}
export { getKonvaObjs as getKonvaObjs }

const getObjs = () => {
  return getMainLayer().getAttr('objs')
}
export { getObjs }

const addToHistory = (undoFunc, redoFunc) => {
  console.log('added to history')
  const mainLayer = getMainLayer()
  const history = mainLayer.getAttr('history')
  const historyIndex = mainLayer.getAttr('historyIndex')
  if (history.length > 0 && history[historyIndex+1]) {
    history.splice(historyIndex+1, history.length-historyIndex)
  }
  history.push({undo: undoFunc, redo: redoFunc})
  mainLayer.setAttr('history', history)
  mainLayer.setAttr('historyIndex', historyIndex+1)
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
  mainLayer.setAttr('nextObjId', amt)
}
export { setNextObjId as setNextObjId }

const getNextObjId = () => {
  const mainLayer = getMainLayer()
  const currentNextObjId = mainLayer.getAttr('nextObjId')
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

const updateNewObjs = (objId, obj, alrHistory=false) => {
  const mainLayer = getMainLayer()
  const newObjs = mainLayer.getAttr('newObjs')
  const rootPos = getRootPos()
  const redoFunc = () => {
    const editObjs = {...newObjs}
    editObjs[objId] = obj
    mainLayer.setAttr('newObjs', editObjs)
  }
  if (!alrHistory) {
    const undoFunc = () => {
      mainLayer.setAttr('newObjs', newObjs)
    }
    addToHistory(undoFunc, redoFunc)
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

const addObjs = (toAdd, addObjsToKonva, removeObjsFromKonva) => {
  const layer = getMainLayer()
  const currentObjs = layer.getAttr('objs')
  const redoFunc = () => {
    const newObjs = {...currentObjs, ...toAdd}
    layer.setAttr('objs', newObjs)
    const currentBudObjs = layer.getAttr('budObjs')
    for (const [ objId, toAddObj ] of Object.entries(toAdd)) {
      if (toAddObj.type === "bud") {
        currentBudObjs[objId] = toAddObj
      }
    }
    layer.setAttr('budObjs', currentBudObjs)
    console.log('redo')
    addObjsToKonva(toAdd)
  }
  if (currentObjs) {
    const oldBudObjs = layer.getAttr('budObjs')
    const undoFunc = () => {
      console.log(currentObjs)
      layer.setAttr('objs', currentObjs)
      layer.setAttr('budObjs', oldBudObjs)
      const objIds = Object.keys(toAdd)
      for (const objId of objIds) {
        const konvaObj = getKonvaObjById(objId)
        console.log(konvaObj, objId)
        konvaObj.destroy()
        removeObjsFromKonva(objId) // to make it compatible with react konva
      }
      // console.log(toAdd, objIds)
      setNextObjId(objIds[0]) // bcuz most of the time only one is added
    }
    addToHistory(undoFunc, redo => {
      redoFunc()
      console.log(Object.values(toAdd)[0])
      if (Object.values(toAdd)[0].type !== "bud") {
        console.log('a')
        redo()
      }
    })
  }
  redoFunc()
}
export { addObjs }

const updateObj = (objId, attrs, alrHistory=false) => {
  const mainLayer = getMainLayer()
  const obj = getObjById(objId)
  const konvaObj = getKonvaObjById(objId) 
  let prevPositions 
  if ('positions' in attrs) {
    prevPositions = konvaObj.getAttr('offsetRootPoses')
  }
  let prevPosition
  if ('position' in attrs) {
    konvaObj.setAttr('offsetRootPos', attrs.position)
    const bud = konvaObj.children[0]
    const rootPos = getRootPos()
    bud.setX(attrs.position.x + rootPos.x)
    bud.setY(attrs.position.y + rootPos.y)
  }
  const prevAttachedTo = konvaObj.getAttr('attachedSilkObjId')
  const redoFunc = () => {
    let konvaObj
    const interval = setInterval(() => {
      konvaObj = getKonvaObjById(objId)
      if (konvaObj) {
        clearInterval(interval)
        // console.log(getKonvaObjs(), objId)
        const newObj = {...obj}
        Object.entries(attrs).forEach(([name, val]) => {
          newObj[name] = val
        })
        updateNewObjs(objId, newObj, true)
        if ('position' in attrs) {
          // console.log(konvaObj)
        }
        if ('positions' in attrs) {
          const rootPos = getRootPos()
          konvaObj.children[0].setPoints([
            attrs.positions[0].x + rootPos.x,
            attrs.positions[0].y + rootPos.y,
            attrs.positions[1].x + rootPos.x,
            attrs.positions[1].y + rootPos.y
          ])
          konvaObj.children[1].setX(attrs.positions[0].x + rootPos.x)
          konvaObj.children[1].setY(attrs.positions[0].y + rootPos.y)
          konvaObj.children[2].setX(attrs.positions[1].x + rootPos.x)
          konvaObj.children[2].setY(attrs.positions[1].y + rootPos.y)
        }
        if ('attachedTo' in attrs) {
          konvaObj.setAttr('attachedSilkObjId', attrs.attachedTo)
        }
      }
    }, 100)
  }
  const undoFunc = () => {
    updateNewObjs(objId, obj, true)
    if (prevAttachedTo) konvaObj.setAttr('attachedSilkObjId', prevAttachedTo)
    if (prevPositions) {
      const rootPos = getRootPos()
      // konvaObj.children[0].setPoints([
      //   prevPositions[0],
      //   prevPositions[1],
      //   prevPositions[2],
      //   prevPositions[3],
      // ])
      // konvaObj.children[1].setX(prevPositions[0])
      // konvaObj.children[1].setY(prevPositions[1])
      // konvaObj.children[2].setX(prevPositions[2])
      // konvaObj.children[2].setY(prevPositions[3])
      // console.log(oldRootPos)
      // konvaObj.setAttr('offsetRootPoses', [
      //   {x: prevPositions[0], y: prevPositions[1]},
      //   {x: prevPositions[2], y: prevPositions[3]}
      // ])

      konvaObj.children[0].setPoints([
        prevPositions[0].x + rootPos.x,
        prevPositions[0].y + rootPos.y,
        prevPositions[1].x + rootPos.x,
        prevPositions[1].y + rootPos.y,
      ])
      konvaObj.children[1].setX(prevPositions[0].x + rootPos.x)
      konvaObj.children[1].setY(prevPositions[0].y + rootPos.y)
      konvaObj.children[2].setX(prevPositions[1].x + rootPos.x)
      konvaObj.children[2].setY(prevPositions[1].y + rootPos.y)
      konvaObj.setAttr('offsetRootPoses', prevPositions)
    }
  }
  if (!alrHistory) {
    if (!obj.initialised) {
      addToHistory(undoFunc, redoFunc)
    } else {
      addToHistory(undo => {
        undoFunc()
        undo()
      }, redoFunc)
      delete obj.initialised
    }
  }
  redoFunc()
}
export { updateObj as updateObj }

import 'regenerator-runtime/runtime'
import api from '../../services/api'

const save = async () => {
  const newObjs = getMainLayer().getAttr('newObjs') 
  console.log(newObjs)
  const urlString = window.location.search
  let paramString = urlString.split('?')[1];
  let queryString = new URLSearchParams(paramString);
  try {
    const req = {
      spoodawebId: queryString.get('id'),
      spoodawebData: newObjs
    }
    const result = await api.post('/webs/edit', req)
    console.log(result)
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