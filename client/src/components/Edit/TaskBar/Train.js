import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import * as utils from '../utils'

const randomIndex = (length) => {
  return Math.floor((Math.random()*length))
}

const randomIndexByStrength = (arr, strengthArrName, trainIterNo=null) => {
  // return arr[Math.floor((Math.random()*arr.length))]
  console.log(arr, strengthArrName)
  let total = arr.reduce(
    (currentTotal, element) => {
      console.log(currentTotal, element[strengthArrName])
      return currentTotal + element[strengthArrName]
    },
    0
  )
  if (total !== 0) {
    for (let index = arr.length < 2 ? 0 : 1; index < arr.length; index++) {
      const element = arr[index]
      let strength
      if (trainIterNo && (element.tst !== undefined)) {
        strength = (
          1
          - (
            Number(element[strengthArrName])
            / (total ? total : 1)
            / (10 - trainIterNo - element.tst)
          )
        )
      } else {
        strength = (
          1
          - (
            Number(element[strengthArrName])
            / (total ? total : 1)
          )
        )
      }
      console.log(arr, index, element[strengthArrName], strength, trainIterNo)
      // console.log(strength, element, strengthArrName, arr)
      strength = strength ? strength : 0.1
      if (Math.random() < strength) {
        return index
      }
    }
  } else {
    return randomIndex(arr.length)
  }
  return arr.length-1
}

const getOtherBudObjId = (silkObjId, objId) => {
  const silk = utils.getObjById(silkObjId)
  let budId = false
  if (silk.attachedTo1 !== objId) {
    budId = silk.attachedTo1
  } else {
    budId = silk.attachedTo2
  }
  return budId
}

function Train({ selectedObj, setSelectedObj, setFocus }) {
  /*
  tst stands for Time Since Tested, it is a number which is the
  iteration count (of training) when it was tested. It is found in
  silks, not buds.
  */
  const [ currentObj, setCurrentObj ] = useState()
  const [ openedTrain, setOpenedTrain ] = useState(true)
  const [ startedTraining, setStartedTraining ] = useState(false)
  const [ trainingCols, setTrainingCols, ] = useState({
    given: '',
    tested: null
  })
  const [ trainIterNo, setTrainIterNo ] = useState(0) // zero based index 
  const [ definitionNo, setDefinitionNo ] = useState()
  const [ notTested, setNotTested ] = useState([])
  const [ answer, setAnswer ] = useState('')
  const [ answered, setAnswered ] = useState(false)
  const [ correct, setCorrect ] = useState(false)
  const [ haveTested, setHaveTested ] = useState([])
  const [ testTimes, setTestTimes ] = useState()
  useEffect(() => {
    const multiChoiceAmt = 4
    if (answered) {
      setFocus(currentObj)
      const obj = utils.getObjById(currentObj)
      obj.definitions[definitionNo].link += 0.1
      const attachedToObjIds = Object.keys(obj.attachedTo) 
      const attachedTo = attachedToObjIds.splice(
        randomIndexByStrength(attachedToObjIds.map(e => utils.getObjById(e)), "strength", trainIterNo),
        1
      )
      console.log(attachedTo)
      utils.getObjById(attachedTo).tst = 1
      let nextBudId = getOtherBudObjId(attachedTo, currentObj)
      if (!nextBudId) {
        console.log('nextBudId null')
        const newNotTested = [...notTested]
        const randomTestedIndex = randomIndexByStrength(notTested.map(e => utils.getObjById(e)), "strength", trainIterNo)
        const tested = newNotTested.splice(
          randomTestedIndex,
          1
        )
        utils.getObjById(randomTestedIndex).strength += 0.1
        setNotTested(newNotTested)
        setCurrentObj(tested)
      } else {
        console.log('nextBudId')
        if (nextBudId in notTested) {
          console.log('nextBudId in notTested')
          const newNotTested = [...notTested].filter(e => e !== objId)
          setNotTested(newNotTested)
        }
        setCurrentObj(nextBudId)
      }
      const newNotTested = [...notTested]
      for (const objId of attachedToObjIds) {
        if (!(objId in newNotTested)) {
          console.log(`pushed ${objId} into notTested`)
          newNotTested.push(objId)
        }
      }
      setAnswered(false)
    }
    if (startedTraining && !(answered)) {
      console.log(currentObj)
      const obj = utils.getObjById(currentObj)
      const definitionIndex = randomIndexByStrength(obj.definitions, "link")
      const definition = obj.definitions[definitionIndex]
      console.log(definitionIndex)
      setDefinitionNo(definitionIndex)
      const possibleGiven = [
        obj.word,
        // definition.definition,
        // definition.sound,
        // definition.context,
        // ...definition.examples
      ]
      const possibleTested = [
        [obj.word, "word"],
        // [definition.definition, "definition"],
        // [definition.sound, "sound"]
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
      setTrainIterNo(trainIterNo+1)
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