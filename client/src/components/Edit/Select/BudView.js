import React, { useEffect, useState } from 'react'
import styles from './select.module'
import * as utils from '../utils'

import { Train } from './Train'

import { BackgroundClickDetector } from '../../BackgroundClickDetector'

function InputIniter({ obj, setText, attr }) {
  useEffect(() => {
    if (obj) setText(obj.json[attr])
  }, [ obj ])
  return <></>
}

function InputBox({ obj, attr }) {
  const [ text, setText ] = useState('')
  useEffect(() => {
    if (obj) {
      obj.json[attr] = text
    }
  }, [ text ])
  return (
    <>
      <InputIniter obj={obj} setText={setText} attr={attr}></InputIniter>
      <p className={styles.subtitle}>
        {`${attr[0].toUpperCase()}${attr.substring(1)}`}
      </p>
      <input className={styles.inputBox} value={text} onChange={(e) => setText(e.target.value)}></input>
    </>
  )
}

function Viewer({ viewing }) {
  const [ obj, setObj ] = useState(null)
  useEffect(() => {
    const object = utils.getObjById(viewing)
    if (object) {
    }
    setObj(object)
  }, [ viewing ])
  return (
    <>
      <InputBox obj={obj} attr='word'></InputBox>
      <InputBox obj={obj} attr='definition'></InputBox>
      <InputBox obj={obj} attr='sound'></InputBox>
      <InputBox obj={obj} attr='context'></InputBox>
      <InputBox obj={obj} attr='example'></InputBox>
    </>
  )
}

function BudView({ selectedObj, setSelectedObj }) {
  const [ viewing, setViewing ] = useState(null)
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
        <Train
          selectedObj={selectedObj}
          setSelectedObj={setSelectedObj}
          ></Train>
        <Viewer viewing={viewing}></Viewer>
      </div>
    </>
  )
}
export { BudView }