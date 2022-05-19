import React, { useEffect, useState } from 'react'
import styles from './select.module'
import * as utils from '../utils'

import { budSample } from '../spoodawebSampleData'

const definitionSample = {
  "definition": "",
  "sound": "",
  "context": "",
  "examples": [],
  "link": 0,
  "arrID": null
}

const newDefinition = (objId) => {
  const nextArrID = utils.getNextHighestAttr(utils.getObjById(objId).definitions, 'arrID')
  const obj = utils.getObjById(objId)
  const index = obj.definitions.length
  obj.definitions.push({...budSample.definitions[0]})
  console.log(obj.definitions)
  obj.definitions[index].arrID = nextArrID
}

function BudAttr({ id, placeholder, style, data, onChange }) {
  return (
    <div
      className={styles.attrBox}
      id={id}>
      <input
        name={id}
        value={data}
        onChange={onChange}
        className={style || styles.normal}
        placeholder={placeholder}>
      </input>
    </div>
  ) 
}

const otherBudSample = {
  "name": "gay",
  "definitions": [
    {
      "definition": "definition 1",
      "sound": "sound 1",
      "context": "context 1",
      "examples": [
        "example 1",
        "example 2"
      ],
      "link": 0.2 
    },
    {
      "definition": "definition 2",
      "sound": "sound 2",
      "context": "context 2",
      "examples": [
        "example 3",
        "example 4"
      ],
      "link": 0.69 
    }
  ],
  "attachedTo": [],
  "position": {},
  "type": "bud", // bud silk
  "operation": 'add' // add edit minus, default add,
}

const handleInputChange = (e, type, renderData, setRenderData, id, definitionNo=0) => {
  const newData = {...renderData}
  const val = e.target.value
  console.log(newData, type, val)
  newData[type] = val
  const obj = utils.getObjById(id)
  if (type === "word") {
    utils.updateObj(id, {word: val})
  } else {
    obj.definitions[definitionNo][type] = val
    utils.updateNewObjs(id, obj)
  }
  setRenderData(newData)
}

const addExample = (setRenderData, renderData, objId, definitionNo) => {
  const obj = utils.getObjById(objId)
  obj.definitions[definitionNo].examples.push({
    text: renderData.newExample,
    arrID: utils.getNextHighestAttr(obj.definitions, 'arrID')
  })
  setRenderData({
    ...renderData,
    "newExample": ''
  })
}

function BudView({ selectedObj }) {
  const [ canRender, setCanRender ] = useState(false)
  const [ definitionNo, setDefinitionNo ] = useState(0)
  const [ renderedExamples, setRenderedExamples ] = useState()
  const originalRenderData = {
    word: '',
    definition: '',
    sound: '',
    context: '',
    newExample: ''
  }
  const [ renderData, setRenderData ] = useState(originalRenderData)
  const [ triggerRerender, setTriggerRerender ] = useState(false)
  const handleInputChangeWrapper = (type) => {
    return (e) => handleInputChange(e, type, renderData, setRenderData, selectedObj, definitionNo)
  }
  useEffect(() => {
    // selectedObj = 6
    if (!selectedObj) setRenderData(originalRenderData); setCanRender(false)
    const obj = utils.getObjById(selectedObj)
    // const obj = budSample
    if (obj && obj.type === 'bud') {
      setCanRender(true)
      // console.log(obj, selectedObj)
      // console.log(utils.getObjs())
      const currentDefinitionObj = obj.definitions[definitionNo]
      const data = {
        word: obj.word || '',
        definition: currentDefinitionObj.definition || '',
        sound: currentDefinitionObj.sound || '',
        context: currentDefinitionObj.context || '',
        link: currentDefinitionObj.link
      }
      setRenderData(data)
      const examples = currentDefinitionObj.examples 
      const examplesRender = examples.map((example, index) => {
        return (
          <>
            <textarea
              placeholder='insert example'
              key={example.arrID}
              name={`example${index}`}
              value={example.text}
              onChange={handleInputChangeWrapper('example')}
              className={styles.example}></textarea>
          </>
        )
      })
      setRenderedExamples(examplesRender)
    }
  }, [ selectedObj, definitionNo, triggerRerender ])
  const subDefinitionNo = () => {
    console.log('sub')
    console.log(definitionNo)
    if (definitionNo-1 < 0) {
      setDefinitionNo(utils.getObjById(selectedObj).definitions.length-1)
      return
    }
    setDefinitionNo(definitionNo-1)
  }
  const addDefinitionNo = () => {
    if (definitionNo+1 > utils.getObjById(selectedObj).definitions.length-1) {
      setDefinitionNo(0)
      return
    }
    setDefinitionNo(definitionNo+1)
  }
  return (
    <div className={canRender ? styles.BudView : styles.none} id='BudView'>
      <BudAttr
        id='word'
        data={renderData.word}
        onChange={handleInputChangeWrapper('word')}
        placeholder='insert word'></BudAttr>
      <div
        className={styles.divWord}>
        <button onClick={subDefinitionNo}>a</button>
        <BudAttr
          id='definition'
          data={renderData.definition}
          onChange={handleInputChangeWrapper('definition')}
          placeholder='definition'
          style={styles.definition}></BudAttr>
        <button onClick={e => newDefinition(selectedObj)}>newDefinition</button>
        <button onClick={addDefinitionNo}>a</button>
      </div>
      <BudAttr
        id='sound'
        data={renderData.sound}
        onChange={handleInputChangeWrapper('sound')}
        placeholder='sound'
        style={styles.sound}></BudAttr>
      <div
        id='context'
        className={styles.attrBox}>
        <textarea
          name='context'
          placeholder='context'
          value={renderData.context}
          onChange={handleInputChangeWrapper('context')}
          className={styles.context}></textarea>
      </div>
      <div
        id='examples'
        className={styles.examplesBox}>
        <div className={styles.divNewExample}>
          <textarea
            placeholder='insert example'
            name={`newExample`}
            value={renderData.newExample}
            onChange={handleInputChangeWrapper('newExample')}
            className={styles.example}></textarea>
          <button
            className={styles.addExampleBtn}
            onClick={() => {
              addExample(setRenderData, renderData, selectedObj, definitionNo)
              setTriggerRerender(!triggerRerender)
            }}>
              Add example
            </button>
        </div>
        {renderedExamples}
      </div>
    </div>
  )
}
export { BudView }