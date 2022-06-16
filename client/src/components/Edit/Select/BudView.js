import React, { useEffect, useState } from 'react'
import styles from './select.module'
import * as utils from '../utils'

import { TrainWrapper } from './Train'

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

function Viewer({ viewing, startedTraining }) {
  const [ obj, setObj ] = useState(null)
  useEffect(() => {
    const object = utils.getObjById(viewing)
    if (object) {
    }
    setObj(object)
  }, [ viewing ])
  return (
    <div className={startedTraining ? styles.none : ''}>
      <InputBox obj={obj} attr='word'></InputBox>
      <InputBox obj={obj} attr='definition'></InputBox>
      <InputBox obj={obj} attr='sound'></InputBox>
      <InputBox obj={obj} attr='context'></InputBox>
      <InputBox obj={obj} attr='example'></InputBox>
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
          ></TrainWrapper>
        <Viewer viewing={viewing} startedTraining={startedTraining}></Viewer>
      </div>
    </>
  )
}
export { BudView }