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
  if (no > objs.length) return [ false, false ]
  for (let i = 0; i < exclude.length; i++) {
    const randomElement = randomIndexFrRange(no, excludedArr)
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
    const leLink = 1 - obj.json.link
    const link = leLink === 0 ? 0.1 : leLink
    _links[objId] = link
  }
  const ceil = 5
  const leLinks = Object.entries(_links)
    .sort((a, b) => {
      return a[1] - b[1]
    })
  let links = leLinks.filter(([ objId ]) => {
      const obj = utils.getObjById(objId)
      const tsts = obj.tsts
      if (tsts === null) return true
      const diff = ctt - tsts
      if (diff > ceil) {
        obj.tsts = null
        return true
      }
      if (diff < 2) return false
      const rand = Math.random()
      const can = rand < diff / ceil
      return can
    })
  if (links.length === 0) return false
  for (const [ _, link ] of links) {
    total += link
  }
  if (categName !== null) {
    let containsCateg = false
    for (let [ objId ] of links) {
      const obj = utils.getObjById(objId)
      if (amtFilledCategs(obj).includes(categName)) {
        containsCateg = true
        break
      }
    }
    if (!containsCateg) return false
  }
  let start = 0
  const num = randomOfNum10(total)
  for (let [ objId, link ] of links) {
    const obj = utils.getObjById(objId)
    const tst = obj.tsts
    if (ctt - tst > ceil) obj.tsts = null
    if (num >= start && num <= link + start) {
      return objId
    }
    start += link
  }
}

const categs = [
  "word",
  "definition",
  "sound",
  "example",
]

const givenCategs = [
  "word",
  "definition",
  "sound",
]

const testedCategs = [
  "word",
  "definition",
  "sound",
  "example",
]

const randGivenTested = (obj) => {
  const categsFilled = amtFilledCategs(obj)
  const actualGivenCategs = givenCategs.filter(e => categsFilled.includes(e))
  if (actualGivenCategs.length < 1) return [ false, false ]
  const givenCateg = randIndexFrArr(actualGivenCategs)
  const actualTestedCategs = testedCategs
    .filter(e => categsFilled.includes(e)
      && e !== givenCateg
      && !(givenCateg !== 'word' && e === 'sound')
      && !(givenCateg === 'sound' && e !== 'word')
      && !(givenCateg === 'definition' && e === 'example')
    )
  if (actualTestedCategs.length < 1) return [ false, false ]
  let testedCateg = givenCateg
  const got = []
  while (testedCateg === givenCateg || !(ifBudsHaveNcategs(4, testedCateg))) {
    if (got.length === actualTestedCategs.length) return [ false, false ]
    testedCateg = randIndexFrArr(actualTestedCategs)
    if (!got.includes(testedCateg)) {
      got.push(testedCateg)
    }
  }
  return [ givenCateg, testedCateg ]
}

const amtFilledCategs = (obj) => {
  let included = []
  for (const categ of categs) {
    if (obj.json[categ] && String(obj.json[categ]).length > 0) included.push(categ)
  }
  return included
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
      const buttonWidth = button.current.offsetWidth
      const length = val.length || 1
      const lefontSize = 30
      const mult = (buttonWidth / (lefontSize * length))
      let fontSize = lefontSize * mult
      if (fontSize > lefontSize) fontSize = lefontSize
      set_font_size(fontSize)
    }
    window.onresize = func
    func()
  }, [ val ])
  return (
    <button ref={button} style={{backgroundColor: colorMap[i], fontSize: font_size}} className={styles.btn} onClick={() => setAnswer(correct)}>{val}</button>
  )
}

const ifBudsHaveNcategs = (n, categ) => {
  const objs = utils.getObjs()
  for (const obj of Object.values(objs)) {
    if (n <= 0) break
    if (obj.json[categ] && obj.json[categ].length > 0) n--
  }
  if (n === 0) return true
  return false
}

const ceil = 5

function AnswerHandler({ answer, categ, triggerRerender, globalTsts, viewing, setViewing, setStartedTraining, setGivenCateg, setTestedCateg }) {
  useEffect(() => { // to fix issue with given not displaying
    let leGivenCateg, leTestedCateg
    let obj = utils.getObjById(viewing)
    let amt = 0.1 * ((answer - 0.5) * 2)
    if (obj && answer !== null) {
      console.log('ran')
      obj.json.link += amt
      if (answer) obj.tsts = globalTsts
      let attachedTos = [...obj.attachedTos]
      if (attachedTos.length === 0) setStartedTraining(false)
      let chosen = getRandEleByLink(attachedTos, globalTsts)
      let i = utils.getGlobals().testedPath.length
      // let i = 0
      if (chosen !== false) {
        obj = utils.getObjById(chosen)
        const givenTested = randGivenTested(obj)
        leGivenCateg = givenTested[0]
        leTestedCateg = givenTested[1]
      }
      while (!leGivenCateg) {
        attachedTos = attachedTos.sort((a, b) => utils.getObjById(b).json.link - utils.getObjById(a).json.link)
        for (let index = 0; index < attachedTos.length; index++) {
          if (globalTsts - utils.getObjById(attachedTos[index]).tsts < ceil) continue
          chosen = attachedTos[index]
          obj = utils.getObjById(chosen)
          const givenTested = randGivenTested(obj)
          leGivenCateg = givenTested[0]
          leTestedCateg = givenTested[1]
          if (leGivenCateg) break
        }
        if (leGivenCateg) break
        if (i === 0) {
          chosen = getRandEleByLink(Object.keys(utils.getObjs()), globalTsts)
          console.log(chosen)
          obj = utils.getObjById(chosen)
          console.log(obj)
          const givenTested = randGivenTested(obj)
          console.log(givenTested)
          leGivenCateg = givenTested[0]
          leTestedCateg = givenTested[1]
          attachedTos = obj.attachedTos
          continue
        }
        obj = utils.getObjById(utils.getGlobals().testedPath[i-1])
        i--
        attachedTos = [...obj.attachedTos]
      }
      console.log(utils.getObjById(chosen).json, leGivenCateg, leTestedCateg)
      utils.getGlobals().testedPath.push(chosen)
      if (!(utils.getObjById(chosen).json[leGivenCateg])) {
        throw new Error
      }
      setViewing(chosen)
      if (answer !== null) {
        setGivenCateg(leGivenCateg)
        setTestedCateg(leTestedCateg)
      }
      triggerRerender()
    }
  }, [ answer ])
  return <></>
}

const multiChoiceAmt = 4

function Train({ startedTraining, viewing, setViewing, setStartedTraining }) {
  const [ multiChoices, setMultiChoices ] = useState()
  const [ answer, setAnswer ] = useState(null)
  const [ rerender, plsRerender ] = useState(false)

  const [ testedCateg, setTestedCateg ] = useState()
  const [ givenCateg, setGivenCateg ] = useState()

  const [ globalTsts, setGlobalTsts ] = useState(0) // tsts: time since test started
  const triggerRerender = () => {
    setAnswer(null)
    plsRerender(!rerender)
  }
  useEffect(() => {
    if (startedTraining) {
      let leGivenCateg, leTestedCateg
      if (globalTsts === 0) {
        [ leGivenCateg, leTestedCateg ] = startedTraining ? randGivenTested(utils.getObjById(viewing)) : [ false, false ]
        setTestedCateg(leTestedCateg)
        setGivenCateg(leGivenCateg)
      }
      setGlobalTsts(globalTsts+1)
      const viewingJson = utils.getObjById(viewing).json
      let [ multiChoiceArr ] = getRandomOfCateg(testedCateg || leTestedCateg, multiChoiceAmt, [ viewingJson[testedCateg || leTestedCateg] ])
      // known issue with example cause there isnt enough of em
      const renderedMultiChoiceArr = []
      for (let i = 0; i < multiChoiceAmt; i++) {
        renderedMultiChoiceArr.push(
          <MultiChoiceBtn
            key={i}
            i={i}
            val={multiChoiceArr[i] === null ? (viewingJson[testedCateg || leTestedCateg]) : multiChoiceArr[i]}
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
        setStartedTraining={setStartedTraining}
        triggerRerender={triggerRerender}
        globalTsts={globalTsts}
        viewing={viewing}
        setViewing={setViewing}
        categ={testedCateg}
        setGivenCateg={setGivenCateg}
        setTestedCateg={setTestedCateg}
        ></AnswerHandler>
      <div className={startedTraining ? styles.train : styles.none}>
        <Given text={viewing ? utils.getObjById(viewing).json[givenCateg] : ''} type={givenCateg}></Given>
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
      <Train startedTraining={startedTraining} setStartedTraining={setStartedTraining} viewing={viewing} setViewing={setViewing}></Train>
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