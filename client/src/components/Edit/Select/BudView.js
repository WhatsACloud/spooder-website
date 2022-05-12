import React, { useEffect, useState } from 'react'
import styles from './select.module'
import * as utils from '../utils'

function BudAttr({ id, placeholder, style, data, onChange }) {
  return (
    <div
      className={styles.attrBox}
      id={id}>
      <input
        value={data}
        onChange={onChange}
        className={style || styles.normal}
        placeholder={placeholder}>
      </input>
    </div>
  ) 
}

const budSample = {
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
    }
  ],
  "attachedTo": [],
  "position": {},
  "type": "bud", // bud silk
  "operation": 'add' // add edit minus, default add,
}

const handleInputChange = (e, type, renderData, setRenderData, id, definitionNo=0) => {
  const newData = renderData
  const val = e.target.value
  const objs = utils.getObjs()
  console.log(newData, type, val)
  newData[type] = val
  const obj = objs[id]
  console.log(obj.word)
  switch (type) {
    case "word":
      obj.word = val
      break
    case "definition":
      obj.definitions[definitionNo].definition = val
      break
    case "sound":
      obj.definitions[definitionNo].sound = val
      break
    case "context":
      obj.definitions[definitionNo].context = val
      break
  }
  setRenderData(newData)
}

function BudView({ selectedObj }) {
  const [ definitionNo, setDefinitionNo ] = useState(0)
  const [ renderedExamples, setRenderedExamples ] = useState()
  const [ renderData, setRenderData ] = useState()
  useEffect(() => {
    console.log(selectedObj)
    if (!selectedObj) setRenderData()
    const obj = utils.getObjById(selectedObj)
    // const obj = budSample
    if (obj) {
      const currentDefinitionObj = obj.definitions[definitionNo]
      const data = {
        word: obj.word || null,
        definition: currentDefinitionObj.definition || null,
        sound: currentDefinitionObj.sound || null,
        context: currentDefinitionObj.context || null,
        link: currentDefinitionObj.link
      }
      setRenderData(data)
    }
  }, [ selectedObj ])
  console.log(renderData)
  const handleInputChangeWrapper = (type) => {
    return (e) => handleInputChange(e, type, renderData, setRenderData, selectedObj, definitionNo)
  }
  return (
    <div className={selectedObj ? styles.BudView : styles.none} id='BudView'>
      <BudAttr
        id='word'
        data={renderData ? renderData.word: ''}
        onChange={handleInputChangeWrapper('word')}
        placeholder='insert word'></BudAttr>
      <BudAttr
        id='definition'
        data={renderData ? renderData.definition: ''}
        onChange={handleInputChangeWrapper('definition')}
        placeholder='definition'
        style={styles.definition}></BudAttr>
      <BudAttr
        id='sound'
        data={renderData ? renderData.sound: ''}
        onChange={handleInputChangeWrapper('sound')}
        placeholder='sound'
        style={styles.sound}></BudAttr>
      <div
        id='context'
        className={styles.attrBox}>
        <textarea
          placeholder='context'
          value={renderData ? renderData.context: ''}
          onChange={handleInputChangeWrapper('context')}
          className={styles.context}></textarea>
      </div>
      <div
        id='examples'
        className={styles.examplesBox}>
        {renderedExamples}
      </div>
    </div>
  )
}
export { BudView }