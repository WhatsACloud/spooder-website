import React, { useState, useEffect } from 'react'
import { useSpring, animated, easings, useChain, config, useTransition } from 'react-spring'
import styles from './toolDropdown.module'
import * as utils from '../../utils'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { BackgroundClickDetector } from '../../../BackgroundClickDetector'

const toolElementConf = {
  duration: 200,
  easing: easings.easeOutQuad
}

function ToolElement({ name, onClick, icon, toggle, on }) {
  const [ toggled, setToggled ] = useState(false)
  const [ spacerStyle, spacerSpring ] = useSpring(() => ({
    // width: 10,
    config: config.stiff
  }))
  const [ outerDivStyle, outerDivSpring ] = useSpring(() => ({
    width: 10,
    height: 10,
    padding: 0,
    fontSize: 3,
    marginLeft: '0vw',
    opacity: 0,
    config: config.stiff
  }))
  useEffect(() => {
    spacerSpring.start({
      // width: on ? 20 : 0
    })
    outerDivSpring.start({
      width: on ? 100 : 30,
      height: on ? 40 : 10,
      padding: on ? 5 : 3,
      fontSize: on ? 15 : 3,
      marginLeft: on ? '-3vw' : '0vw',
      opacity: on ? 1 : 0
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
      <FontAwesomeIcon icon={icon} className={styles.dropDownIcon}></FontAwesomeIcon>
      <animated.div 
        style={spacerStyle}
        className={styles.spacer}></animated.div>
      <p>{name}</p>
    </animated.div>
  )
}

const data = [
  {
    name: 'Glue',
    onClick: () => {
      const modes = utils.getGlobals().modes
      modes.gluing = !(modes.gluing)
    },
    icon: faLink
  },
  {
    name: 'Testing',
    onClick: () => {
      const modes = utils.getGlobals().modes
      modes.gluing = !(modes.gluing)
    },
    icon: faLink
  },
]

const elemsInitial = data.map((elemData, index) => (
  <ToolElement
    name={elemData.name}
    onClick={elemData.onClick}
    on={false}
    toggle={true}
    icon={elemData.icon}
    key={index}
  ></ToolElement>
))

function ToolDropdown({ on, setOn }) {
  const [ elems, setElems ] = useState(elemsInitial)
  useEffect(() => {
    let leElems = [...elems]
    let index = 0
    const interval = setInterval(() => {
      const elemData = data[index]
      leElems.splice(index, 1, (
        <ToolElement
          name={elemData.name}
          onClick={elemData.onClick}
          on={on}
          toggle={true}
          icon={elemData.icon}
          key={index}
        ></ToolElement>
      ))
      setElems(leElems)
      if (index >= data.length - 1) {
        clearInterval(interval)
        index = 0
        return
      }
      index++
      leElems = [...leElems]
    }, 50)
  }, [ on ])
  return (
    <>
      <BackgroundClickDetector on={on} mousedown={() => setOn(false)} zIndex={7}></BackgroundClickDetector>
      {/* <div className={styles.toolDropDown}> */}
        <div
          className={on ? styles.toolDropDown : styles.none}
          >
          {elems}
          {/* <ToolElement
            name='Glue'
            onClick={() => {
              const modes = utils.getGlobals().modes
              modes.gluing = !(modes.gluing)
            }}
            on={on}
            toggle={true}
            icon={faLink}
            ></ToolElement> */}
        </div>
      {/* </div> */}
    </>
  )
}
export { ToolDropdown }