import React, { useEffect, useState } from 'react'
import styles from './taskBar.module'
import * as utils from '../utils'

import { BackgroundClickDetector } from '../../BackgroundClickDetector'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faFilter, faSquare } from '@fortawesome/free-solid-svg-icons'

import { ToolDropdown } from './ToolDropdown'

import { Hexagon } from '../../../services/icons'

import uuid from 'react-uuid'

function BudSearchResult({ obj, str, type }) {
  return (
    <>
      <div className={styles.budIcon}>
        <Hexagon style={{fill: utils.getGlobals().categories.getById(obj.json.categId).color}} className={styles.svg}></Hexagon>
        <p>{obj.json.word || ''}</p>
      </div>
      <div className={styles.wrap}>
        <p className={type ? styles.searchFindType : styles.searchFindTypeOff}>{type || ''}</p>
        <p className={styles.searchFindString}>{str || ''}</p>
      </div>
    </>
  )
}

function CategSearchResult({ obj, str, type }) {
  console.log(obj)
  return (
    <>
      <div className={styles.categIcon}>
        <div style={{backgroundColor: obj.color}} className={styles.roundSquare}></div>
        <p>{obj.name || ''}</p>
      </div>
      <div className={styles.wrap}>
        <p className={styles.searchFindType}>{type || ''}</p>
        <p className={styles.searchFindString}>{str || ''}</p>
      </div>
    </>
  )
}

function SearchResult({ onMouseDown, result }) {
  const [ rendered, setRendered ] = useState()
  useEffect(() => {
    console.log(result)
    switch (result.obj.type) {
      case "bud":
        setRendered(
          <BudSearchResult obj={result.obj} str={result.string} type={result.key}></BudSearchResult>
        )
        break
      case "category":
        setRendered(
          <CategSearchResult obj={result.obj} str={result.string} type={result.key}></CategSearchResult>
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

function SetSlashKeybind({ setFocused, setSearchVal }) {
  useEffect(() => {
    document.addEventListener('keydown', e => {
      if (e.key === '/') {
        if (!(document.getElementById('searchInput') === document.activeElement)) {
          setFocused(true)
          document.getElementById('searchInput').focus()
          if (document.getElementById('searchInput').value === '') {
            setTimeout(() => {
              setSearchVal('')
              document.getElementById('searchInput').value = ''
            }, 100)
          } else {
            setTimeout(() => {
              const newVal = document.getElementById('searchInput').value.slice(0, -1)
              setSearchVal(newVal)
              document.getElementById('searchInput').value = newVal
            }, 100)
          }
        }
      }
      else if (e.key === 'Escape') {
        setFocused(false)
        document.getElementById('searchInput').blur()
      }
    })
  }, [])
  return <></>
}

function SearchBar() {
  const [ searchVal, setSearchVal ] = useState('')
  const [ renderedSearchResults, setRenderedSearchResults ] = useState()
  const [ filters, setFilters ] = useState({...utils.filterOptions})
  const [ focused, setFocused ] = useState(false)
  const [ hover, setHover ] = useState(false)
  useEffect(() => {
    const found = utils.searchFor(searchVal, filters)
    if (!found) return
    const toRender = found.map((result) =>
      <>
        <SearchResult
          key={uuid()}
          onMouseDown={e => {
              setSelectedObj(objId)
          }}
          result={result}></SearchResult>
      </>
    )
    setRenderedSearchResults(toRender)
  }, [ searchVal, focused ])
  return (
    <div>
      <SetSlashKeybind setFocused={setFocused} setSearchVal={setSearchVal}></SetSlashKeybind>
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
          className={focused ? styles.searchResults : styles.searchResultsNone}>
            {renderedSearchResults}
          </div>
        <Filter filters={filters} setFilters={setFilters} on={focused}></Filter>
      </div>
      <BackgroundClickDetector on={focused} mousedown={() => setFocused(false)} zIndex={8}></BackgroundClickDetector>
    </div>
  )
}
export { SearchBar }