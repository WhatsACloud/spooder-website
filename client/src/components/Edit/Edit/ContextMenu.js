import styles from '../edit.module'
import React, { useState, useEffect } from 'react'
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
    for (const [ leKey, icon ] of operation.keys) {
      _keys.push(
        <KeybindBtn key={i} num={i} text={icon ? icon : leKey}></KeybindBtn>
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
      <p
        onMouseOver={e => console.log('siofuifubdfibuefhy')}>{operation.name}</p>
      {keys}
    </div>
  )
}

function ContextMenu({ on, pos, setContextMenuOn }) {
  const [ rendered, setRendered ] = useState()
  useEffect(() => {
    const operations = utils.getGlobals().operations
    const selected = utils.getGlobals().selected
    const types = []
    const toRender = []
    const leTypes = [utils.ObjType.Default]
    if (selected) {
      for (const obj of Object.values(selected)) {
        if (!(types.includes(obj.type))) types.push(obj.type)
      }
      if (Object.values(selected).length !== 0) {
        leTypes.push(...types, utils.ObjType.All)
      }
      let i = 0
      let lastOp = null
      for (const type of leTypes) {
        console.log(type, operations.operations)
        for (const operation of operations.operations[type]) {
          toRender.push(
            <OpBtn key={i} on={on} last={false} operation={operation} setContextMenuOn={setContextMenuOn}></OpBtn>
          )
          lastOp = operation
          i++
        }
      }
      toRender.pop()
      toRender.push(
        <OpBtn key={i} on={on} last={true} operation={lastOp} setContextMenuOn={setContextMenuOn}></OpBtn>
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