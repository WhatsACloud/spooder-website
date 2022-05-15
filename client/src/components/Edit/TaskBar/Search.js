import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import api from '../../../services/api'

function SearchBar({ setSelectedObj }) {
  const [ searchVal, setSearchVal ] = useState('')
  const [ focused, setFocused ] = useState(false)
  const [ searchResults, setSearchResults ] = useState()
  const [ renderedSearchResults, setRenderedSearchResults ] = useState()
  useEffect(, [ searchVal ])
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