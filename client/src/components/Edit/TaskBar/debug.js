import React, { useEffect, useState } from 'react'
import * as utils from '../utils'

const watch = [
  1,

]

function Debugger() {
  const [ debugItems, setDebugItems ] = useState()
  const [ plsUpdate, setPlsUpdate ] = useState()
  useEffect(() => {
    const objs = utils.getObjs()
  }, [ plsUpdate ])
  return (
    <>
      <button
        onClick={setPlsUpdate(!plsUpdate)}>debug</button>
      <div>
      </div>
    </>
  ) 
}
export { Debugger }