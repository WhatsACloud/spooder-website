import React, { useEffect } from 'react'
import * as ReactKonva from 'react-konva'

import * as BudShapes from '../Bud'

import * as utils from '../utils'

const scrollRight = (amt) => {
  const rootPos = utils.getRootPos()
  utils.setRootPos({x: rootPos.x - amt, y: rootPos.y})
}

const scrollDown = (amt) => {
  const rootPos = utils.getRootPos()
  utils.setRootPos({x: rootPos.x, y: rootPos.y - amt})
}

function DrawCanvas({ rendered }) {
  useEffect(() => {
    utils.setRootPos({x: 0, y: 0})
    const scrollAmt = 20
    document.addEventListener('keydown', (e) => {
      const key = e.key
      switch (key) {
        case 'ArrowUp':
          scrollDown(-scrollAmt)
          break
        case 'ArrowDown':
          scrollDown(scrollAmt)
          break
        case 'ArrowLeft':
          scrollRight(-scrollAmt)
          break
        case 'ArrowRight':
          scrollRight(scrollAmt)
          break
      }
    })
  }, [])
  return (
    <>
      <ReactKonva.Stage
        x={0}
        y={0}
        width={window.screen.width * 0.85}
        height={window.screen.height * 0.95}>
        <ReactKonva.Layer>
          {rendered}
          <BudShapes.BudAnchorHighlighter></BudShapes.BudAnchorHighlighter>
        </ReactKonva.Layer>
      </ReactKonva.Stage>
    </>
  )
}
export { DrawCanvas }