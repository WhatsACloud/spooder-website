import React, { useEffect, useState } from 'react'
import Konva from 'konva'

import * as SilkUtils from './SilkUtils'
import * as utils from '../utils'
import { select } from '../Select'

class Silk {
  konvaObj = null
  silkObj = null
  highlight = null
  _pos1 = {x: null, y: null}
  _pos2 = {x: null, y: null}
  silkId = null
  get pos1() {return this._pos1}
  get pos2() {return this._pos2}
  set pos1(pos) {this._pos1 = pos}
  set pos2(pos) {this._pos2 = pos}
  _bud1 = null
  _bud2 = null
  get bud1() {return this._bud1}
  get bud2() {return this._bud2}
  // set bud1(id) { this._setBud('_bud1Id', '_pos1', id) }
  // set bud2(id) { this._setBud('_bud2Id', '_pos2', id) }
  set bud1(bud) {
    if (bud) {
      if (this._bud1) {
        this._bud1.delFromAttached(this.silkId)
      }
      bud.addToAttached(this)
      this.pos1 = bud.position
    }
    this._bud1 = bud
  }
  set bud2(bud) {
    if (bud) {
      if (this._bud2) {
        this._bud2.delFromAttached(this.silkId)
      }
      bud.addToAttached(this)
      this.pos2 = bud.position
    }
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
  mouseDown = () => {
    this.select()
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
    this.bud1.delFromAttached [this.silkId]
    delete this.bud2.attachedSilk[this.silkId]
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
    utils.delFromSilks(this.silkId)
    this.konvaObj.destroy()
  }
  restore = () => {
    this.bud1.json.attachedTos.push(this.bud2.objId)
    this.bud2.json.attachedTos.push(this.bud1.objId)
    this.bud1.attachedSilk[this.silkId] = this
    this.bud2.attachedSilk[this.silkId] = this
    this.init()
  }
  select = () => {
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
    const unselectFunc = () => {
      this.highlight = null
      highlight.destroy()
    }
    utils.selectObj(this.silkId, utils.ObjType.Silk, this.konvaObj, selectFunc, unselectFunc)
  }
  init = () => {
    // this.pos1 = this.bud1.position
    this.pos1 = this.bud1 ? this.bud1.position : this.pos1
    const group = new Konva.Group()
    group.on('mousedown', this.mouseDown)
    const line = new Konva.Line({
        points: this.getKonvaPoints(),
        stroke: 'black',
        strokeWidth: 1,
        hitStrokeWidth: 30,
    })
    group.add(line)
    this.konvaObj = group
    this.silkObj = line
    utils.getMainLayer().add(group)
    utils.addToSilks(this)
  }
  constructor(silkId, bud1, bud2) {
    const redoFunc = () => {
      this.restore()
    }
    const undoFunc = () => {
      this.delete()
      // if (JSON.stringify(this.originalAttachedTos) == JSON.stringify(this.json.attachedTos)) {
      //   utils.delFromNewObjs(this.objId)
      //   utils.delFromNewObjs(bud1.objId)
      // }
    }
    this.bud1 = bud1
    this.bud2 = bud2
    if (bud2) {
      bud1.json?.attachedTos.push(bud2.objId)
    }
    if (bud1) {
      bud2.json?.attachedTos.push(bud1.objId)
    }
    this.silkId = silkId
    this.init()
    utils.addToHistory(undoFunc, redoFunc)
  }
}
export { Silk }