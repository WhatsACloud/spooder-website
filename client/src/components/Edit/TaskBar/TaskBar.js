import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import api from '../../../services/api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faFileLines } from '@fortawesome/free-solid-svg-icons'

import { SearchBar, SearchResult } from './Search'
import { Train } from './Train'
import { UndoRedo } from './UndoRedo'
import { Debugger } from './debug'
import * as utils from '../utils'

function TaskBar({ setInSettings, setSelectedObj, selectedObj, setFocus }) {
  const [ searchVal, setSearchVal ] = useState('')
  const [ renderedSearchResults, setRenderedSearchResults ] = useState()
  useEffect(() => {
    const timeout = setTimeout(async () => {
      console.log(searchVal)
      const urlString = window.location.search
      let paramString = urlString.split('?')[1];
      let queryString = new URLSearchParams(paramString);
      const result = await api.post('/search', {
        spoodawebId: queryString.get('id'),
        queryType: "text",
        queryString: searchVal
      })
      const found = result.data.buds
      const toRender = Object.keys(found).map((objId, index) => 
        <>
          <SearchResult
            key={index}
            onMouseDown={e => {
               setSelectedObj(objId)
            }}
            text={{
              name: found[objId].word,
              type: found[objId].found[0],
              string: found[objId].found[1]
            }}></SearchResult>
        </>
      )
      setRenderedSearchResults(toRender)
    }, 300)
    return () => {
      clearTimeout(timeout)
    }
  }, [ searchVal ])
  return (
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
          modes.glue = !(modes.glue)
        }}>
        glue
      </button>
      <SearchBar
        searchVal={searchVal}
        setSearchVal={setSearchVal}>
        {renderedSearchResults}
      </SearchBar>
      {/* <Debugger></Debugger> */}
      <UndoRedo></UndoRedo>
      <Train
        selectedObj={selectedObj}
        setSelectedObj={setSelectedObj}
        setFocus={setFocus}></Train>
    </div>
  )
}
export default TaskBar