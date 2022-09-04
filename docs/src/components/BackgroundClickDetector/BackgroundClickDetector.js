import React, { useState, useEffect } from 'react'
import uuid from 'react-uuid'
import styles from './clickDetector.module'

function SetDetectorInfo() {
  useEffect(() => {
    if (!window.backDetectorStack) {
      window.backDetectorStack = []
      document.addEventListener('backClickDetectorStackChange', e => {
        e = e.detail
        const stack = window.backDetectorStack
        if (stack[stack.length-1] === e.currentId && !e.on) {
          stack.pop()
          const detectorEvt = new CustomEvent('backClickDetectorChange', {
            detail: {
              currentId: stack.length > 0 ? stack[stack.length-1] : null
            }
          })
          document.dispatchEvent(detectorEvt)
          return
        }
        if (stack.includes(e.currentId)) return
        window.backDetectorStack.push(e.currentId)
        const detectorEvt = new CustomEvent('backClickDetectorChange', {
          detail: {
            currentId: e.currentId
          }
        })
        document.dispatchEvent(detectorEvt)
      })
    }
  }, [])
  return <></>
}

function UpdateActive({ on, id }) {
  const [ firstTime, setFirstTime ] = useState(true)
  useEffect(() => {
    if (firstTime) {
      setFirstTime(false)
      return
    }
    const detectorEvt = new CustomEvent('backClickDetectorStackChange', {
      detail: {
        currentId: id,
        on: on,
      }
    })
    document.dispatchEvent(detectorEvt)
  }, [ on ])
  return <></>
}

function BackgroundClickDetector({ on, zIndex, mousedown, blur=false }) {
  const [ active, setActive ] = useState(false) // only there IF active on; Ensure only one backClickDetect is on at one time
  const [ id ] = useState(uuid())
  useEffect(() => {
    document.addEventListener('backClickDetectorChange', e => {
      e = e.detail
      if (e.currentId === id) console.log('ok i think there is an infinite loop here')
      setActive(e.currentId === id)
    })
  }, [ active ])
  return (
    <>
      <SetDetectorInfo></SetDetectorInfo>
      <UpdateActive on={on} id={id}></UpdateActive>
      {active ? (
        <div
          onMouseDown={mousedown}
          className={on ? (blur ? styles.BackgroundClickDetectorBlur : styles.BackgroundClickDetector) : styles.none}
          style={{
            zIndex: zIndex
          }}
          id='backClickDetect'></div>
      ) :
      <></>}
    </>
  )
  
}
export { BackgroundClickDetector }