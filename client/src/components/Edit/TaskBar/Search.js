import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'

function SearchResult({ onMouseDown, text }) {
  return (
    <>
      <button
        className={styles.searchFind}
        onMouseDown={onMouseDown}>
        <p className={styles.searchFindName}>{text.name || ''}</p>
        <p className={styles.searchFindType}>{text.type || ''}</p>
        <p className={styles.searchFindString}>{text.string || ''}</p>
      </button>
    </>
  )
}
export { SearchResult }

function SearchBar({ setSearchVal, searchVal, children }) {
  const [ focused, setFocused ] = useState(false)
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
        className={focused && children ? styles.searchResults : styles.none}>
          {children}
        </div>
    </div>
  )
}
export { SearchBar }