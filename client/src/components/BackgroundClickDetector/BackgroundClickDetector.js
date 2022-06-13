import React from 'react'
import styles from './clickDetector.module'

function BackgroundClickDetector({ on, zIndex, mousedown }) {
  return (
    <div
      onMouseDown={mousedown}
      className={on ? styles.BackgroundClickDetector : styles.none}
      style={{zIndex: zIndex}}
      id='backClickDetect'></div>
  )
}
export { BackgroundClickDetector }