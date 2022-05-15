import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faFileLines } from '@fortawesome/free-solid-svg-icons'

import { SearchBar } from './Search'

const searchBarFunc = () => {
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
      setSearchResults(found)
      const toRender = Object.keys(found).map((objId, index) => 
        <>
          <button
            key={index}
            className={styles.searchFind}
            onMouseDown={e => {
              setSelectedObj(objId)
            }}>
            <p className={styles.searchFindName}>{found[objId].word}</p>
            <p className={styles.searchFindType}>{found[objId].found[0]}</p>
            <p className={styles.searchFindString}>{found[objId].found[1]}</p>
          </button>
        </>
      )
      setRenderedSearchResults(toRender)
    }, 300)
    return () => {
      clearTimeout(timeout)
    }
  }

function TaskBar({ setInSettings, setModes, modes, setSelectedObj }) {
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
        setSelectedObj={setSelectedObj}></SearchBar>
    </div>
  )
}
export default TaskBar