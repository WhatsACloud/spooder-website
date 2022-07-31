import React, { useEffect, useState } from 'react'
import styles from './select.module'
import * as utils from '../utils'

import { TrainWrapper } from './Train'

import { BackgroundClickDetector } from '../../BackgroundClickDetector'
import { DisplayCategories } from '../TaskBar/categories'

function InputIniter({ obj, setText, attr }) {
  useEffect(() => {
    console.log(obj?.json?.json, obj?.json?.json[attr], attr)
    if (obj) setText(obj.json[attr])
  }, [ obj ])
  return <></>
}

function InputBox({ obj, attr, styleName }) {
  const [ text, setText ] = useState('')
  useEffect(() => {
    if (obj) {
      obj.json[attr] = text
    }
  }, [ text ])
  return (
    <div className={styles[styleName]}>
      <InputIniter obj={obj} setText={setText} attr={attr}></InputIniter>
      <p className={styles.subtitle}>
        {`${attr[0].toUpperCase()}${attr.substring(1)}`}
      </p>
      <input className={styles.inputBox} value={text} onChange={(e) => setText(e.target.value)}></input>
    </div>
  )
}

function UpdateCategory({ obj, setCateg }) {
  useEffect(() => {
    if (obj) {
      const leCateg = utils.getGlobals().categories.getById(obj.json.categId)
      setCateg(leCateg)
    }
  }, [ obj ])
  return <></>
}

function CategoryBox({ obj, viewing }) {
  const [ categ, setCateg ] = useState(null)
  const [ dropdown, setDropdown ] = useState(false)
  const [ name, setName ] = useState('')
  useEffect(() => {
    // const timeout = setTimeout(() => {
    //   if (!obj) return
    //   for (const [ categId, category ] of Object.entries(utils.getGlobals().categories.categories)) {
    //     if (text === category.name) { // TO DO: change and optimise this, also add fuzzy searching
    //       obj.json.categId = Number(categId)
    //       console.log('added')
    //       break
    //     }
    //   }
    // }, 1000)
    // return () => {
    //   clearTimeout(timeout)
    // }
    setName(categ?.name)
  }, [ categ ])
  return (
    <>
      <UpdateCategory obj={obj} setCateg={setCateg}></UpdateCategory>
      <div
        className={styles.category}
        onClick={() => {
          utils.getGlobals().selectedCategory = utils.getObjById(viewing).json.categId
          setDropdown(true)
        }}
        >
        <p>{name}</p>
        {/* <input className={styles.inputBox} value={text} onChange={(e) => setText(e.target.value)}></input> */}
      </div>
      <div className={styles.wrapCategs}>
        <BackgroundClickDetector on={dropdown} zIndex={0} mousedown={() => {
          setDropdown(false)
          const selectedCateg = utils.getGlobals().selectedCategory
          obj.json.categId = selectedCateg
          setCateg(utils.getGlobals().categories.getById(selectedCateg))
        }}></BackgroundClickDetector>
      </div>
      <div className={styles.categs}>
        <DisplayCategories on={dropdown}></DisplayCategories>
      </div>
    </>
  )
}

function Viewer({ viewing, startedTraining }) {
  const [ obj, setObj ] = useState(null)
  useEffect(() => {
    const object = utils.getObjById(viewing)
    if (utils.getGlobals().recentlyViewed && object) {
      utils.addToRecentlyViewed(object)
    }
    if (object) {
      console.log(object.json.json, object.tsts, object.json.link)
    }
    setObj(object)
  }, [ viewing ])
  return (
    <div className={startedTraining ? styles.none : ''}>
      <InputBox obj={obj} attr='word' styleName='word'></InputBox>
      <CategoryBox obj={obj} viewing={viewing}></CategoryBox>
      {/* <InputBox obj={obj} attr='definition'></InputBox>
      <InputBox obj={obj} attr='sound'></InputBox>
      <InputBox obj={obj} attr='context'></InputBox>
      <InputBox obj={obj} attr='example'></InputBox> */}
    </div>
  )
}

function BudView({ selectedObj, setSelectedObj }) {
  const [ viewing, setViewing ] = useState(null)
  const [ startedTraining, setStartedTraining ] = useState(false)
  useEffect(() => {
    document.getElementById('divCanvas').addEventListener('mousedown', () => {
      setViewing(null)
    })
  }, [])
  return (
    <>
      {/* <BackgroundClickDetector on={viewing} zIndex={7} mousedown={() => setViewing(null)}></BackgroundClickDetector> */}
      <utils.SetGlobalReactSetter val={viewing} setVal={setViewing} namespace='viewing'></utils.SetGlobalReactSetter>
      <div className={viewing ? styles.budView : styles.none}>
        <TrainWrapper
          selectedObj={selectedObj}
          setSelectedObj={setSelectedObj}
          startedTraining={startedTraining}
          setStartedTraining={setStartedTraining}
          viewing={viewing}
          setViewing={setViewing}
          ></TrainWrapper>
        <Viewer viewing={viewing} startedTraining={startedTraining}></Viewer>
      </div>
    </>
  )
}
export { BudView }