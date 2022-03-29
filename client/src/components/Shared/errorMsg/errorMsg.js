import React from "react"
import styles from "./errorMsg.module"

function ErrorBox({ children }) {
  return (
    <div className={children ? styles.errorMsg : styles.noMsg}>
      <p>
        {children}
      </p>
    </div>
  )
}

export {
  ErrorBox
}