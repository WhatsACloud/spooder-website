import styles from '../edit.module'
import React, { useState, useEffect } from 'react'

function ContextMenu({ on, pos }) {
  useEffect(() => {
  }, [ on, pos ])
  return (
    <>
      <div style={{top: pos.y, left: pos.x}} className={on ? styles.contextMenu : styles.none}>
      </div>
    </>
  )
}
export { ContextMenu }