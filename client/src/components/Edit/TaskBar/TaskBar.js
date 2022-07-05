import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import api from '../../../services/api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faFileLines } from '@fortawesome/free-solid-svg-icons'

import { SearchBar, SearchResult } from './Search'
import { UndoRedo } from './UndoRedo'
import { Categories } from './categories'

import { Debugger } from './debug'
import * as utils from '../utils'

function TaskBar({ setInSettings }) {
  const [ searchVal, setSearchVal ] = useState('')
  const [ renderedSearchResults, setRenderedSearchResults ] = useState()
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log(searchVal)
      const found = utils.searchFor(searchVal)
      const toRender = found.map((result, index) =>
        <>
          <SearchResult
            key={index}
            onMouseDown={e => {
               setSelectedObj(objId)
            }}
            result={result}></SearchResult>
        </>
      )
      setRenderedSearchResults(toRender)
    }, 300)
    return () => {
      clearTimeout(timeout)
    }
  }, [ searchVal ])
  return (
    <>
      <div className={styles.taskBar}>
        <button
          className={styles.settingsBtn}
          onClick={() => setInSettings(true)}>
          <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>
        </button>
        <button
          className={styles.autoDragBtn}
          onClick={() => {
            const modes = utils.getGlobals().modes
            modes.autoDrag = !(modes.autoDrag)
          }}>
          <FontAwesomeIcon icon={faFileLines}></FontAwesomeIcon>
        </button>
        <button
          className={styles.autoDragBtn}
          onClick={() => {
            const modes = utils.getGlobals().modes
            modes.gluing = !(modes.gluing)
          }}>
          glue
        </button>
        <SearchBar
          searchVal={searchVal}
          setSearchVal={setSearchVal}>
          {renderedSearchResults}
        </SearchBar>
        <Categories></Categories>
        {/* <Debugger></Debugger> */}
        <UndoRedo></UndoRedo>
      </div>
    </>
  )
}
export default TaskBar