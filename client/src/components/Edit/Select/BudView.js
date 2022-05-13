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
  const newData = renderData
  const val = e.target.value
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

function BudView({ selectedObj }) {
  const [ canRender, setCanRender ] = useState(false)
  const [ definitionNo, setDefinitionNo ] = useState(0)
  const [ totalDefinitionNo, setTotalDefinitionNo ] = useState()
  const [ renderedExamples, setRenderedExamples ] = useState()
  const [ renderData, setRenderData ] = useState()
  const handleInputChangeWrapper = (type) => {
    return (e) => handleInputChange(e, type, renderData, setRenderData, selectedObj, definitionNo)
  }
  useEffect(() => {
    // selectedObj = 6
    if (!selectedObj) setRenderData(); setCanRender(false)
    const obj = utils.getObjById(selectedObj)
    // const obj = budSample
    if (obj && obj.type === 'bud') {
      setCanRender(true)
      setTotalDefinitionNo(obj.definitions.length-1)
      console.log(obj, selectedObj)
      const currentDefinitionObj = obj.definitions[definitionNo]
      const data = {
        word: obj.word || null,
        definition: currentDefinitionObj.definition || null,
        sound: currentDefinitionObj.sound || null,
        context: currentDefinitionObj.context || null,
        link: currentDefinitionObj.link
      }
      setRenderData(data)
      const examples = currentDefinitionObj.examples 
      const examplesRender = examples.map((example) => {
        return (
          <>
            <textarea
              placeholder='insert example'
              value={example}
              onChange={handleInputChangeWrapper('example')}
              className={styles.example}></textarea>
          </>
        )
      })
      setRenderedExamples(examplesRender)
    }
  }, [ selectedObj, definitionNo ])
  const subDefinitionNo = () => {
    console.log('sub')
    console.log(definitionNo, totalDefinitionNo)
    if (definitionNo-1 < 0) {
      setDefinitionNo(totalDefinitionNo)
      return
    }
    setDefinitionNo(definitionNo-1)
  }
  const addDefinitionNo = () => {
    if (definitionNo+1 > totalDefinitionNo) {
      setDefinitionNo(0)
      return
    }
    setDefinitionNo(definitionNo+1)
  }
  return (
    <div className={canRender ? styles.BudView : styles.none} id='BudView'>
      <BudAttr
        id='word'
        data={renderData ? renderData.word: ''}
        onChange={handleInputChangeWrapper('word')}
        placeholder='insert word'></BudAttr>
      <div
        className={styles.divWord}>
        <button onClick={subDefinitionNo}>a</button>
        <BudAttr
          id='definition'
          data={renderData ? renderData.definition: ''}
          onChange={handleInputChangeWrapper('definition')}
          placeholder='definition'
          style={styles.definition}></BudAttr>
        <button onClick={addDefinitionNo}>a</button>
      </div>
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