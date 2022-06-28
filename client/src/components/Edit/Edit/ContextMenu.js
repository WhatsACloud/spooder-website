import styles from '../edit.module'
import React, { useState, useEffect } from 'react'
import * as utils from '../utils'

function KeybindBtn({ num, text, icon }) {
  return (
    <div className={num === 0 ? styles.firstKeybindBtn : styles.keybindBtn}>
      {text}
      {icon}
    </div>
  )
}

function OpBtn({ operation, setContextMenuOn }) {
  const [ keys, setKeys ] = useState()
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
  return (
    <div
      className={styles.btn}
      onClick={e => {
        operation.func()
        setContextMenuOn(false)
      }}
      >
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
      for (const type of leTypes) {
        console.log(type, operations.operations)
        for (const operation of operations.operations[type]) {
          toRender.push(
            <OpBtn key={i} operation={operation} setContextMenuOn={setContextMenuOn}></OpBtn>
          )
          i++
        }
      }
    }
    setRendered(toRender)
  }, [ on ])
  return (
    <>
      <div style={{top: pos.y, left: pos.x}} className={on ? styles.contextMenu : styles.none}
        >
        {rendered}
      </div>
    </>
  )
}
export { ContextMenu }