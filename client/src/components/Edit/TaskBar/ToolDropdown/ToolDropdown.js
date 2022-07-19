import React, { useState, useEffect } from 'react'
import { useSpring, animated, config } from 'react-spring'
import styles from './toolDropdown.module'
import * as utils from '../../utils'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { BackgroundClickDetector } from '../../../BackgroundClickDetector'

const toolElementConf = {
  duration: 10,
  bounce: 10,
}

function ToolElement({ name, onClick, icon, toggle, on }) {
  const [ toggled, setToggled ] = useState(false)
  const [ spacerStyle, spacerSpring ] = useSpring(() => ({
    width: 10,
    config: toolElementConf
  }))
  const [ outerDivStyle, outerDivSpring ] = useSpring(() => ({
    width: 10,
    height: 10,
    padding: 0,
    fontSize: 10,
    config: toolElementConf
  }))
  useEffect(() => {
    spacerSpring.start({
      width: on ? 20 : 0
    })
    outerDivSpring.start({
      width: on ? 100 : 30,
      height: on ? 40 : 10,
      padding: on ? 5 : 0,
      fontSize: on ? 20 : 10
    })
  }, [ on ])
  return (
    <animated.div
      onClick={() => {
        onClick()
        if (toggle) {
          setToggled(!toggled)
        }
      }}
      style={outerDivStyle}
      className={on ? (toggled ? styles.toolElementTrue : styles.toolElementFalse) : styles.toolElementOff}
      >
      <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
      <animated.div 
        style={spacerStyle}
        className={styles.spacer}></animated.div>
      <p>{name}</p>
    </animated.div>
  )
}

function ToolDropdown({ on, setOn }) {
  const [ springStyle, spring ] = useSpring(() => ({
    marginLeft: '0vw',
    config: {
      duration: 15,
      bounce: 10,
    }
  }))
  useEffect(() => {
    spring.start({
      x: on ? '-1vw' : '3vw'
    })
  }, [ on ])
  return (
    <>
      <BackgroundClickDetector on={on} mousedown={() => setOn(false)} zIndex={7}></BackgroundClickDetector>
      {/* <div className={styles.toolDropDown}> */}
        <animated.div
          style={springStyle}
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
      {/* </div> */}
    </>
  )
}
export { ToolDropdown }