import React, { useEffect, useState, useRef } from 'react'
import styles from './category.module'

import { BackgroundClickDetector } from '../../../BackgroundClickDetector'
import { SearchBar } from '../Search'

import { HexColorPicker } from 'react-colorful'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

import * as classCategory from '../../Category'

import * as utils from '../../utils'

function Category({ category, selected, setColorPos, setSelected, setSelectingColor, setColor }) {
  const [ text, setText ] = useState(category.name)
  const colorDiv = useRef(null)
  useEffect(() => {
    category.name = text
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
            const rect = colorDiv.current.getBoundingClientRect()
            console.log('picked', rect.top)
            setSelectingColor(category)
            console.log(category.color)
            setColor(category ? category.color : '')
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
  }, [ selected ])
  return <></>
}

function DisplayCategories({ on }) {
  const [ display, setDisplay ] = useState()
  const [ selected, setSelected ] = useState(null)
  const [ selectingColor, setSelectingColor ] = useState(false)
  const [ colorPos, setColorPos ] = useState(0)
  const [ color, setColor ] = useState('')
  useEffect(() => {
    if (on) {
      const categClass = utils.getGlobals().categories
      if (categClass.isChanged) {
        const toDisplay = []
        for (const [ categId, category ] of Object.entries(categClass.categories)) {
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
    }
  }, [ on, selected ])
  return (
    <>
      <div className={on ? styles.wrapCategories : styles.none}>
        <div
          style={{top: colorPos}}
          className={selectingColor !== false ? styles.colorPicker : styles.none}>
          <HexColorPicker color={color} onChange={setColor}></HexColorPicker>
        </div>
        <UpdateSelected selected={selected}></UpdateSelected>
        <div
          className={styles.viewCategories}
          onClick={() => {
            setSelectingColor(false)
            setColorPos(0)
            setColor(null)
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
      </div>
    </>
  )
}
export { DisplayCategories }

function CategoryBtn({ setOpen }) {
  return (
    <button className={styles.openBtn} onClick={() => setOpen(true)}>View categories</button>
  )
}

function Categories() {
  const [ open, setOpen ] = useState(false)
  return (
    <>
      <BackgroundClickDetector
        on={open}
        zIndex={9}
        mousedown={() => setOpen(false)}
        ></BackgroundClickDetector>
      <CategoryBtn setOpen={setOpen}></CategoryBtn>
      <DisplayCategories on={open}></DisplayCategories>
    </>
  )
}
export { Categories }