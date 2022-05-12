import React, { useEffect, useState } from 'react'
import styles from './select.module'
import * as utils from '../utils'

function BudAttr({ id, placeholder, style }) {
  return (
    <div
      className={styles.attrBox}
      id={id}>
      <input
        className={style || styles.normal}
        placeholder={placeholder}>
      </input>
    </div>
  ) 
}

function example() {
  return (

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

function BudView({ selectedObj }) {
  const [ obj, setObj ] = useState(budSample)
  const [ definitionNo, setDefinitionNo ] = useState(0)
  const [ renderedExamples, setRenderedExamples ] = useState()
  useEffect(() => {
    const actualObj = utils.getObjById(selectedObj)
    setObj(budSample)
    console.log(actualObj)
  }, [ selectedObj ])
  return (
    <div className={obj ? styles.BudView : styles.none} id='BudView'>
      <BudAttr
        id='word'
        placeholder='insert word'></BudAttr>
      <BudAttr
        id='definition'
        placeholder='definition'
        style={styles.definition}></BudAttr>
      <BudAttr
        id='sound'
        placeholder='sound'
        style={styles.sound}></BudAttr>
      <div
        id='context'
        className={styles.attrBox}>
        <textarea
          placeholder='context'
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