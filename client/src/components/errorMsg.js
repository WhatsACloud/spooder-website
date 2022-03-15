import React from "react"
import styles from "../scss/errorMsg.module"

function ErrorBox(props) {
  return (
    <div className={styles.errorBox}>
      {props.children}
    </div>
  )
}

export {
  ErrorBox
}