import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import * as utils from '../utils'

const randomIndex = (length) => {
  return Math.floor((Math.random()*length))
}

const canTestGivenTst = (tst, trainIterNo, debug) => {
  // console.log(tst, trainIterNo, debug)
  console.log(tst, trainIterNo, debug)
  if (isNaN(tst) || isNaN(trainIterNo)) return false
  const diff = trainIterNo - tst
  let place = 1
  if (diff > 999) {
    place = 1000
  } else if (diff > 99) {
    place = 100
  } else if (diff > 9) {
    place = 10
  }
  const random = Math.random()
  return random < (Math.ceil(diff / place) / (place * 10))
}

const randomIndexByStrength = (arr, strengthArrName, trainIterNo=null) => {
  // return arr[Math.floor((Math.random()*arr.length))]
  let total = arr.reduce(
    (currentTotal, element) => {
      if (canTestGivenTst(element.tst, trainIterNo, "frick") || !element.tst) {
        return currentTotal + element[strengthArrName]
      }
      return currentTotal
    },
    0
  )
  if ((total !== 0) && (arr.length > 1)) {
    for (let index = 1; index < arr.length; index++) {
      const element = arr[index]
      let strength
      if (trainIterNo) {
      } else {
      }
      // console.log(trainIterNo, element)
      if (trainIterNo && (element.tst !== undefined)) {
        strength = (
          1
          - (
            Number(element[strengthArrName])
            / (total ? total : 1)
            / (10 + (trainIterNo - element.tst))
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

const getOtherBudObjId = (silk, objId) => {
  let budId = null
  if (Number(silk.attachedTo1) === Number(objId)) {
    budId = silk.attachedTo2
  } else if (Number(silk.attachedTo2) === Number(objId)) {
    budId = silk.attachedTo1
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
  useEffect(() => {
    const multiChoiceAmt = 4
    if (answered) {
      setFocus(currentObj)
      const obj = utils.getObjById(currentObj)
      const definition = obj.definitions[definitionNo]
      if (definition.link < 1 && correct) {
        definition.link += 0.1
      }
      console.log(currentObj, obj.word)
      const attachedToObjIds = Object.keys(obj.attachedTo) 
      console.log(utils.getObjById(attachedToObjIds[0]))
      if (attachedToObjIds.length < 2
        && !canTestGivenTst(utils.getObjById(attachedToObjIds[0]).tst, trainIterNo, "insert")
        && notTested.length > 0) {
        console.log('taking from notTested')
        const newNotTested = [...notTested]
        console.log(notTested)
        const randomTestedIndex = randomIndexByStrength(notTested.map(e => utils.getObjById(e.silk)), "strength", trainIterNo)
        const tested = newNotTested.splice(
          randomTestedIndex,
          1
        )[0]
        const silk = utils.getObjById(tested.silk)
        if (silk.strength < 1 && correct) {
          silk.strength += 0.1
        }
        const toBeObj = getOtherBudObjId(silk, tested.bud)
        // if (nextBudId in notTested) {
        //   const newNotTested = [...notTested].filter(e => e !== objId)
        //   setNotTested(newNotTested)
        // }
        setNotTested(newNotTested)
        setCurrentObj(toBeObj)
      } else {
        console.log('taking from attachedTos')
        const attachedTo = attachedToObjIds.splice(
          randomIndexByStrength(attachedToObjIds.map(e => utils.getObjById(e)), "strength", trainIterNo),
          1
        )
        const silk = utils.getObjById(attachedTo[0])
        silk.tst = trainIterNo
        if (silk.strength < 1 && correct) {
          silk.strength += 0.1
        }
        let nextBudId = getOtherBudObjId(silk, currentObj)
        const leobj = utils.getObjById(nextBudId)
        const definitionThing = leobj.definitions[definitionNo]
        const newNotTested = [...notTested]
        for (const objId of attachedToObjIds) {
          if (!(objId in newNotTested)
            && canTestGivenTst(utils.getObjById(objId).tst, trainIterNo)) {
            console.log(objId)
            newNotTested.push({"silk": objId, "bud": currentObj})
          }
        }
        setNotTested(newNotTested)
        setCurrentObj(nextBudId)
      }
      setAnswered(false)
    }
    if (startedTraining && !(answered)) {
      const obj = utils.getObjById(currentObj)
      const definitionIndex = randomIndexByStrength(obj.definitions, "link")
      const definition = obj.definitions[definitionIndex]
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
                    setCorrect(true)
                  } else {
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
                  setCorrect(true)
                } else {
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