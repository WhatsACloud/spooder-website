import styles from '../edit.module'
import React, { useState, useEffect } from 'react'
import uuid from 'react-uuid'
import * as utils from '../utils'
import { useSpring } from 'react-spring'

function KeybindBtn({ num, text, icon }) {
  return (
    <div className={num === 0 ? styles.firstKeybindBtn : styles.keybindBtn}>
      {text}
      {icon}
    </div>
  )
}

function KeySetter({ operation, setKeys }) {
  useEffect(() => {
    const _keys = []
    let i = 0
    console.log(operation.name, operation.keys)
    for (const [ leKey, icon ] of operation.keys) {
      _keys.push(
        <KeybindBtn key={uuid()} num={i} text={icon ? icon : leKey}></KeybindBtn>
      )
      i++
    }
    setKeys(_keys)
  }, [])
  return <></>
}

function OpBtn({ on, operation, setContextMenuOn, last }) {
  const [ keys, setKeys ] = useState()
  const [ menuStyle, menuSpring ] = useSpring(() => ({
    width: 100,
    height: 25,
    opacity: 1,
    duration: 1000,
  }))
  useEffect(() => {
    console.log(on)
    menuSpring.start({
      width: on ? 250 : 100,
      height: on ? 100 : 25,
      opacity: on ? 0 : 1,
      duration: 1000,
    })
  }, [ on ])
  return (
    <div
      style={menuStyle}
      className={last ? styles.lastBtn : styles.btn}
      onClick={e => {
        operation.func()
        setContextMenuOn(false)
      }}
      >
      <KeySetter operation={operation} setKeys={setKeys}></KeySetter>
      <p>{operation.name}</p>
      {keys}
    </div>
  )
}

function ContextMenu({ on, pos, setContextMenuOn }) {
  const [ rendered, setRendered ] = useState()
  useEffect(() => {
    const operations = utils.getGlobals().operations
    const selectedBuds = utils.getGlobals().selected?.buds
    const selectedSilks = utils.getGlobals().selected?.silks
    const toRender = []
    const leTypes = [utils.ObjType.Default]
    if (selectedBuds || selectedSilks) {
      if (Object.values(selectedBuds).length !== 0
          || Object.values(selectedSilks).length !== 0) {
        leTypes.push(utils.ObjType.All)
      }
      if (Object.values(selectedBuds).length > 1) {
        leTypes.push(utils.ObjType.Selected)
      }
      if (Object.values(selectedBuds).length === 1) {
        leTypes.push(utils.ObjType.Bud)
      }
      let i = 0
      let lastOp = null
      for (const type of leTypes) {
        for (const operation of operations.operations[type]) {
          toRender.push(
            <OpBtn key={uuid()} on={on} last={false} operation={operation} setContextMenuOn={setContextMenuOn}></OpBtn>
          )
          lastOp = operation
          i++
        }
      }
      toRender.pop()
      toRender.push(
        <OpBtn key={uuid()} on={on} last={true} operation={lastOp} setContextMenuOn={setContextMenuOn}></OpBtn>
      )
    }
    setRendered(toRender)
  }, [ on ])
  return (
    <>
      <div
        style={{top: pos.y, left: pos.x}}
        className={on ? styles.contextMenu : styles.none}
        id='contextMenu'
        >
        {rendered}
      </div>
    </>
  )
}
export { ContextMenu }