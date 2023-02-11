import React, { useEffect, useState } from 'react'
import styles from '../select.module'
import * as utils from '../../utils'
import { BackgroundClickDetector } from '../../../BackgroundClickDetector'
import * as funcs from './funcs'

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

function SettingBtn({ arr, setArr, index, openedTrain, viewing, children }) {
  const [ clicked, setClicked ] = useState(arr[index][1])
  const [ forceDisable, setForceDisable ] = useState(false)
  const [ categCount, setCategCount ] = useState(null)
  const [ hover, setHover ] = useState(false)
  const disable = () => {
    let newArr = [...arr]
    newArr[index][1] = false
    setArr(newArr)
    setClicked(false)
  }
  const enable = () => {
    let newArr = [...arr]
    newArr[index][1] = true
    setArr(newArr)
    setClicked(true)
  }
  useEffect(() => {
    if (viewing) {
      const count = funcs.networkHasHowManyOfCateg(5, children[0], viewing)
      const isDisabled = count < 5
      setForceDisable(isDisabled ? 1 : 0)
      setClicked(isDisabled)
      setCategCount(count)
    }
  }, [ openedTrain ])
  const getMsg = () => {
    switch (forceDisable) {
      case 0:
        return ""  
      case 1:
        return `There are ${categCount ? "only "+categCount : "not enough"} ${children[0]}s filled in the web. Please fill at in at least 5.`
      case 2:
        return `This bud does not have ${children[0]} filled in. Please do so to enable ${children[0]}s.`
    }
  }
  return (
    <>
      <button
        className={clicked ? styles.trainSettingsBtnClose : styles.trainSettingsBtnOpen}
        onClick={() => {
          if (forceDisable) return
          if (clicked) {
            disable()
            return
          }
          enable()
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >{children}</button>
      (
        forceDisable ?
        <Prompt on={hover}>
          {getMsg()}
        </Prompt>
        :
        <>
        </>
      )
    </>
  )
}

const haveDetails = (bud) => {
  let have = 0
  for (const [ type ] of potentialGiven) {
    if (have > 1) return true
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

const isAllDisabled = (arr) => {
  for (const one in arr) {
    if (one[1] === false) return false
  }
  return true
}

function SetCanTrain({ viewing, setCanTrain, openedTrain, givenArr, testedArr }) {
  useEffect(() => {
    const object = utils.getObjById(viewing)
		if (object) {
			console.log(object.hasAtLeastNeighbours(5))
		}
    if (object === false) return
    if (!enoughRandoms()) setCanTrain(3)
    if (!object.hasAtLeastNeighbours(5)) {
      setCanTrain(1)
    } else if (!enoughDetails(object)) {
      setCanTrain(2)
    } else if (isAllDisabled(givenArr) || isAllDisabled(testedArr)) {
      setCanTrain(3)
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
        <SettingBtn
          arr={toGive}
          setArr={setToGive}
          index={index}
          key={type}
          openedTrain={openedTrain}
          viewing={viewing}
        >{type}</SettingBtn>
      )
    })
    setRenderedGive(toRenderGive)
    const toRenderTested = potentialTested.map((type, index) => {
      return <SettingBtn
        arr={toTest}
        setArr={setToTest}
        index={index}
        key={type}
        openedTrain={openedTrain}
        viewing={viewing}
      >{type}</SettingBtn>
    })
    setRenderedTest(toRenderTested)
  }, [ toGive, toTest, openedTrain ])

  const getMsg = () => {
    switch (canTrain) {
      case 1:
        return "Woah, don't start training right yet. This bud needs some friends first. Link it to a network of at least <b>5 buds</b> first by connecting them with silks."
      case 2:
        return "Please fill in some bud details for this bud and at least 1 of its neighbours before starting."
      case 3:
        return "Please enable at least one bud detail."
      case 4:
        return "Please fill in at least 5 bud details in the entire web (for randoms in multi choice)"
    }
  }
  return (
    <div
      className={openedTrain ? styles.trainSettings : styles.none}>
      <SetCanTrain
        setCanTrain={setCanTrain}
        viewing={viewing}
        openedTrain={openedTrain}
        givenArr={toGive}
        testedArr={toTest}
      ></SetCanTrain>
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
          {getMsg()}
        </Prompt>
      </button>
    </div>
  )
}
export { TrainSettings }
