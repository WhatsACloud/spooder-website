import React, { useEffect, useState } from 'react'
import { search } from 'fast-fuzzy'

import { SearchBar, SearchResult } from '../Edit/TaskBar/Search'

function SpoodawebSearchBar({ originalSpoodawebPreviews, setSpoodawebPreviews }) {
  const [ searchVal, setSearchVal ] = useState('')
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchVal === '') {
        setSpoodawebPreviews(originalSpoodawebPreviews)
        return
      }
      const found = search(
        searchVal,
        originalSpoodawebPreviews,
        {keySelector: (obj) => obj.title}
      )
      setSpoodawebPreviews(found)
    }, 300)
    return () => {
      clearTimeout(timeout) 
    }
  }, [ searchVal, originalSpoodawebPreviews ])
  return (
    <SearchBar
      setSearchVal={setSearchVal}
      searchVal={searchVal}>
      {null}
    </SearchBar>
  )
}
export { SpoodawebSearchBar }