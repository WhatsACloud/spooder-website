import React, { useEffect, useState } from 'react'
import styles from './select.module'
import * as utils from '../utils'

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
      console.log(obj.json.json)
    }
  }, [ text ])
  return (
    <>
      <InputIniter obj={obj} setText={setText} attr={attr}></InputIniter>
      <input className={styles.inputBox} value={text} onChange={(e) => setText(e.target.value)}></input>
    </>
  )
}

function Trainer({ viewing }) {
  const [ obj, setObj ] = useState(null)
  useEffect(() => {
    const object = utils.getObjById(viewing)
    console.log(object)
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

function BudView() {
  const [ viewing, setViewing ] = useState(null)
  useEffect(() => {
    utils.getGlobals().setViewing = setViewing
  }, [])
  return (
    <>
      <BackgroundClickDetector on={viewing} zIndex={7} mousedown={() => setViewing(null)}></BackgroundClickDetector>
      <div className={viewing ? styles.budView : styles.none}>
        <Trainer viewing={viewing}></Trainer>
      </div>
    </>
  )
}
export { BudView }