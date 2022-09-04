import React, { useEffect, useState } from 'react'
import styles from '../select.module'
import * as utils from '../../utils'
import { BackgroundClickDetector } from '../../../BackgroundClickDetector'

const potentialGiven = [
  ["word", false],
  ["definition", false],
  ["sound", false],
  ["context", false],
  ["example", false],
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
    // console.log(clicked)
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

const haveDetails = (bud) => {
  let have = 0
  for (const [ type ] of potentialGiven) {
    if (have > 1) return true
    console.log(bud.json, type)
    if (bud.json[type].length > 0) have++
  }
  if (have > 1) return true
  return false
}

const enoughDetails = (bud) => {
  if (!haveDetails(bud)) return false
  for (const attachedId of bud.attachedTos) {
    const attachedTo = utils.getObjById(attachedId)
    if (haveDetails(attachedTo)) return true
  }
  return false
}

const enoughRandoms = () => {
  let have = 0
  for (const bud of Object.values(utils.getObjs())) {
    if (have > 4) return true
    if (haveDetails(bud)) have++
  }
  if (have > 4) return true
  return false
  
}

function SetCanTrain({ viewing, setCanTrain, openedTrain }) {
  useEffect(() => {
    const object = utils.getObjById(viewing)
    if (object === false) return
    if (!enoughRandoms()) setCanTrain(3)
    if (object?.attachedTos?.length === 0) {
      setCanTrain(1)
    } else if (!enoughDetails(object)) {
      setCanTrain(2)
    } else {
      setCanTrain(0)
    }
  }, [ viewing, openedTrain ])
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
  const [ canTrain, setCanTrain ] = useState(0) // 0 = can train 1 = no connections 2 = insufficient words 3 = insufficient total data
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
      <SetCanTrain setCanTrain={setCanTrain} viewing={viewing} openedTrain={openedTrain}></SetCanTrain>
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
        className={canTrain === 0 ? styles.trainBtn : styles.trainBtnDisabled}
        onMouseDown={() => {
          if (canTrain === 0) setStartedTraining(true)
        }}
        onMouseEnter={() => {
          if (!(canTrain === 0)) setHovering(true)
        }}
        onMouseLeave={() => {
          setHovering(false)
        }}
        >
        start
        <Prompt on={hovering}>
          {
            (() => {
              switch (canTrain) {
                case 1:
                  return (
                    <p>
                      Woah, don't start training right yet. This bud needs some friends first. Link some buds to it with silks.
                    </p>
                  )
                case 2:
                  return (
                    <p>
                      Please fill in some bud details for this bud and at least 1 of its neighbours before starting.
                    </p>
                  )
                case 3:
                  return (
                    <p>
                      Please fill in at least 5 bud details in the entire web (for randoms in multi choice)
                    </p>
                  )
              }
            })()
          }
        </Prompt>
      </button>
    </div>
  )
}
export { TrainSettings }