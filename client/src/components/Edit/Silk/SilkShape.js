import React, { useEffect, useState } from 'react'
import Konva from 'konva'

import * as SilkUtils from './SilkUtils'
import * as utils from '../utils'

class Silk {
  konvaObj = null
  silkObj = null
  highlight = null
  selected = false
  pos1 = {x: null, y: null}
  pos2 = {x: null, y: null}
  silkId = null
  _bud1 = null
  _bud2 = null
  loaded = false
  del = false
  get bud1() {return this._bud1}
  get bud2() {return this._bud2}
  // set bud1(id) { this._setBud('_bud1Id', '_pos1', id) }
  // set bud2(id) { this._setBud('_bud2Id', '_pos2', id) }
  set bud1(bud) {
    this.pos1 = bud.position
    this._bud1 = bud
  }
  set bud2(bud) {
    this.pos2 = bud.position
    this._bud2 = bud
  }
  fillInBud = (bud) => {
    if (this.bud1 === false) {
      this.bud1 = bud
      return
    } else if (this.bud2 === false) {
      this.bud2 = bud
      return
    }
  }
  getKonvaPoints = () => {
    const newPos1 = utils.calcKonvaPosByPos(this.pos1)
    const newPos2 = utils.calcKonvaPosByPos(this.pos2)
    return [
      newPos1.x,
      newPos1.y,
      newPos2.x,
      newPos2.y,
    ]

  }
  updateKonvaObj = () => {
    this.pos1 = utils.calcPosByKonvaPos(this.bud1.konvaObj.getX(), this.bud1.konvaObj.getY())
    this.pos2 = utils.calcPosByKonvaPos(this.bud2.konvaObj.getX(), this.bud2.konvaObj.getY())
    // this.pos1 = this.bud1.position
    // this.pos2 = this.bud2.position
    this.silkObj.setPoints(this.getKonvaPoints())
    this.highlight?.setPoints(this.getKonvaPoints())
  }
  click = (e) => {
    console.log('what')
    e.cancelBubble = true
    if (e.evt.button !== 0) return
    this.select(true)
  }
  delete = () => {
    const redoFunc = () => {
      this._delete()
    }
    const undoFunc = () => {
      this.restore()
    }
    utils.addToHistory(undoFunc, redoFunc)
    redoFunc()
  }
  _delete = () => {
    this.del = true
    const attachedTos1 = this.bud1.json.attachedTos
    for (let i = 0; i < attachedTos1.length; i++) {
      if (attachedTos1[i] === this.bud2.objId) {
        attachedTos1.splice(i, 1)
      }
    }
    const attachedTos2 = this.bud2.json.attachedTos
    for (let i = 0; i < attachedTos2.length; i++) {
      if (attachedTos2[i] === this.bud1.objId) {
        attachedTos2.splice(i, 1)
      }
    }
    delete this.bud1.json.attachedSilk[this.bud2.objId]
    delete this.bud2.json.attachedSilk[this.bud1.objId]
    utils.delFromSilks(this.silkId)
    this.konvaObj.destroy()
  }
  initSilkInBud = (bud1, bud2) => {
    bud1.attachedTos.push(bud2.objId)
    bud1.attachedSilk[bud2.objId] = this
  }
  restore = () => {
    this.initSilkInBud(this.bud1, this.bud2)
    this.initSilkInBud(this.bud2, this.bud1)
    this.init()
    this.del = false
  }
  unselect = () => {
    this.selected = false
    if (this.highlight) {
      this.highlight.destroy()
      this.highlight = null
    }
  }
  select = (clear=false) => {
    utils.clearSelected()
    this.selected = true
    const highlight = new Konva.Line({
        points: this.getKonvaPoints(),
        stroke: 'blue',
        strokeWidth: 5,
        hitStrokeWidth: 0,
    })
    this.silkObj.setPoints(this.getKonvaPoints())
    const selectFunc = () => {
      this.highlight = highlight
      this.konvaObj.add(highlight)
      this.silkObj.setZIndex(1)
      highlight.setZIndex(0)
    }
    utils.selectObj(this, utils.ObjType.Silk, selectFunc, clear)
  }
  unload = () => {
    if (!this.loaded) return
    this.loaded = false
    this.konvaObj.destroy()
  }
  init = () => {
    if (this.loaded && !(this.del)) return
    const group = new Konva.Group({silkId: this.silkId})
    group.on('click', this.click)
    const line = new Konva.Line({
        points: this.getKonvaPoints(),
        stroke: 'black',
        strokeWidth: 1,
        hitStrokeWidth: 30,
    })
    group.add(line)
    this.konvaObj = group
    this.silkObj = line
    utils.getSilkGroup().add(group)
    utils.addToSilks(this)
    this.loaded = true
  }
  constructor(silkId, bud1, bud2, initialising=false) {
    if (bud2.objId in bud1.attachedSilk || bud1.objId in bud2.attachedSilk) return
    this.bud1 = bud1
    this.bud2 = bud2
    this.initSilkInBud(this.bud1, this.bud2)
    this.initSilkInBud(this.bud2, this.bud1)
    this.silkId = silkId
    this.init()
    if (!initialising) {
      utils.addToHistory(this._delete, this.restore)
    }
  }
}
export { Silk }