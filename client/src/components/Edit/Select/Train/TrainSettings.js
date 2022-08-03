import React, { useEffect, useState } from 'react'
import styles from '../select.module'
import * as utils from '../../utils'
import { BackgroundClickDetector } from '../../../BackgroundClickDetector'

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

function SetCanTrain({ viewing, setCanTrain }) {
  useEffect(() => {
    const object = utils.getObjById(viewing)
    if (object?.attachedTos?.length === 0) {
      setCanTrain(false)
    } else {
      setCanTrain(true)
    }
  }, [ viewing ])
  return <></>
}

function Prompt({ on, children }) {
  const [ promptOn, setPromptOn ] = useState(false)
  useEffect(() => {
    setPromptOn(on)
  }, [ on ])
  return (
    <div
      className={promptOn ? styles.prompt : styles.invisiPrompt}
      >
      {children}
    </div>
  )
}

function TrainSettings({
  openedTrain,
  setStartedTraining,
  startedTraining,
  toGive,
  setToGive,
  toTest,
  setToTest,
  viewing,
 }) {
  const [ renderedGive, setRenderedGive ] = useState()
  const [ renderedTest, setRenderedTest ] = useState()
  const [ canTrain, setCanTrain ] = useState(false)
  const [ hovering, setHovering ] = useState(false)
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
      <SetCanTrain setCanTrain={setCanTrain} viewing={viewing}></SetCanTrain>
      <div className={styles.trainSettingsInner}>
        <div className={styles.givenCol}>
          <p>Given</p>
          {renderedGive}
        </div>
        <div className={styles.testedCol}>
          <p>Tested</p>
          {renderedTest}
        </div>
      </div>
      <button
        className={canTrain ? styles.trainBtn : styles.trainBtnDisabled}
        onMouseDown={() => {
          if (canTrain) setStartedTraining(true)
        }}
        onMouseEnter={() => {
          if (!canTrain) setHovering(true)
        }}
        onMouseLeave={() => {
          setHovering(false)
        }}
        >
        start
        <Prompt on={hovering}>
          <p>
            Woah, don't start training right yet. This bud needs some friends first. Link some buds to it with silks.
          </p>
        </Prompt>
      </button>
    </div>
  )
}
export { TrainSettings }