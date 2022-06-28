import React, { useEffect, useState } from 'react'
import styles from './undoRedo.module'
import * as utils from '../../utils'

const getHistory = () => {
  return utils.getGlobals().history
}

const getHistoryIndex = () => {
  return utils.getGlobals().historyIndex
}

const setHistoryIndex = (histIndex) => {
  utils.getGlobals().historyIndex = histIndex
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
export { undo }

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
export { redo }

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