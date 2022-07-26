import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import * as utils from '../utils'

import { BackgroundClickDetector } from '../../BackgroundClickDetector'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faFilter } from '@fortawesome/free-solid-svg-icons'

import { ToolDropdown } from './ToolDropdown'

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
    console.log(name)
  }, [])
  return (
    <div style={{ backgroundColor: toggled ? 'grey' : 'white' }} className={styles.filterOption} onClick={onClick}>
      {name}
    </div>
  )
}

function Filter({ filters, setFilters, on }) {
  const filterData = Object.entries(filters).map(e => ({
    name: e[0],
    onClick: () => {
      const newFilters = { ...filters, [e[0]]: !(filters[e[0]]) }
      setFilters(newFilters)
    },
    toggle: true,
  }))
  const [ showFilter, setShowFilter ] = useState(false)
  return (
    <div className={on ? styles.filterOn : styles.filterOff}>
      <BackgroundClickDetector on={showFilter} zIndex={7} mousedown={() => setShowFilter(false)}></BackgroundClickDetector>
      <div className={styles.divFilterBtn} onClick={() => setShowFilter(true)}>
        <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
        <p>filter</p>
      </div>
      {/* <div className={showFilter ? styles.divFilter : styles.none}> */}
        <ToolDropdown on={showFilter} setOn={setShowFilter} leData={filterData}>
          {/* Object.keys(filters).map(e => {
            return <FilterOption
              key={e}
              name={e}
              toggled={!(filters[e])}
              onClick={() => {
                const newFilters = {...filters, [e]: !(filters[e])}
                setFilters(newFilters)
              }}
              ></FilterOption>
          }) */}
        </ToolDropdown>
      {/* </div> */}
    </div>
  )
}

function SearchBar() {
  const [ searchVal, setSearchVal ] = useState('')
  const [ renderedSearchResults, setRenderedSearchResults ] = useState()
  const [ filters, setFilters ] = useState({...utils.filterOptions})
  const [ focused, setFocused ] = useState(false)
  const [ hover, setHover ] = useState(false)
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
    <div>
      <div
        id='divSearchBar'
        className={styles.divSearchBar}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        >
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className={focused ? styles.focused : styles.unfocused}
          onClick={() => {
            setFocused(true)
            document.getElementById('searchInput').focus()
          }}
          ></FontAwesomeIcon>
        <input
          id='searchInput'
          // style={{filter: `brightness(${hover ? 0.8 : 1})`}}
          className={focused ? styles.focused : styles.unfocused}
          value={searchVal}
          type='text'
          onChange={(evt) => setSearchVal(evt.target.value)}
          placeholder={focused ? 'Search' : ''}></input>
        <div
          id='searchResults'
          className={focused && renderedSearchResults.length > 0 ? styles.searchResults : styles.none}>
            {renderedSearchResults}
          </div>
        <Filter filters={filters} setFilters={setFilters} on={focused}></Filter>
      </div>
      <BackgroundClickDetector on={focused} mousedown={() => setFocused(false)} zIndex={8}></BackgroundClickDetector>
    </div>
  )
}
export { SearchBar }