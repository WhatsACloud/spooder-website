import React, { useEffect, useState } from 'react'
import styles from './select.module'
import * as utils from '../utils'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'

import { budSample } from '../spoodawebSampleData'

import { BackgroundClickDetector } from '../../BackgroundClickDetector'

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
  "type": "bud" // bud silk
}

const handleInputChange = (e, type, renderData, setRenderData, id, definitionNo=0) => {
  const newData = {...renderData}
  const val = e.target.value
  console.log(newData, type, val)
  newData[type] = val
  const obj = utils.getObjById(id)
  if (type === "word") {
    // utils.updateObj(id, {word: val})
  } else {
    obj.definitions[definitionNo][type] = val
    // utils.updateNewObjs(id, obj)
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

const getOtherDef = (obj) => {
  return obj.definitions.length-1
}

function MoreBtn({ budId, setDefinitionNo, definitionNo, setSelectedObj }) {
  const [ clicked, setClicked ] = useState(false)
  return (
    <>
      <BackgroundClickDetector on={clicked} zIndex={1}></BackgroundClickDetector>
      <div className={styles.outerBudMenuDiv}>
        <button
          className={styles.more}
          onClick={e => {
            setClicked(!clicked)
            const func = e => {
              setClicked(false)
              document.getElementById('backClickDetect').removeEventListener("mousedown", func)
            }
            document.getElementById('backClickDetect').addEventListener("mousedown", func)
          }}>
          <FontAwesomeIcon icon={faEllipsis}/>
        </button>
        <div className={clicked ? styles.budMenu : styles.none}>
          <button className={styles.deleteBtn}
            onClick={e => {
              // utils.getKonvaObjById(budId).destroy()
              // utils.updateObj(budId, {del: true}) // pls make thing ignore bud that has del attr
              setSelectedObj()
            }}>delete bud</button>
          <button className={styles.deleteBtn}
            onClick={e => {
              const obj = utils.getObjById(budId)
              const newDef = obj.definitions.splice(definitionNo, 1)[0]
              newDef.del = true
              // utils.updateObj(budId, {
              //   definitions: [
              //     ...obj.definitions,
              //     newDef
              //   ]
              // })
              // setTriggerRerender(!triggerRerender)
              setDefinitionNo(getOtherDef(utils.getObjById(budId)))
            }}>delete definition</button>
          <button
            className={styles.newDefinition}
            onClick={e => {
              newDefinition(budId)
              setDefinitionNo(getOtherDef(utils.getObjById(budId)))
            }}>New definition</button>
        </div>
      </div>
    </>
  )
}

function BudView({ selectedObj, setSelectedObj }) {
  const [ canRender, setCanRender ] = useState(false)
  const [ definitionNo, setDefinitionNo ] = useState(0)
  const [ totalDefinitionNo, setTotalDefinitionNo ] = useState()
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
    if (!selectedObj) setRenderData(originalRenderData); setCanRender(false)
    const obj = utils.getObjById(selectedObj)
    if (obj && obj.type === 'bud') {
      setTotalDefinitionNo(getOtherDef(utils.getObjById(selectedObj)))
      setCanRender(true)
      console.log(obj.definitions, definitionNo)
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
        if (!example.del) {
          return (
            <>
              <textarea
                placeholder='insert example'
                key={example.arrID}
                name={`example${index}`}
                value={example.text}
                onChange={handleInputChangeWrapper('example')}
                className={styles.example}></textarea>
              <button className={styles.deleteBtn}
                onClick={e => {
                  const obj = utils.getObjById(selectedObj)
                  const definition = obj.definitions[definitionNo]
                  example.del = true
                  // utils.updateObj(budId, {
                  //   definitions: [{
                  //     ...definition,
                  //     examples: [...definition.examples]
                  //   }]
                  // })
                  setTriggerRerender(!triggerRerender)
                }}>delete example</button>
            </>
          )
        } else {
          return <></>
        }
      })
      setRenderedExamples(examplesRender)
    }
  }, [ selectedObj, definitionNo, triggerRerender ])
  const subDefinitionNo = () => {
    console.log('sub')
    console.log(definitionNo)
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
    <>
      <div className={canRender ? styles.BudView : styles.none} id='BudView'>
        <BudAttr
          id='word'
          data={renderData.word}
          onChange={handleInputChangeWrapper('word')}
          placeholder='insert word'></BudAttr>
        <div className={styles.divWord}>
          <button onClick={subDefinitionNo}>a</button>
          <BudAttr
            id='definition'
            data={renderData.definition}
            onChange={handleInputChangeWrapper('definition')}
            placeholder='definition'
            style={styles.definition}></BudAttr>
          <MoreBtn
            budId={selectedObj}
            setDefinitionNo={setDefinitionNo}
            definitionNo={definitionNo}
            setTriggerRerender={setTriggerRerender}
            triggerRerender={triggerRerender}
            setSelectedObj={setSelectedObj}></MoreBtn>
          {/* <button onClick={e => newDefinition(selectedObj)}>newDefinition</button> */}
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
    </>
  )
}
export { BudView }