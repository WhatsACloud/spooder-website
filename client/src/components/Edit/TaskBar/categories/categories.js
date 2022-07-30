import React, { useEffect, useState, useRef } from 'react'
import styles from './category.module'

import { useSpring, animated, config } from 'react-spring'

import { BackgroundClickDetector } from '../../../BackgroundClickDetector'
import { SearchBar } from '../Search'

import { HexColorPicker } from 'react-colorful'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faLayerGroup } from '@fortawesome/free-solid-svg-icons'

import * as classCategory from '../../Category'

import * as utils from '../../utils'

function StartDivSpring({ on, firstOn, outerDivSpring, colorDivSpring }) {
  useEffect(() => {
    console.log(on)
    outerDivSpring.start({
      width: on ? 100 : 30,
      height: on ? 50 : 0,
      paddingLeft: on ? 10 : 3,
      // margin: on ? 5 : 1,
      marginLeft: on ? 0 : 40,
      fontSize: on ? 18 : 3,
      opacity: on ? 1 : 1,
      // backgroundColor: toggled ? 'rgb(0, 102, 255)' : 'white',
      // color: toggled ? 'white' : 'rgb(0, 102, 255)',
    })
    colorDivSpring.start({
      width: on ? 40 : 10,
      height: on ? 40 : 0,
    })
  }, [ on ])
  return <></>
}

function Category({ on, firstOn, category, selected, setColorPos, setSelected, setSelectingColor, setColor, color }) {
  const [ text, setText ] = useState(category.name)
  const colorDiv = useRef(null)
  const [ outerDivStyle, outerDivSpring ] = useSpring(() => ({
    width: (on && !firstOn) ? 100 : 30,
    height: (on && !firstOn) ? 50 : 0,
    paddingLeft: (on && !firstOn) ? 10 : 3,
    marginLeft: (on && !firstOn) ? 0 : 40,
    fontSize: (on && !firstOn) ? 18 : 3,
    opacity: (on && !firstOn) ? 1 : 1,
    backgroundColor: 'white',
    color: 'rgb(0, 102, 255)',
    config: config.gentle,
  }))
  console.log(outerDivStyle.width)
  const [ colorDivStyle, colorDivSpring ] = useSpring(() => ({
    width: (on && !firstOn) ? 40 : 10,
    height: (on && !firstOn) ? 40 : 0,
    config: config.gentle,
  }))
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('timout')
      const original = text
      category.name = text
      for (const categ of Object.values(utils.getGlobals().categories.categories)) {
        if (categ.categId !== category.categId && categ.name === category.name) {
          console.log('error, bruh')
          category.name = original
          break
        }
      }
    }, 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [ text ])
  return (
    <>
      <StartDivSpring firstOn={firstOn} on={on} outerDivSpring={outerDivSpring} colorDivSpring={colorDivSpring}></StartDivSpring>
      <animated.div
        style={{
          width: outerDivStyle.width.to(v => v + "%"),
          height: outerDivStyle.height.to(v => v),
          // paddingLeft: outerDivStyle.paddingLeft.to(v => v),
          fontSize: outerDivStyle.fontSize.to(v => v),
          marginLeft: outerDivStyle.marginLeft.to(v => v + '%'),
          opacity: outerDivStyle.opacity.to(v => v),
          backgroundColor: outerDivStyle.backgroundColor.to(v => v),
          borderColor: (category.categId === selected ?
            'rgba(200, 200, 200, 1)' :
            'rgba(200, 200, 200, 0)'),
          color: outerDivStyle.color.to(v => v),
        }}
        className={styles.category}
        onClick={() => {
          setSelected(category.categId)
        }}
        >
        <input
          type='text'
          onChange={e => {
            setText(e.target.value)
          }}
          value={text}
        ></input>
        <animated.div
          ref={colorDiv}
          style={{
            width: colorDivStyle.width.to(v => v),
            height: colorDivStyle.height.to(v => v),
            backgroundColor: category.color
          }}
          className={styles.colorDisplayer}
          onClick={() => {
            setColor(category ? category.color : '')
            const rect = colorDiv.current.getBoundingClientRect()
            console.log('picked', rect.top)
            setSelectingColor(category)
            setColorPos(rect.top)
          }}
          ></animated.div>
      </animated.div>
    </>
  )
}

function AddCategoryBtn({ on, display, setDisplay, selected, setSelected, setSelectingColor, selectingColor }) {
  return (
    <>
      <div className={styles.addCategoryBtn} onClick={() => {
        const category = new classCategory.Category('')
        utils.getGlobals().categories.add(category)
        const newElement = (
          <Category
            on={on}
            key={category.categId}
            category={category}
            selected={selected}
            setSelected={setSelected}
            setSelectingColor={setSelectingColor}
            selectingColor={selectingColor}
            firstOn={true}
            ></Category>
        )
        const newDisplay = [newElement, ...display]
        setDisplay(newDisplay)
      }}>
        <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
        <p>Add category</p>
      </div>
    </>
  )
}

function UpdateSelected({ selected }) {
  useEffect(() => {
    utils.getGlobals().selectedCategory = selected
    if (selected) {
      const categ = utils.getGlobals().categories.getById(selected)
      utils.addToRecentlyViewed(categ)
    }
  }, [ selected ])
  return <></>
}

function UpdateColor({ selectingColor, color, update }) {
  useEffect(() => {
    if (selectingColor) {
      selectingColor.color = color
      update(color)
    }
  }, [ color ])
  return <></>
}

function StartCategorySpring({ on, firstOn, setFirstOn, setDisplay, selected, setSelected, setColorPos, setColor, setSelectingColor }) {
  useEffect(() => {
    const categClass = utils.getGlobals().categories
    if (!categClass) return
    const categIds = categClass.categIds
    if (categClass.isChanged) {
      const toDisplay = []
      let index = 0
      const setCategories = (interval) => {
        const categId = categIds[index]
        console.log(categId, categIds)
        if (isNaN(categId)) {
          clearInterval(interval)
          return
        }
        const category = categClass.getById(categId)
        toDisplay.push(
          <Category
            key={categId}
            on={on}
            category={category}
            selected={selected}
            setSelected={setSelected}
            setColorPos={setColorPos}
            setColor={setColor}
            firstOn={firstOn}
            setSelectingColor={setSelectingColor}
            ></Category>
        )
        setDisplay([...toDisplay])
        index++
      }
      if (firstOn) {
        const interval = setInterval(() => {
          setCategories(interval)
        }, 40)
      } else {
        for (const categId of categIds) {
          setCategories()
        }
      }
    }
    setFirstOn(false)
  }, [ on, selected ])
  return <></>
}

function DisplayCategories({ on }) {
  const [ display, setDisplay ] = useState()
  const [ selected, setSelected ] = useState(false)
  const [ selectingColor, setSelectingColor ] = useState(false)
  const [ colorPos, setColorPos ] = useState(0)
  const [ color, setColor ] = useState('')
  const [ toUpdate, update ] = useState(false)
  const [ outerDivSpring, spring ] = useSpring(() => ({
    opacity: 0,
    marginTop: -50
  }))
  const [ firstOn, setFirstOn ] = useState(false)
  useEffect(() => {
    setSelected(on ? utils.getGlobals().selectedCategory : false)
    spring.start({
      opacity: on ? 1 : 0,
      marginTop: on ? 0 : -50,
    })
    if (!on) setFirstOn(true)
  }, [ on, selected, toUpdate ])
  return (
    <>
      <StartCategorySpring
        on={on}
        selected={selected}
        setDisplay={setDisplay}
        setSelected={setSelected}
        setColorPos={setColorPos}
        setColor={setColor}
        setSelectingColor={setSelectingColor}
        firstOn={firstOn}
        setFirstOn={setFirstOn}
        ></StartCategorySpring>
      <UpdateColor selectingColor={selectingColor} color={color} update={update}></UpdateColor>
      <animated.div style={outerDivSpring} className={on ? styles.wrapCategoriesOn : styles.wrapCategoriesOff }>
        <div
          style={{top: colorPos}}
          className={selectingColor !== false ? styles.colorPicker : styles.none}>
          <HexColorPicker color={color} onChange={setColor}></HexColorPicker>
        </div>
        <UpdateSelected selected={selected}></UpdateSelected>
        <div
          className={styles.viewCategories}
          onClick={() => {
            if (selectingColor) {
              setSelectingColor(false)
              setColorPos(0)
              setColor('')
            }
          }}
          >
          <AddCategoryBtn 
            on={on}
            display={display}
            setDisplay={setDisplay}
            selected={selected}
            setSelected={setSelected}
            setSelectingColor={setSelectingColor}
            ></AddCategoryBtn>
          {display}
        </div>
      </animated.div>
    </>
  )
}
export { DisplayCategories }

function CategoryBtn({ setOpen, outerStyle }) {
  return (
    <button className={outerStyle.stdButton} onClick={() => setOpen(true)}>
      <FontAwesomeIcon icon={faLayerGroup}></FontAwesomeIcon>
      <p>Categories</p>
    </button>
  )
}

function Categories({ outerStyle }) {
  const [ open, setOpen ] = useState(false)
  return (
    <>
      <BackgroundClickDetector
        on={open}
        zIndex={9}
        blur={true}
        mousedown={() => setOpen(false)}
        ></BackgroundClickDetector>
      <CategoryBtn outerStyle={outerStyle} setOpen={setOpen}></CategoryBtn>
      <DisplayCategories on={open}></DisplayCategories>
    </>
  )
}
export { Categories }