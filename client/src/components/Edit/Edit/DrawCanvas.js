import Konva from 'konva'
import React, { useEffect } from 'react'

import * as BudShapes from '../Bud'

import * as utils from '../utils'

function DrawCanvas({ rendered }) {
  useEffect(() => {
    const stage = new Konva.Stage({
      container: document.getElementById('divCanvas'),
      x: 0,
      y: 0,
      width: window.screen.width * 0.85,
      height: window.screen.height * 0.95
    })
    const layer = new Konva.Layer()
    stage.add(layer)
  }, [])
  return (
    <>
      {/* <ReactKonva.Stage
        x={0}
        y={0}
        width={window.screen.width * 0.85}
        height={window.screen.height * 0.95}>
        <ReactKonva.Layer>
          {rendered}
          <BudShapes.BudAnchorHighlighter></BudShapes.BudAnchorHighlighter>
        </ReactKonva.Layer>
      </ReactKonva.Stage> */}
    </>
  )
}
export { DrawCanvas }