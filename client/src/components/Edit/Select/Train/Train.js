import React, { useEffect, useState, useRef } from 'react'
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

const randomIndexFrRange = (num) => {
  return Math.floor(Math.random() * num)
}

const randIndexFrArr = (arr) => {
  return arr[randomIndexFrRange(arr.length)]
}

const range = (start, stop, step=1) => 
  Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step))

const randRGB = (min=0, max=255) => {
  const rgb = []
  for (let i = 0; i < 3; i++) {
    rgb.push(randIndexFrArr(range(min, max)))
  }
  return rgb
}


const getNotEmptyOfCateg = (categName) => {
  const objs = Object.values(utils.getObjs()).filter(obj => String(obj.json[categName]).length > 0)
  return objs
}

const getRandomOfCateg = (categName, no, exclude=[]) => {
  exclude = exclude.map(e => String(e))
  const arr = []
  const excludedArr = []
  const objs = getNotEmptyOfCateg(categName).filter(obj => !(exclude.includes(obj.json[categName])))
  if (no > objs.length) no = objs.length
  for (let i = 0; i < exclude.length; i++) {
    const randomElement = randomIndexFrRange(no, excludedArr)
    // console.log(randomElement)
    excludedArr.push(randomElement)
  }
  for (let i = 0; i < no; i++) {
    if (excludedArr.includes(i)) {
      arr.push(null)
      continue
    }
    const index = randomIndexFrRange(objs.length)
    let val = objs[index].json[categName]
    objs.splice(index, 1)
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

const randomOfNum10 = (total) => {
  const val = Math.floor(Math.random() * total * 10) / 10
  return val
}

const getRandEleByLink = (objIds, ctt, categName=null) => { // ctt: current times tested
  let total = 0
  const _links = {}
  for (const objId of objIds) {
    const obj = utils.getObjById(objId)
    const link = 1 - obj.json.link
    total += link
    _links[objId] = link
  }
  const links = Object.entries(_links)
    .sort((a, b) => {
      return a[1] - b[1]
    })
  if (total / objIds.length < 0.3) total = 5
  while (true) {
    for (let [ objId, link ] of links) {
      let num = randomOfNum10(total)
      const obj = utils.getObjById(objId)
      const tst = obj.tst
      const ceil = 2
      if (ctt - tst > ceil) obj.tst = 0
      if (tst > 0 && ctt - tst < ceil) num += ctt - tst
      if (link === 0) link = 0.1
      if (link > num) {
        if (categName !== null && String(obj.json[categName]).length === 0) continue
        obj.tst = ctt
        return objId
      }
    }
  }
}

const colorMap = [
  "#db9600",
  "#07cddb",
  "#0ad100",
  "#7d00d1",
]

function MultiChoiceBtn({ i, val, correct, setAnswer }) {
  const [ font_size, set_font_size ] = useState(40)
  const button = useRef(null)
  useEffect(() => {
    const func = () => {
      console.log('resized')
      const buttonWidth = button.current.offsetWidth
      const length = val.length || 1
      const lefontSize = 30
      const mult = (buttonWidth / (lefontSize * length))
      let fontSize = lefontSize * mult
      if (fontSize > lefontSize) fontSize = lefontSize
      console.log(fontSize)
      set_font_size(fontSize)
    }
    window.onresize = func
    func()
  }, [])
  return (
    <button ref={button} style={{backgroundColor: colorMap[i], fontSize: font_size}} className={styles.btn} onClick={() => setAnswer(correct)}>{val}</button>
  )
}

function AnswerHandler({ answer, triggerRerender, globalTsts, viewing, setViewing }) {
  useEffect(() => {
    if (answer) {
      const obj = utils.getObjById(viewing)
      const attachedTos = obj.attachedTos
      const chosen = getRandEleByLink(attachedTos, globalTsts, "definition")
      console.log(chosen)
      if (Number(chosen) === 9) {
        console.log(utils.getObjById(chosen).json.definition, utils.getObjById(chosen).json.definition.length)
        throw new Error
      }
      setViewing(chosen)
    }
    triggerRerender()
  }, [ answer ])
  return <></>
}

const multiChoiceAmt = 4

function Train({ startedTraining, viewing, setViewing }) {
  const [ multiChoices, setMultiChoices ] = useState()
  const [ answer, setAnswer ] = useState(null)
  const [ rerender, plsRerender ] = useState(false)
  const [ globalTsts, setGlobalTsts ] = useState(0) // tsts: time since test started
  const triggerRerender = () => {
    setAnswer(null)
    plsRerender(!rerender)
  }
  useEffect(() => {
    if (startedTraining) {
      setGlobalTsts(globalTsts+1)
      const viewingVal = utils.getObjById(viewing).json.definition
      const [ multiChoiceArr ] = getRandomOfCateg('definition', multiChoiceAmt, [viewingVal])
      const renderedMultiChoiceArr = []
      for (let i = 0; i < multiChoiceAmt; i++) {
        renderedMultiChoiceArr.push(
          <MultiChoiceBtn
            key={i}
            i={i}
            val={multiChoiceArr[i] === null ? viewingVal : multiChoiceArr[i]}
            correct={multiChoiceArr[i] === null}
            setAnswer={setAnswer}
            ></MultiChoiceBtn>
        )
      }
      setMultiChoices(renderedMultiChoiceArr)
    }
  }, [ startedTraining, rerender ])
  return (
    <>
      <AnswerHandler
        answer={answer}
        triggerRerender={triggerRerender}
        globalTsts={globalTsts}
        viewing={viewing}
        setViewing={setViewing}
        ></AnswerHandler>
      <div className={startedTraining ? styles.train : styles.none}>
        <Given text={viewing ? utils.getObjById(viewing).json.word : ''} type={'word'}></Given>
        <div className={styles.input}>
          {multiChoices}
        </div>
      </div>
    </>
  )
}

function TrainWrapper({ selectedObj, setSelectedObj, setStartedTraining, startedTraining, viewing, setViewing }) {
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
      <Train startedTraining={startedTraining} viewing={viewing} setViewing={setViewing}></Train>
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