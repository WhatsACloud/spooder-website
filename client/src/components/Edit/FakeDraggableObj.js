import React, { useEffect } from 'react'
import styles from './edit.module'
import Hexagon from 'react-svg-hexagon'
import Konva from 'konva'

export default
function FakeDraggableObj({ dragging, mousePos, setHoverBudBorder, toggleCanDragLine, drop }) {
  const x = mousePos.x
  const y = mousePos.y
  useEffect(() => {
    if (!Konva.stages[0]) return
    const mainLayer = Konva.stages[0].children[0]
    const dropWrapper = (e) => drop(e, dragging, mainLayer, setHoverBudBorder, toggleCanDragLine)
    document.addEventListener('mouseup', dropWrapper)
    return () => {
      document.removeEventListener('mouseup', dropWrapper)
    }
  }, [dragging])
  return (
    <div style={{'top': y-32, 'left': x-34}} className={dragging ? styles.fakeDraggableObj : styles.none} id='fakeDraggableObj'>
      <Hexagon height="80" fill='#00D2FF' stroke='black' strokeWidth='1' ></Hexagon> 
    </div>
  )
}