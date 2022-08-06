import React, { useEffect, useState, useRef } from 'react'
import styles from '../select.module'
import * as utils from '../../utils'

import uuid from 'react-uuid'

import { useSpring, animated } from 'react-spring'

import { TrainSettings, potentialGiven, potentialTested } from './TrainSettings'
import { BackgroundClickDetector } from '../../../BackgroundClickDetector'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'

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

const multiChoicePosMap = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
]

function MultiChoiceBtn({ i, val, correct, setAnswer, isAnimated=false }) {
  const [ font_size, set_font_size ] = useState(40)
  const [ firstTime, setFirstTime ] = useState(true)
  const button = useRef(null)
  const [ divStyle, divSpring ] = useSpring(() => ({
    width: 50,
    height: 100,
    opacity: 1,
    marginLeft: multiChoicePosMap[i][0] ? 50 : 0,
    marginTop: multiChoicePosMap[i][1] ? 100 : 0,
    config: {
      duration: 200,
    },
  }))
  useEffect(() => {
    if (firstTime && isAnimated) {
      setFirstTime(false)
      divSpring.start({
        width: correct ? 60 : 50,
        height: correct ? 200 : 100,
        opacity: correct ? 1 : 0,
        marginLeft: correct ? 20 : (multiChoicePosMap[i][0] ? 50 : 0),
        marginTop: correct ? -90 : (multiChoicePosMap[i][1] ? 100 : 0),
      })
    }
    const func = () => {
      const buttonWidth = button.current.getBoundingClientRect().width
      const length = val?.length || 1
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
    <animated.button ref={button} style={{
      width: isAnimated ? divStyle.width.to(v => v+"%") : '',
      height: isAnimated ? divStyle.height.to(v => v + 'px') : '',
      opacity: isAnimated ? divStyle.opacity.to(v => v) : '',
      marginLeft: divStyle.marginLeft.to(v => v + '%'),
      marginTop: divStyle.marginTop.to(v => v + 'px'),
      backgroundColor: colorMap[i],
      fontSize: font_size + 'px',
    }} className={styles.btn} onClick={() => setAnswer(correct)}>{val}</animated.button>
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

const getNextSet = (answer, viewing, globalTsts, setStartedTraining, setShowCorrectAnswer, callback, delay=true) => {
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
    setTimeout(() => {
      if (answer) {
        callback(chosen, leGivenCateg, leTestedCateg)
        return
      }
      setShowCorrectAnswer(true)
    }, delay ? 500 : 0)
  }
}

function AnswerHandler({ answer, triggerRerender, globalTsts, viewing, setViewing, setStartedTraining, setGivenCateg, setTestedCateg, setIsMultiChoice, setShowCorrectAnswer, isMultiChoice }) {
  useEffect(() => { // to fix issue with given not displaying
    getNextSet(answer, viewing, globalTsts, setStartedTraining, setShowCorrectAnswer, (chosen, leGivenCateg, leTestedCateg) => {
      setViewing(chosen)
      setGivenCateg(leGivenCateg)
      setTestedCateg(leTestedCateg)
      setIsMultiChoice(coinFlip())
      triggerRerender()
    })
  }, [ answer ])
  return <></>
}

const coinFlip = () => {
  return Math.random() > 0.5
}

function FreeAnswer({ isMultiChoice, testedCateg, viewing, rerender, setAnswer, answer }) {
  const [ val, setVal ] = useState("")
  useEffect(() => {
    setVal("")
    document.getElementById('freeAnswer').focus()
  }, [ rerender ])
  return (
    <div
      style={{
        opacity: answer === false ? 0 : 1
      }}
      className={isMultiChoice ? styles.none : styles.freeAnswer}>
      <input
        id="freeAnswer"
        name="freeAnswer"
        value={val}
        onChange={e => setVal(e.target.value)}
        ></input>
      <button
        onClick={() => {
          setAnswer(val.toLowerCase() === String(utils.getObjById(viewing).json[testedCateg]).toLowerCase())
        }}
      >Check</button>
    </div>
  )
}

function CorrectAnswer({
  showCorrectAnswer,
  testedCateg,
  answer,
  triggerRerender,
  globalTsts,
  viewing,
  setViewing,
  setStartedTraining,
  setGivenCateg,
  setTestedCateg,
  setIsMultiChoice,
  setShowCorrectAnswer,
  isMultiChoice,
}) {
  return (
    <div
      style={{
        opacity: showCorrectAnswer ? 1 : 0,
        pointerEvents: showCorrectAnswer ? 'all' : 'none',
      }}
      className={styles.correctAnswer}>
      <p
        style={{
          opacity: !isMultiChoice ? 1 : 0
        }}
        className={styles.ansText}
      >Answer</p>
      <p
        style={{
          opacity: !isMultiChoice ? 1 : 0
        }}
        className={styles.ans}
      >{utils.getObjById(viewing) ? utils.getObjById(viewing).json[testedCateg] : ''}</p>
      <button
        style={{
          marginTop: !isMultiChoice ? 0 : 120,
        }}
        onClick={() => {
          getNextSet(true, viewing, globalTsts, setStartedTraining, setShowCorrectAnswer, (chosen, leGivenCateg, leTestedCateg) => {
            setViewing(chosen)
            setGivenCateg(leGivenCateg)
            setTestedCateg(leTestedCateg)
            setIsMultiChoice(coinFlip())
            triggerRerender()
          }, false)
          setShowCorrectAnswer(false)
        }}
      >Next</button>
    </div>
  )
}

const multiChoiceAmt = 4

function Train({ startedTraining, viewing, setViewing, setStartedTraining }) {
  const [ multiChoices, setMultiChoices ] = useState()
  const [ animatedMultiChoices, setAnimatedMultiChoices ] = useState()
  const [ answer, setAnswer ] = useState(null)
  const [ rerender, plsRerender ] = useState(false)

  const [ showCorrectAnswer, setShowCorrectAnswer ] = useState(false)

  const [ testedCateg, setTestedCateg ] = useState()
  const [ givenCateg, setGivenCateg ] = useState()

  const [ globalTsts, setGlobalTsts ] = useState(0) // tsts: time since test started

  const [ isMultiChoice, setIsMultiChoice ] = useState(true)
  const triggerRerender = () => {
    setAnswer(null)
    plsRerender(!rerender)
  }
  useEffect(() => {
    if (startedTraining && !showCorrectAnswer) {
      let leGivenCateg, leTestedCateg
      if (globalTsts === 0) {
        [ leGivenCateg, leTestedCateg ] = startedTraining ? randGivenTested(utils.getObjById(viewing)) : [ false, false ]
        setTestedCateg(leTestedCateg)
        setGivenCateg(leGivenCateg)
      }
      setGlobalTsts(globalTsts+1)
      const viewingJson = utils.getObjById(viewing).json
      if (isMultiChoice) {
        let [ multiChoiceArr ] = getRandomOfCateg(testedCateg || leTestedCateg, multiChoiceAmt, [ viewingJson[testedCateg || leTestedCateg] ])
        // known issue with example cause there isnt enough of em
        const renderedMultiChoiceArr = []
        const animatedMultiChoiceArr = []
        for (let i = 0; i < multiChoiceAmt; i++) {
          renderedMultiChoiceArr.push(
            <MultiChoiceBtn
              key={uuid()}
              i={i}
              // aniamted={false}
              val={multiChoiceArr[i] === null ? (viewingJson[testedCateg || leTestedCateg]) : multiChoiceArr[i]}
              correct={multiChoiceArr[i] === null}
              setAnswer={setAnswer}
              ></MultiChoiceBtn>
          )
          animatedMultiChoiceArr.push(
            <MultiChoiceBtn
              key={uuid()}
              i={i}
              isAnimated={true}
              val={multiChoiceArr[i] === null ? (viewingJson[testedCateg || leTestedCateg]) : multiChoiceArr[i]}
              correct={multiChoiceArr[i] === null}
              setAnswer={setAnswer}
              ></MultiChoiceBtn>
          )
        }
        setMultiChoices(renderedMultiChoiceArr)
        setAnimatedMultiChoices(animatedMultiChoiceArr)
      }
    }
  }, [ startedTraining, rerender, showCorrectAnswer ])
  return (
    <>
      <AnswerHandler
        isMultiChoice={isMultiChoice}
        answer={answer}
        setShowCorrectAnswer={setShowCorrectAnswer}
        setStartedTraining={setStartedTraining}
        triggerRerender={triggerRerender}
        globalTsts={globalTsts}
        viewing={viewing}
        setViewing={setViewing}
        categ={testedCateg}
        setGivenCateg={setGivenCateg}
        setTestedCateg={setTestedCateg}
        setIsMultiChoice={setIsMultiChoice}
        ></AnswerHandler>
      <div
        style={{
          boxShadow: `inset 0px 0px 25px 25px ${
            answer === null ? 'rgba(0, 0, 0, 0)' : (answer === false ? 'red' : 'green')
          }`
        }}
        className={startedTraining ? styles.train : styles.none}>
        <Given text={viewing ? utils.getObjById(viewing).json[givenCateg] : ''} type={givenCateg}></Given>
        <FontAwesomeIcon
          style={{
            color: answer === false ? 'red' : 'green',
          }}
          className={answer === null ? styles.invisiAnswerIcon : styles.answerIcon}
          icon={answer === false ? faCircleXmark : faCircleCheck}
          ></FontAwesomeIcon>
        <div className={isMultiChoice ? styles.multiChoice : styles.none}>
          {showCorrectAnswer ? animatedMultiChoices : multiChoices}
        </div>
        <FreeAnswer
          isMultiChoice={isMultiChoice}
          testedCateg={testedCateg}
          viewing={viewing}
          rerender={rerender}
          setAnswer={setAnswer}
          answer={answer}
          ></FreeAnswer>
        <CorrectAnswer
          showCorrectAnswer={showCorrectAnswer}
          testedCateg={testedCateg}
          viewing={viewing}
          answer={answer}
          triggerRerender={triggerRerender}
          globalTsts={globalTsts}
          setViewing={setViewing}
          setStartedTraining={setStartedTraining}
          setGivenCateg={setGivenCateg}
          setTestedCateg={setTestedCateg}
          setIsMultiChoice={setIsMultiChoice}
          setShowCorrectAnswer={setShowCorrectAnswer}
          isMultiChoice={isMultiChoice}
          ></CorrectAnswer>
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
      <Train
        startedTraining={startedTraining}
        setStartedTraining={setStartedTraining}
        viewing={viewing}
        setViewing={setViewing}
        ></Train>
      <div className={startedTraining ? styles.none : styles.trainWrapper}>
        <BackgroundClickDetector
          zIndex={5}
          on={openedTrain}
          mousedown={() => setOpenedTrain(false)}
          ></BackgroundClickDetector>
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
          viewing={viewing}
        ></TrainSettings>
      </div>
    </>
  )
}
export { TrainWrapper }