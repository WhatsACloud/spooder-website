import React, { useEffect, useState } from 'react'
import styles from './undoRedo.module'
import * as utils from '../../utils'

const getHistory = () => {
  return utils.getMainLayer().getAttr('history')
}

const getHistoryIndex = () => {
  return utils.getMainLayer().getAttr('historyIndex')
}

const setHistoryIndex = (histIndex) => {
  return utils.getMainLayer().setAttr('historyIndex', histIndex)
}

const undo = () => {
  const historyIndex = getHistoryIndex()
  console.log(historyIndex)
  if (historyIndex >= 0) {
    const history = getHistory()
    const last = history[historyIndex]
    setHistoryIndex(historyIndex-1)
    last.undo(undo)
  }
}

const redo = () => {
  const historyIndex = getHistoryIndex()
  const history = getHistory()
  const last = history[historyIndex+1]
  console.log(historyIndex+1, history)
  if (last) {
    setHistoryIndex(historyIndex+1)
    last.redo(redo)
  }
}

function UndoRedo() {
  return (
    <>
      <button
        className={styles.undo}
        onClick={undo}>undo</button>
      <button
        className={styles.redo}
        onClick={redo}>redo</button>
    </>
  )
}
export { UndoRedo }