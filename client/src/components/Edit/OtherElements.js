import React, { useEffect } from 'react'
import styles from './edit.module'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faObjectGroup, faLinesLeaning } from '@fortawesome/free-solid-svg-icons'

import * as utils from './utils'
import * as BudUtils from './Bud/BudUtils'

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
            <button onClick={utils.save}>
              save
            </button>
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

import Hexagon from 'react-svg-hexagon'
import Konva from 'konva'

function FakeDraggableObj({ dragging, setDragging, setObjsToUpdate }) {
  useEffect(() => {
    if (!Konva.stages[0]) return
    const dropWrapper = (e) => {
      BudUtils.drop(e, setObjsToUpdate)
      setDragging(false)
      const mainLayer = utils.getMainLayer()
      mainLayer.setAttr('addedObj', true)
      console.log(mainLayer)
    }
    const moveWrapper = (e) => {
      const draggable = document.getElementById('fakeDraggableObj')
      draggable.style.left = `${e.pageX-34}px`
      draggable.style.top = `${e.pageY-32}px`
    }
    if (dragging) {
      document.addEventListener('mouseup', dropWrapper)
      document.addEventListener('mousemove', moveWrapper)
    }
    return () => {
      document.removeEventListener('mouseup', dropWrapper)
      document.removeEventListener('mousemove', moveWrapper)
    }
  }, [dragging]) // x-34 y-32
  return (
    <div style={{'top': -100, 'left': -100}} className={dragging ? styles.fakeDraggableObj : styles.none} id='fakeDraggableObj'>
      <Hexagon height="80" fill='#00D2FF' stroke='black' strokeWidth='1' ></Hexagon> 
    </div>
  )
}
export { FakeDraggableObj as FakeDraggableObj }