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
  console.log(currentNextObjId)
  return currentNextObjId
}
export { getNextObjId as getNextObjId }

const updateNewObjs = (objId, obj) => {
  const mainLayer = getMainLayer()
  const newObjs = mainLayer.getAttr('newObjs')
  console.log(mainLayer)
  console.log(!(Object.keys(newObjs).includes(String(objId))))
  if (!(Object.keys(newObjs).includes(String(objId)))) {
    obj.operation = 'add'
  } else {
    obj.operation = 'edit'
  }
  const rootPos = getRootPos()
  newObjs[objId] = obj
  mainLayer.setAttr('newObjs', newObjs)
}
export { updateNewObjs as updateNewObjs }

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
      const budHitAreas = obj.children[1].children
      BudUtils.updateBudHitGroups(bud, budHitAreas)
    } else if (type === 'silk') {
      const silk = obj.children[0]
      silk.setPoints([
        obj.getAttr('offsetRootPoses')[0].x + rootPos.x,
        obj.getAttr('offsetRootPoses')[0].y + rootPos.y,
        obj.getAttr('offsetRootPoses')[1].x + rootPos.x,
        obj.getAttr('offsetRootPoses')[1].y + rootPos.y,
      ])
      const silkEnds = [obj.children[1], obj.children[2]]
      for (const index in silkEnds) {
        const silkEnd = silkEnds[index]
        silkEnd.setX(obj.getAttr('offsetRootPoses')[index].x + rootPos.x)
        silkEnd.setY(obj.getAttr('offsetRootPoses')[index].y + rootPos.y)
      }
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

const addObjs = (toAdd) => {
  const layer = getMainLayer()
  const currentObjs = layer.getAttr('objs')
  const newObjs = {...currentObjs, ...toAdd}
  layer.setAttr('objs', newObjs)
}
export { addObjs as addObjs }

const updateObj = (objId, attrs) => {
  const mainLayer = getMainLayer()
  const obj = mainLayer.getAttr('objs')[objId]
  const newObjs = mainLayer.getAttr('newObjs')
  Object.entries(attrs).forEach(([name, val]) => {
    obj[name] = val
  })
  updateNewObjs(objId, obj)
  const konvaObj = getKonvaObjById(objId) 
  if ('position' in attrs) {
    console.log(konvaObj)
  }
  if ('positions' in attrs) {
    const rootPos = getRootPos()
    konvaObj.children[0].setPoints([
      attrs.positions[0].x + rootPos.x,
      attrs.positions[0].y + rootPos.y,
      attrs.positions[1].x + rootPos.x,
      attrs.positions[1].y + rootPos.y
    ])
  }
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