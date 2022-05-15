import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import api from '../../../services/api'

function SearchBar({ setSelectedObj }) {
  const [ searchVal, setSearchVal ] = useState('')
  const [ focused, setFocused ] = useState(false)
  const [ searchResults, setSearchResults ] = useState()
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
  }, [ searchVal ])
  return (
    <div id='divSearchBar' className={styles.divSearchBar}>
      <input
        className={focused ? styles.focused : styles.unfocused}
        onFocus={e => setFocused(true)}
        onBlur={e => {
          setTimeout(() => {
            setFocused(false)
          }, 200)
        }}
        value={searchVal}
        type='text'
        onChange={(evt) => setSearchVal(evt.target.value)}
        placeholder='Search'></input>
      <div
        id='searchResults'
        className={focused ? styles.searchResults : styles.none}>
          {renderedSearchResults}
        </div>
    </div>
  )
}
export { SearchBar }