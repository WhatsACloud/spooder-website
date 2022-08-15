import React, { useState, useEffect } from 'react'
import { useSpring, animated, easings, useChain, config, useTransition } from 'react-spring'
import styles from './toolDropdown.module'
import * as utils from '../../utils'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faPaperclip, faHandBackFist } from '@fortawesome/free-solid-svg-icons'
import { BackgroundClickDetector } from '../../../BackgroundClickDetector'
import { setBud } from '../../Bud/BudUtils'
import { Hexagon } from '../../../../services/icons'

function ToolElement({ name, onClick, icon, toggle, on, html, fontSize, isToggled=null }) {
  console.log(isToggled)
  const [ toggled, setToggled ] = useState(isToggled !== null ? isToggled : false)
  console.log(toggled)
  const [ spacerStyle, spacerSpring ] = useSpring(() => ({
    // width: 10,
    config: {
      mass: 1,
      tension: 300,
      friction: 14,
    },
  }))
  const [ outerDivStyle, outerDivSpring ] = useSpring(() => ({
    width: 10,
    height: 10,
    padding: 0,
    fontSize: 3,
    marginLeft: '0vw',
    opacity: 0,
    backgroundColor: 'white',
    color: 'rgb(0, 102, 255)',
    config: {
      mass: 1,
      tension: 300,
      friction: 14,
    },
  }))
  useEffect(() => {
    spacerSpring.start({
      // width: on ? 20 : 0
    })
    outerDivSpring.start({
      width: on ? 100 : 30,
      height: on ? 40 : 10,
      padding: on ? 5 : 3,
      fontSize: on ? 18 : 3,
      marginLeft: on ? '-3vw' : '0vw',
      opacity: on ? 1 : 0,
      backgroundColor: toggled ? 'rgb(0, 102, 255)' : 'white',
      color: toggled ? 'white' : 'rgb(0, 102, 255)',
    })
  }, [ on, toggled ])
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
      <animated.div 
        style={spacerStyle}
        className={styles.spacer}></animated.div>
      {
        icon ?
        <FontAwesomeIcon icon={icon} className={styles.dropDownIcon}></FontAwesomeIcon>
        : <></>
      }
      {
        html ? html : <></>
      }
      <p style={{fontSize: fontSize ? fontSize : '', whiteSpace: 'nowrap'}}>{name}</p>
    </animated.div>
  )
}

const theData = [
  {
    name: 'Attach',
    onClick: () => {
      const modes = utils.getGlobals().modes
      modes.gluing = !(modes.gluing)
    },
    toggle: true,
    getToggleFunc: () => utils.getGlobals().modes.gluing,
    icon: faLink
  },
  {
    name: 'Link',
    onClick: () => {
      utils.link()
    },
    icon: faPaperclip
  },
  {
    name: 'New Bud',
    onClick: () => {
      const width = window.innerWidth / 2
      const height = window.innerHeight / 2
      const pos = utils.calcPosByKonvaPos(width, height)
      setBud(pos)
    },
    html: <Hexagon></Hexagon>,
    toggle: false,
    fontSize: 10,
  },
  {
    name: 'Autodrag',
    onClick: () => {
      const modes = utils.getGlobals().modes
      modes.autoDrag = !(modes.autoDrag)
    },
    getToggleFunc: () => {
      console.log(utils.getGlobals().modes.autoDrag)
      return utils.getGlobals().modes.autoDrag
    },
    icon: faHandBackFist
  },
]


function ToolDropdown({ on, setOn, leData }) {
  const [ elems, setElems ] = useState((leData ? leData : theData).map((elemData, index) => {
    return (
      <ToolElement
        name={elemData.name}
        onClick={elemData.onClick}
        on={false}
        fontSize={elemData.fontSize}
        toggle={elemData.toggle === undefined ? true : elemData.toggle}
        html={elemData.html}
        icon={elemData.icon}
        key={index}
      ></ToolElement>
    )
}))
  useEffect(() => {
    let leElems = [...elems]
    let index = 0
    const interval = setInterval(() => {
      const data = leData ? leData : theData
      const elemData = data[index]
      console.log(elemData.name, elemData.getToggleFunc)
      leElems.splice(index, 1, (
        <ToolElement
          name={elemData.name}
          onClick={elemData.onClick}
          on={on}
          fontSize={elemData.fontSize}
          toggle={elemData.toggle === undefined ? true : elemData.toggle}
          isToggled={elemData.getToggleFunc ? elemData.getToggleFunc() : undefined}
          html={elemData.html}
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
        <div
          className={on ? styles.toolDropDown : styles.none}
          >
          {elems}
        </div>
    </>
  )
}
export { ToolDropdown }