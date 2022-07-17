import React from 'react'
import styles from './clickDetector.module'

function BackgroundClickDetector({ on, zIndex, mousedown, blur=false }) {
  return (
    <div
      onMouseDown={mousedown}
      className={on ? (blur ? styles.BackgroundClickDetectorBlur : styles.BackgroundClickDetector) : styles.none}
      style={{
        zIndex: zIndex
      }}
      id='backClickDetect'></div>
  )
}
export { BackgroundClickDetector }