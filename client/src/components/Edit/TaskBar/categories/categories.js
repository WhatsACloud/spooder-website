import React, { useEffect, useState } from 'react'
import styles from './category.module'

import { BackgroundClickDetector } from '../../../BackgroundClickDetector'
import { SearchBar } from '../Search'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

import * as classCategory from '../../Category'

import * as utils from '../../utils'

function Category({ category }) {
  const [ text, setText ] = useState(category.name)
  useEffect(() => {
    category.name = text
  }, [ text ])
  return (
    <div className={styles.category}>
      <input
        type='text'
        onChange={e => {
          setText(e.target.value)
        }}
        value={text}
      ></input>
      <div style={{backgroundColor: category.color}} className={styles.colorDisplayer}></div>
    </div>
  )
}

function AddCategoryBtn({ display, setDisplay }) {
  return (
    <>
      <div className={styles.addCategoryBtn} onClick={() => {
        const category = new classCategory.Category('')
        utils.getGlobals().categories.add(category)
        const newElement = (
          <Category
            key={category.categId}
            category={category}
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

function DisplayCategories({ on }) {
  const [ display, setDisplay ] = useState()
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
              ></Category>
          )
        }
        setDisplay(toDisplay)
      }
    }
  }, [ on ])
  return (
    <div className={on ? styles.wrapCategories : styles.none}>
      <div className={styles.viewCategories}>
        <AddCategoryBtn 
          display={display}
          setDisplay={setDisplay}
          ></AddCategoryBtn>
        {display}
      </div>
    </div>
  )
}

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
        zIndex={7}
        mousedown={() => setOpen(false)}
        ></BackgroundClickDetector>
      <CategoryBtn setOpen={setOpen}></CategoryBtn>
      <DisplayCategories on={open}></DisplayCategories>
    </>
  )
}
export { Categories }