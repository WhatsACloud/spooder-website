import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'

function BudSearchResult({ obj, str }) {
  return (
    <>
      <p className={styles.searchFindName}>{obj.json.name || ''}</p>
      <p className={styles.searchFindType}>{obj.json.type || ''}</p>
      <p className={styles.searchFindString}>{str || ''}</p>
    </>
  )
}

function CategSearchResult({ obj, str }) {
  return (
    <>
      <p className={styles.searchFindName}>{obj.name || ''}</p>
      <p className={styles.searchFindType}>{obj.color || ''}</p>
      <p className={styles.searchFindString}>{str || ''}</p>
    </>
  )
}

function SearchResult({ onMouseDown, result }) {
  const [ rendered, setRendered ] = useState()
  useEffect(() => {
    console.log(result.obj)
    switch (result.obj.type) {
      case "bud":
        setRendered(
          <BudSearchResult obj={result.obj} str={result.string}></BudSearchResult>
        )
        break
      case "category":
        setRendered(
          <CategSearchResult obj={result.obj} str={result.string}></CategSearchResult>
        )
        break
    }
  }, [])
  return (
    <>
      <button
        className={styles.searchFind}
        onMouseDown={onMouseDown}>
        {rendered}
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