import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'

function SearchBar() {
  const [ searchVal, setSearchVal ] = useState('')
  const [ focused, setFocused ] = useState(false)
  const [ searchResults, setSearchResults ] = useState()
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log(searchVal)
    }, 800)
    return () => {
      clearTimeout(timeout)
    }
  }, [ searchVal ])
  return (
    <div id='divSearchBar' className={styles.divSearchBar}>
      <input
        className={focused ? styles.focused : styles.unfocused}
        onFocus={e => {
          setFocused(true)
          // document.getElementById()
        }}
        value={searchVal}
        type='text'
        onChange={(evt) => setSearchVal(evt.target.value)}
        placeholder='Search'></input>
      <div
        id='searchResults'
        className={focused ? styles.searchResults : styles.none}>
          {searchResults}
        </div>
    </div>
  )
}
export { SearchBar }