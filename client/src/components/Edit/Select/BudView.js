import React, { useEffect } from 'react'
import styles from '../edit.module'

function BudAttr({ id, placeholder, style }) {
  return (
    <div
      className={styles.attrBox}
      id={id}>
      <input
        className={style || styles.normal}
        placeholder={placeholder}>
      </input>
    </div>
  ) 
}

function BudView({ selectedObj }) {
  return (
    <div className={selectedObj ? styles.BudView : styles.none} id='BudView'>
      <BudAttr
        id='word'
        placeholder='insert word'></BudAttr>
      <BudAttr
        id='definition'
        placeholder='definition'
        style={styles.definition}></BudAttr>
      <div>
        <BudAttr
          id='sound'
          placeholder='sound'
          style={styles.sound}></BudAttr>
        <BudAttr
          id='context'
          placeholder='context'
          style={styles.context}></BudAttr>
      </div>
    </div>
  )
}
export { BudView }