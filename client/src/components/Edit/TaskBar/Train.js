import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import * as utils from '../utils'

const randomElementByStrength = (arr, strengthArrName) => {
  // return arr[Math.floor((Math.random()*arr.length))]
  const total = arr.reduce(
    (currentTotal, element) => currentTotal + element[strengthArrName],
    0
  )
  for (const element of arr) {
    const strength = (1 - Number(element[strengthArrName])) / total
    if (Math.random() < strength) {
      return element
    }
  }
}

const randomIndex = (length) => {
  return Math.floor((Math.random()*length))
}

const getOtherBudObjId = (silkObjId, objId) => {
  const silk = utils.getObjById(silkObjId)
  let budId = false
  console.log(silk)
  if (silk.attachedTo1 !== objId) {
    budId = silk.attachedTo1
  } else {
    budId = silk.attachedTo2
  }
  return budId
}

function Train({ selectedObj, setSelectedObj, setFocus }) {
  const [ currentObj, setCurrentObj ] = useState()
  const [ openedTrain, setOpenedTrain ] = useState(true)
  const [ startedTraining, setStartedTraining ] = useState(false)
  const [ trainingCols, setTrainingCols, ] = useState({
    given: '',
    tested: null
  })
  const [ notTested, setNotTested ] = useState([])
  const [ answer, setAnswer ] = useState('')
  const [ answered, setAnswered ] = useState(false)
  const [ correct, setCorrect ] = useState(false)
  const [ haveTested, setHaveTested ] = useState([])
  const [ testTimes, setTestTimes ] = useState()
  useEffect(() => {
    const multiChoiceAmt = 4
    if (answered) {
      const obj = utils.getObjById(currentObj)
      const attachedToObjIds = Object.keys(obj.attachedTo) 
      const attachedTo = attachedToObjIds[randomIndex(attachedToObjIds.length)]
      let nextBudId = getOtherBudObjId(attachedTo, currentObj)
      if (!nextBudId) {
        // nextBudId = 
      }
      setCurrentObj(nextBudId)
      setAnswered(false)
    }
    if (startedTraining) {
      console.log(currentObj)
      const obj = utils.getObjById(currentObj)
      const definition = randomElementByStrength(obj.definitions, "link")
      const possibleGiven = [
        obj.word,
        definition.definition,
        definition.sound,
        definition.context,
        ...definition.examples
      ]
      const possibleTested = [
        [obj.word, "word"],
        [definition.definition, "definition"],
        [definition.sound, "sound"]
      ]
      const testedIndex = randomIndex(possibleTested.length) 
      const testedDataArr = possibleTested[testedIndex]
      const tested = [testedDataArr[0], testedDataArr[1]]
      // const isMultiChoice = Math.random() < 0.5
      // const tested = ['asdf', "word"]
      const isMultiChoice = true
      let renderedTested = []
      const multiChoiceStrings = []
      const selectedType = testedDataArr[1]
      const budObjs = utils.getMainLayer().getAttr('budObjs')
      let sameTypeList = Object.values(budObjs).map( // ah yes very readable
        budObj => budObj[selectedType] ? budObj[selectedType]
                  : budObj.definitions[randomIndex(budObj.definitions.length)][selectedType]
      )
      sameTypeList = sameTypeList.filter(type => type !== tested[0])
      // console.log(sameTypeList, selectedType)
      if (isMultiChoice) {
        let putCorrect = false
        for (let index = 0; index < multiChoiceAmt; index++) {
          let isCorrect = false
          if (!putCorrect) {
            if (index >= multiChoiceAmt-1) {
              isCorrect = true
            } else {
              isCorrect = Math.random() < 1 / (Math.random() * 1) // random percentage
            }
            if (isCorrect) {
              putCorrect = true
            }
          }
          const typeListIndex = randomIndex(sameTypeList.length)
          let multiChoiceString
          multiChoiceString = isCorrect ? tested[0] : sameTypeList[typeListIndex]
          if (!isCorrect) {
            sameTypeList.splice(typeListIndex, 1)
          }
          renderedTested.push(
            <>
              <button
                className={styles.multiChoice}
                key={index}
                onClick={() => {
                  if (isCorrect) {
                    console.log('passed!')
                    setCorrect(true)
                  } else {
                    console.log('fail!')
                    setCorrect(false)
                  }
                  setAnswered(true)
                }}>
                {multiChoiceString}
              </button>
            </>
          )
        }
      } else {
        renderedTested = null
      }
      setTrainingCols({
        given: possibleGiven[randomIndex(possibleGiven.length)],
        tested: renderedTested,
        type: tested[1]
      })
    }
  }, [ answered, startedTraining, currentObj ])
  return (
    <div className={styles.trainWrapper}>
      <button
        className={styles.trainSettingsBtn}
        onClick={() => {
          setOpenedTrain(true)
          document.addEventListener('mousedown', e => {
            setOpenedTrain(false)
          })}}>
        train
      </button>
      <div
        className={openedTrain ? styles.trainSettings : styles.none}>
        <button
          className={styles.trainBtn}
          onMouseDown={() => {
            setStartedTraining(true)
            setFocus(selectedObj)
            setCurrentObj(selectedObj)
            setSelectedObj()
          }}>
          start
        </button>
      </div>
      <div
        className={startedTraining ? styles.divTraining : styles.none}>
        <p>{trainingCols.given || 'what the heck'}</p>
        <p>{trainingCols.type || ''}</p>
        <div className={styles.divTested}>
          {trainingCols.tested}
          <div className={trainingCols.tested ? styles.none : styles.inputTestedWrapper}>
            <input
              className={styles.inputTested}
              type="text"
              value={answer}
              onChange={e => {
                setAnswer(e.target.value)
              }}></input>
            <button
              className={styles.inputCheckBtn}
              onClick={() => {
                const tested = trainingCols.tested
                if (answer === tested) {
                  console.log('passed!')
                  setCorrect(true)
                } else {
                  console.log('fail!')
                  setCorrect(false)
                }
                setAnswered(true)
              }}>
              check
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export { Train }