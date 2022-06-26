/*
ISSUES

1. select not consistent
2. Add mass select
3. Redo backclickdetector so can share one div

*/

import React, { memo, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../../Shared/Authorizer'
import styles from '../edit.module'

import { preventZoom, preventZoomScroll } from '../PreventDefault'
import { mouseDown, mouseUp, mouseMove } from '../Events'
import * as OtherElements from '../OtherElements'
import { Background } from '../Background'

import api from '../../../services/api'

import * as SilkShapes from '../Silk'
import * as BudShapes from '../Bud'

import * as utils from '../utils'
import { DrawCanvas } from './DrawCanvas'
import { TaskBar } from '../TaskBar'
import { Settings } from '../Settings'

import Konva from 'konva'
import { BudView } from '../Select/BudView'
import { setBud } from '../Bud/BudUtils'
import { Keybinds } from './keybinds'

Konva.hitOnDragEnabled = true

const gridLink = "http://phrogz.net/tmp/grid.gif"

function MouseMoveDetector() {
  const [ middleMouseDown, setMiddleMouseDown ] = useState(false)
  const [ mousePos, setMousePos ] = useState({
    x: null,
    y: null
  })
  useEffect(() => {
    const mousePosWrapper = (e) => {
      mouseMove(e, middleMouseDown, mousePos, setMousePos)
    }
    const mouseDownWrapper = (e) => {
      mouseDown(e, setMiddleMouseDown)
    }
    const mouseUpWrapper = (e) => {
      // mouseUp(e, setMiddleMouseDown, setDragging)
      mouseUp(e, setMiddleMouseDown)
    }
    document.addEventListener('mousemove', mousePosWrapper)
    document.addEventListener('mouseup', mouseUpWrapper)
    document.addEventListener('mousedown', mouseDownWrapper)
    return () => {
      document.removeEventListener('mousemove', mousePosWrapper)
      document.removeEventListener('mousedown', mouseDownWrapper)
      document.removeEventListener('mouseup', mouseUpWrapper)
    }
  }, [ mousePos, middleMouseDown ])
  return <></>
}

function SetGlobal() {
  useEffect(() => {
    window.spoodawebVars = {}
    window.spoodawebVars.react = {}
    console.log('set spoodawebVars')
  }, [])
  return <></>
}

const scrollRight = (amt) => {
  utils.getGlobals().scrolling = true
  const rootPos = utils.getRootPos()
  utils.setRootPos({x: rootPos.x - amt, y: rootPos.y})
}

const scrollDown = (amt) => {
  utils.getGlobals().scrolling = true
  const rootPos = utils.getRootPos()
  utils.setRootPos({x: rootPos.x, y: rootPos.y - amt})
}

function Edit() {
  const navigate = useNavigate()
  const [ dragging, setDragging ] = useState(false)
  const [ toggleCanDragLine, setToggleCanDragLine ] = useState(false)
  const [ rendered, setRendered ] = useState([])
  const [ inSettings, setInSettings ] = useState(false)
  const [ renderTrain, setRenderTrain ] = useState(false)
  const [ settings, setSettings ] = useState({
    Background: false
  })
  useEffect(async () => {
    const width = utils.getStage().getAttr('width')
    const height = utils.getStage().getAttr('height')
    utils.getStage().on('mousedown', evt => {
      utils.getReactNamespace('renderTrain').setVal(utils.getReactNamespace('renderTrain').val)
    })
    document.getElementById('divCanvas').addEventListener('wheel', e => {
      scrollDown(e.deltaY)
      scrollRight(e.deltaX)
    })
    setInterval(() => {
      if (utils.getGlobals().scrolling) {
        utils.getGlobals().scrolling = false
        utils.reloadObjs()
        return
      }
    }, 1000);
    const urlString = window.location.search
    let paramString = urlString.split('?')[1];
    let queryString = new URLSearchParams(paramString);
    const globals = utils.getGlobals()
    globals.spoodawebId = queryString.get('id')
    let objs = {
      data: {
        spoodawebData: {},
        nextObjId: 0
      }
    }
    const rootPos = utils.getRootPos() || {x: 0, y: 0}
    try {
      objs = await api.post('/webs/get/objects', {
        spoodawebId: globals.spoodawebId,
        startPos: [
          rootPos.x - width,
          rootPos.y - height,
        ],
        endPos: [
          width * 2,
          height * 2 
        ]
      })
    } catch(err) {
      console.log(err)
      console.log('Unable to retrieve objects.')
    }
    const spoodawebData = objs.data.spoodawebData
    console.log(objs.data)
    globals.nextObjId = objs.data.nextObjId
    globals.newObjs = []
    globals.addedObj = false
    globals.objs = {}
    globals.rootPos = {x: 0, y: 0}
    globals.history = []
    globals.historyIndex = -1
    globals.triggerDragLine = false
    globals.draggingLine = false
    globals.selected = null
    globals.viewing = null
    globals.unselectFunc = null
    globals.silkObjs = {}
    globals.modes = {
      autoDrag: false,
      gluing: false,
    }
    globals.lastMousePos = null
    globals.dragging = false
    globals.testedPath = []
    globals.scrolling = false
    globals.wasScrolling = false

    const keybinds = new Keybinds(true)
    globals.keybinds = keybinds

    const budGroup = new Konva.Group()
    const silkGroup = new Konva.Group()
    utils.getMainLayer().add(budGroup, silkGroup)
    budGroup.setZIndex(1)
    silkGroup.setZIndex(0)
    const tempObjs = []
    for (const [ objId, obj ] of Object.entries(spoodawebData)) {
      const bud = new BudShapes.Bud(obj.objId)
      bud.init(obj.position)
      bud.fromJson(obj)
      const screenBounds = utils.calcScreenBounds()
      const inRect = utils.withinRect(screenBounds[0], screenBounds[1], obj.position)
      if (!(inRect)) {
        bud.unload()
        continue
      }
      tempObjs.push(bud)
    }
    for (const leObj of tempObjs) {
      for (const attachedTo of leObj.attachedTos) {
        new SilkShapes.Silk(utils.getNextSilkId(), leObj, utils.getObjById(attachedTo), true)
      }
    }
    document.addEventListener('keydown', preventZoom)
    document.addEventListener('wheel', preventZoomScroll, { passive: false })

    utils.setRootPos({x: 0, y: 0})
    const scrollAmt = 20
    keybinds.add('ArrowUp', () => scrollDown(-scrollAmt))
    keybinds.add('ArrowDown', () => scrollDown(scrollAmt))
    keybinds.add('ArrowLeft', () => scrollRight(-scrollAmt))
    keybinds.add('ArrowRight', () => scrollRight(scrollAmt))
    const mouseMoveFunc = (e) => {
      const pos = {x: e.screenX, y: e.screenY}
      const globals = utils.getGlobals()
      if (!globals.lastMousePos) {
        globals.lastMousePos = pos
      }
      const multiplier = 2
      const diff = {x: globals.lastMousePos.x - pos.x, y: globals.lastMousePos.y - pos.y}
      scrollDown(-diff.y * multiplier)
      scrollRight(-diff.x * multiplier)
      utils.getGlobals().lastMousePos = pos
    }
    document.getElementById('divCanvas').addEventListener('contextmenu', (e) => e.preventDefault())
    const stopDrag = () => {
      const globals = utils.getGlobals()
      utils.setCursor("default")
      globals.lastMousePos = null
      document.removeEventListener('mouseup', stopDrag)
      document.removeEventListener('mousemove', mouseMoveFunc)
    }
    utils.getStage().on('mousedown', (e) => {
      if (e.evt.button === 2) {
        utils.setCursor("grab")
        document.addEventListener('mousemove', mouseMoveFunc)
        const func = () => {
          utils.getGlobals().dragging = true
          document.removeEventListener('mousemove', func)
          document.addEventListener('mouseup', stopDrag)
        }
        document.addEventListener('mousemove', func)
      } else if (e.evt.button == 0) {
      }
    })
    return () => {
      document.removeEventListener('keydown', preventZoom)
      document.removeEventListener('wheel', preventZoomScroll)
    }
  }, [])
  return (
    <>
      <Authorizer navigate={navigate} requireAuth={true}></Authorizer>
      <SetGlobal></SetGlobal>
      <utils.SetGlobalReactSetter val={renderTrain} setVal={setRenderTrain} namespace='renderTrain'></utils.SetGlobalReactSetter>
      <MouseMoveDetector></MouseMoveDetector>
      <Settings
        inSettings={inSettings}
        setInSettings={setInSettings}
        settings={settings}
        setSettings={setSettings}></Settings>
      <TaskBar
        setInSettings={setInSettings}
        ></TaskBar>
      <div className={styles.wrapper}>
        <OtherElements.ObjectDrawer
          setDragging={setDragging}
          toggleCanDragLine={toggleCanDragLine}
          setToggleCanDragLine={setToggleCanDragLine}></OtherElements.ObjectDrawer>
        <OtherElements.FakeDraggableObj
          dragging={dragging}
          setDragging={setDragging}></OtherElements.FakeDraggableObj>
        <div className={styles.divCanvas} id='divCanvas'>
          <DrawCanvas
            rendered={rendered}></DrawCanvas>
        </div>
        <BudView></BudView>
        <Background canRender={settings.Background}></Background>
      </div>
    </>
  )
}
export default Edit