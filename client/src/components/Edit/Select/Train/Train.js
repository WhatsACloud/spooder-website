import React, { useEffect, useState } from 'react'
import styles from './train.module'
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

function Train({ selectedObj, setSelectedObj, setFocus }) {
  /*
  tst stands for Time Since Tested, it is a number which is the
  iteration count (of training) when it was tested. It is found in
  silks, not buds.
  */
  const [ currentObj, setCurrentObj ] = useState()
  const [ openedTrain, setOpenedTrain ] = useState(false)
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
  const [ toGive, setToGive ] = useState(potentialGiven)
  const [ toTest, setToTest ] = useState(potentialTested)
  useEffect(() => {
    const multiChoiceAmt = 4
  }, [ answered, startedTraining, currentObj ])
  return (
    <div className={styles.trainWrapper} id='trainWrapper'>
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
        setFocus={setFocus}
        setCurrentObj={setCurrentObj}
        setSelectedObj={setSelectedObj}
        selectedObj={selectedObj}
        toGive={toGive}
        setToGive={setToGive}
        toTest={toTest}
        setToTest={setToTest}
        ></TrainSettings>
      <div
        className={startedTraining ? styles.divTraining : styles.none}
        id='divTraining'>
      </div>
    </div>
  )
}
export { Train }