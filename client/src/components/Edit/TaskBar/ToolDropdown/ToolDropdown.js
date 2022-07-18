import React, { useState, useEffect } from 'react'
import { useSpring, animated, config } from 'react-spring'
import styles from './toolDropdown.module'
import * as utils from '../../utils'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { BackgroundClickDetector } from '../../../BackgroundClickDetector'

function ToolElement({ name, onClick, icon, toggle, on }) {
  const [ toggled, setToggled ] = useState(false)
  return (
    <div
      onClick={() => {
        onClick()
        if (toggle) {
          setToggled(!toggled)
        }
      }}
      className={on ? (toggled ? styles.toolElementTrue : styles.toolElementFalse) : styles.toolElementOff}
      >
      <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
      <div 
        style={{
          width: on ? '2.5vw' : '0.5vw'
        }}
        className={styles.spacer}></div>
      <p>{name}</p>
    </div>
  )
}

function ToolDropdown({ on, setOn }) {
  const [ styles, spring ] = useSpring(() => ({
    marginLeft: '0vw',
    // config: config.
  }))
  useEffect(() => {
    spring.start({
      x: on ? '-1vw' : '0vw'
    })
  }, [ on ])
  return (
    <>
      <BackgroundClickDetector on={on} mousedown={() => setOn(false)} zIndex={7}></BackgroundClickDetector>
      <animated.div
        style={styles}
        className={on ? styles.toolDropDown : styles.none}
        >
        <ToolElement
          name='Glue'
          onClick={() => {
            const modes = utils.getGlobals().modes
            modes.gluing = !(modes.gluing)
          }}
          on={on}
          toggle={true}
          icon={faLink}
          ></ToolElement>
      </animated.div>
    </>
  )
}
export { ToolDropdown }