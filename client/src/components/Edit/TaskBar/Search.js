import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import * as utils from '../utils'

import { BackgroundClickDetector } from '../../BackgroundClickDetector'

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

function FilterOption({ name, toggled, onClick }) {
  useEffect(() => {
  }, [])
  return (
    <div style={{ color: toggled ? 'grey' : 'white' }} className={styles.filterOption} onClick={onClick}>
      {name}
    </div>
  )
}

function Filter({ filters, setFilters }) {
  const [ showFilter, setShowFilter ] = useState(false)
  useEffect(() => {
    console.log(filters)
  }, [])
  return (
    <>
      <BackgroundClickDetector on={showFilter} zIndex={9} mousedown={() => setShowFilter(false)}></BackgroundClickDetector>
      <div className={styles.divFilterBtn} onClick={() => setShowFilter(true)}>
        filter
      </div>
      <div className={showFilter ? styles.divFilter : styles.none}>
        {
          Object.keys(filters).map(e => {
            return <FilterOption
              key={e}
              name={e}
              toggled={!(filters[e])}
              onClick={() => {
                const newFilters = {...filters, [e]: !(filters[e])}
                setFilters(newFilters)
              }}
              ></FilterOption>
          })
        }
      </div>
    </>
  )
}

function SearchBar() {
  const [ searchVal, setSearchVal ] = useState('')
  const [ renderedSearchResults, setRenderedSearchResults ] = useState()
  const [ filters, setFilters ] = useState({...utils.filterOptions})
  const [ focused, setFocused ] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log(searchVal)
      const found = utils.searchFor(searchVal, filters)
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
          className={focused && renderedSearchResults ? styles.searchResults : styles.none}>
            {renderedSearchResults}
          </div>
      </div>
      <Filter filters={filters} setFilters={setFilters}></Filter>
    </>
  )
}
export { SearchBar }