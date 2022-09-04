import React, { useEffect, useState } from 'react'
import * as utils from '../utils'
import styles from './taskBar.module'

function Debugger() {
  const [ debugItems, setDebugItems ] = useState()
  const [ plsUpdate, setPlsUpdate ] = useState()
  useEffect(() => {
    const objs = utils.getObjs()
    if (objs) {
      const toSend = Object.keys(objs).map(objId => {
        const obj = objs[objId]
        if (obj.type === "bud") {
          return (
            <>
              <p>{`objId ${objId}`}</p>
              <p>{`word ${obj.word}`}</p>
              <p>{`link ${obj.definitions[0].link}`}</p>
              <br></br>
            </>
          )
        } else {
          return (
            <>
              <p>{`objId ${objId}`}</p>
              <p>{`strength ${obj.strength}`}</p>
              <p>{`attachedTo1 ${obj.attachedTo1}`}</p>
              <p>{`attachedTo2 ${obj.attachedTo2}`}</p>
              <p>{`tst ${obj.tst}`}</p>
              <br></br>
            </>
          )
        }
      })
      setDebugItems(toSend)
    }
  }, [ plsUpdate ])
  return (
    <>
      <button
        onClick={e => setPlsUpdate(!plsUpdate)}>debug</button>
      <div className={styles.debug}>
        {debugItems}
      </div>
    </>
  ) 
}
export { Debugger }