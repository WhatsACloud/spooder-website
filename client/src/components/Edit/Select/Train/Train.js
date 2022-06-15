import React, { useEffect, useState } from 'react'
import styles from '../select.module'
import * as utils from '../../utils'

import { TrainSettings, potentialGiven, potentialTested } from './TrainSettings'

const getLink = (objId, isObj=false) => {
  const obj = isObj ? objId : utils.getObjById(objId) 
  return obj.json.link
}

const setLink = (objId, val, isObj=false) => {
  if (isNaN(val) || val > 1 || val < 0) return false
  const obj = isObj ? objId : utils.getObjById(objId) 
  obj.json.link = val
}

const randomIndex = (arr) => {
  return Math.floor(Math.random() * arr.length)
}

const getRandomOfCateg = (categName, no, exclude=[]) => {
  exclude = exclude.map(e => String(e))
  const arr = []
  const excludedArr = []
  const objs = Object.values(utils.getObjs())
  if (no > objs.length) no = objs.length
  for (let i = 0; i < no; i++) {
    const index = randomIndex(objs)
    let val = objs[index].json[categName]
    objs.splice(index, 1)
    if (val.constructor === String && val.length === 0) continue
    if (exclude.includes(val)) {
      val = null
      excludedArr.push(arr.length)
    }
    arr.push(val)
  }
  return [ arr, excludedArr ]
}

function Given({ text, type }) {
  return (
    <div className={styles.given}>
      <p className={styles.givenText}>{text}</p>
      <p className={styles.givenType}>{type}</p>
    </div>
  )
}

function MultiChoiceBtn({ val, setAnswer }) {
  return (
    <button className={styles.btn} onClick={() => setAnswer(val)}>{val}</button>
  )
}

const multiChoiceAmt = 4

function Train({ startedTraining }) {
  const [ multiChoices, setMultiChoices ] = useState()
  const [ answer, setAnswer ] = useState()
  useEffect(() => {
    if (startedTraining) {
      const multiChoiceArr = getRandomOfCateg('definition', multiChoiceAmt)
      for (let i = 0; i < multiChoiceAmt; i++) {
        if (multiChoiceArr[i]) {
          multiChoiceArr.push(
            <MultiChoiceBtn key={i} val={multiChoiceArr[i]} setAnswer={setAnswer}></MultiChoiceBtn>
          )
        }
      }
      setMultiChoices(multiChoiceArr)
    }
  }, [ startedTraining ])
  return (
    <div className={startedTraining ? styles.train : styles.none}>
      <Given text={'text test'} type={'word'}></Given>
      {multiChoices}
    </div>
  )
}

function TrainWrapper({ selectedObj, setSelectedObj, setStartedTraining, startedTraining }) {
  const [ currentObj, setCurrentObj ] = useState()
  const [ openedTrain, setOpenedTrain ] = useState(false)
  const [ trainingCols, setTrainingCols ] = useState({
    given: '',
    tested: null
  })
  const [ answered, setAnswered ] = useState(false)
  const [ toGive, setToGive ] = useState(potentialGiven)
  const [ toTest, setToTest ] = useState(potentialTested)
  useEffect(() => {
  }, [ answered, startedTraining, currentObj ])
  return (
    <>
      <Train startedTraining={startedTraining}></Train>
      <div className={startedTraining ? styles.none : ''}>
        <button
          className={styles.openTrainSettings}
          onClick={() => {
            setOpenedTrain(!openedTrain)
          }}>
          train
        </button>
        <TrainSettings
          openedTrain={openedTrain}
          setStartedTraining={setStartedTraining}
          setCurrentObj={setCurrentObj}
          setSelectedObj={setSelectedObj}
          selectedObj={selectedObj}
          toGive={toGive}
          setToGive={setToGive}
          toTest={toTest}
          setToTest={setToTest}
        ></TrainSettings>
      </div>
    </>
  )
}
export { TrainWrapper }