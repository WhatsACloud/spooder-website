import React, { useEffect, useState, useRef } from 'react'
import styles from './category.module'

import { useSpring, animated } from 'react-spring'

import { BackgroundClickDetector } from '../../../BackgroundClickDetector'
import { SearchBar } from '../Search'

import { HexColorPicker } from 'react-colorful'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faLayerGroup } from '@fortawesome/free-solid-svg-icons'

import * as classCategory from '../../Category'

import * as utils from '../../utils'

function Category({ category, selected, setColorPos, setSelected, setSelectingColor, setColor, color }) {
  const [ text, setText ] = useState(category.name)
  const colorDiv = useRef(null)
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
      <div
        style={{
          borderColor: category.categId === selected ?
          'rgba(200, 200, 200, 1)' : 
          'rgba(200, 200, 200, 0)'
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
        <div
          ref={colorDiv}
          style={{backgroundColor: category.color}}
          className={styles.colorDisplayer}
          onClick={() => {
            setColor(category ? category.color : '')
            const rect = colorDiv.current.getBoundingClientRect()
            console.log('picked', rect.top)
            setSelectingColor(category)
            setColorPos(rect.top)
          }}
          ></div>
      </div>
    </>
  )
}

function AddCategoryBtn({ display, setDisplay, selected, setSelected, setSelectingColor, selectingColor }) {
  return (
    <>
      <div className={styles.addCategoryBtn} onClick={() => {
        const category = new classCategory.Category('')
        utils.getGlobals().categories.add(category)
        const newElement = (
          <Category
            key={category.categId}
            category={category}
            selected={selected}
            setSelected={setSelected}
            setSelectingColor={setSelectingColor}
            selectingColor={selectingColor}
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
  useEffect(() => {
    if (on) {
      setSelected(utils.getGlobals().selectedCategory)
      const categClass = utils.getGlobals().categories
      const categIds = categClass.categIds
      if (categClass.isChanged) {
        const toDisplay = []
        for (const categId of categIds) {
          const category = categClass.getById(categId)
          toDisplay.push(
            <Category
              key={categId}
              category={category}
              selected={selected}
              setSelected={setSelected}
              setColorPos={setColorPos}
              setColor={setColor}
              setSelectingColor={setSelectingColor}
              ></Category>
          )
        }
        setDisplay(toDisplay)
      }
    } else {
      setSelected(false)
    }
    spring.start({
      opacity: on ? 1 : 0,
      marginTop: on ? 0 : -50,
    })
  }, [ on, selected, toUpdate ])
  return (
    <>
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