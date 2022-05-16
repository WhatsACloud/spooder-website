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

const randomElement = (arr) => {
  return arr[Math.floor((Math.random()*arr.length))]
}

function Train({ selectedObj, setSelectedObj, setFocus }) {
  const [ currentObj, setCurrentObj ] = useState()
  const [ openedTrain, setOpenedTrain ] = useState(true)
  const [ startedTraining, setStartedTraining ] = useState(false)
  const [ trainingCols, setTrainingCols, ] = useState({
    given: '',
    tested: null
  })
  const [ answer, setAnswer ] = useState('')
  const [ answered, setAnswered ] = useState(false)
  useEffect(() => {
    const multiChoiceAmt = 4
    if (startedTraining) {
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
      // const tested = randomElement(possibleTested)
      // const isMultiChoice = Math.random() < 0.5
      const tested = ['asdf', "word"]
      const isMultiChoice = true
      let renderedTested
      const multiChoiceStrings = Array(multiChoiceAmt).fill(tested[0])
      if (isMultiChoice) {
        const multiChoices = Array.from(Array(multiChoiceAmt).keys())
        renderedTested = multiChoices.map(index => 
          <>
            <button
              className={styles.multiChoice}
              key={index}
              onClick={() => {
                console.log(multiChoiceStrings, index, tested[0])
                if (multiChoiceStrings[index] === tested[0]) {
                  console.log('passed!')
                } else {
                  console.log('fail!')
                }
              }}>
              {tested[0]}
            </button>
          </>
        )
      } else {
        renderedTested = null
      }
      setTrainingCols({
        given: randomElement(possibleGiven),
        tested: renderedTested,
        type: tested[1]
      })
    }
  }, [ answered, startedTraining ])
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
                console.log(answer, tested)
                if (answer === tested[0]) {
                  console.log('passed!')
                } else {
                  console.log('fail!')
                }
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