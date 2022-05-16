import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import api from '../../../services/api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faFileLines } from '@fortawesome/free-solid-svg-icons'

import { SearchBar, SearchResult } from './Search'

function TaskBar({ setInSettings, setModes, modes, setSelectedObj }) {
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
          const newModes = {...modes}
          newModes.autoDrag = !(modes.autoDrag)
          setModes(newModes)
        }}>
        <FontAwesomeIcon icon={faFileLines}></FontAwesomeIcon>
      </button>
      <SearchBar
        searchVal={searchVal}
        setSearchVal={setSearchVal}>
        {renderedSearchResults}
      </SearchBar>
    </div>
  )
}
export default TaskBar