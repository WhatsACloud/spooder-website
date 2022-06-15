import React, { useEffect, useState } from 'react'
import styles from '../select.module'
import * as utils from '../../utils'

const potentialGiven = [
  ["word", false],
  ["definition", false],
  ["sound", false],
  ["context", false],
  ["examples", false],
]
const potentialTested = [
  ["word", false],
  ["definition", false],
  ["sound", false],
]
export { potentialGiven, potentialTested }

function SettingBtn({ arr, setArr, index, children }) {
  const [ clicked, setClicked ] = useState(arr[index][1])
  useEffect(() => {
    console.log(clicked)
  }, [ clicked ])
  return (
    <button
      className={clicked ? styles.trainSettingsBtnClose : styles.trainSettingsBtnOpen}
      onClick={() => {
        let newArr = [...arr]
        newArr[index][1] = !newArr[index][1]
        setArr(newArr)
        setClicked(!clicked)
      }}>{children}</button>
  )
}

function TrainSettings({
  openedTrain,
  setStartedTraining,
  toGive,
  setToGive,
  toTest,
  setToTest,
 }) {
  const [ renderedGive, setRenderedGive ] = useState()
  const [ renderedTest, setRenderedTest ] = useState()
  useEffect(() => {
    const toRenderGive = potentialGiven.map((type, index) => {
      return (
        <SettingBtn arr={toGive} setArr={setToGive} index={index} key={type}>{type}</SettingBtn>
      )
    })
    setRenderedGive(toRenderGive)
    const toRenderTested = potentialTested.map((type, index) => {
      return <SettingBtn arr={toTest} setArr={setToTest} index={index} key={type}>{type}</SettingBtn>
    })
    setRenderedTest(toRenderTested)
  }, [ toGive, toTest ])
  return (
    <div
      className={openedTrain ? styles.trainSettings : styles.none}>
      <div className={styles.trainSettingsInner}>
        <div className={styles.givenCol}>
          {renderedGive}
        </div>
        <div className={styles.testedCol}>
          {renderedTest}
        </div>
      </div>
      <button
        className={styles.trainBtn}
        onMouseDown={() => {
          setStartedTraining(true)
          const func = e => {
            setStartedTraining(false)
            document.getElementById('divCanvas').removeEventListener('click', func)
          }
          document.getElementById('divCanvas').addEventListener('click', func)
        }}>
        start
      </button>
    </div>
  )
}
export { TrainSettings }