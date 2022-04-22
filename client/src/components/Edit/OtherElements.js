import React, { useEffect } from 'react'
import styles from './edit.module'
import Hexagon from 'react-svg-hexagon'
import Konva from 'konva'

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
export { FakeDraggableObj as FakeDraggableObj }

function ObjectDrawer({ setDragging, toggleCanDragLine, setToggleCanDragLine }) {
  const items = {
    test: [
      {
        func: () => setDragging(true),
        icon: <FontAwesomeIcon icon={faObjectGroup}></FontAwesomeIcon>
      },
      {
        func: () => setToggleCanDragLine(true),
        icon: <FontAwesomeIcon icon={faLinesLeaning}></FontAwesomeIcon>
      }
    ]
  }
  return (
    <>
      <div className={styles.objectDrawer}>
        <div className={styles.box}>
          <div className={styles.obj}>
            <p>test</p>
            <button className={styles.drawerButton} onMouseDown={() => setDragging(true)}>
              <FontAwesomeIcon icon={faObjectGroup}></FontAwesomeIcon>
            </button>
            <button className={toggleCanDragLine ? styles.darkenedDrawerButton : styles.drawerButton} onMouseDown={() => setToggleCanDragLine(!toggleCanDragLine)}>
              <FontAwesomeIcon icon={faLinesLeaning}></FontAwesomeIcon>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
export { ObjectDrawer as ObjectDrawer }