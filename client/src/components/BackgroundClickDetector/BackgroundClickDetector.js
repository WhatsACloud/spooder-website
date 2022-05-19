import React from 'react'
import styles from './clickDetector.module'

function BackgroundClickDetector({ on, zIndex }) {
  return (
    <div
      className={on ? styles.BackgroundClickDetector : styles.none}
      style={{zIndex: zIndex}}
      id='backClickDetect'></div>
  )
}
export { BackgroundClickDetector }