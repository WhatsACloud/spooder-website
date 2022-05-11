import React, { useEffect } from 'react'
import * as BudUtils from './BudUtils'
import * as utils from '../utils'

function UpdateBudBorderEvt({ draggingLine, hoverBudBorder, setHoverBudBorder }) {
  useEffect(() => {
    const stage = utils.getStage() 
    if (!stage) return
    const buds = stage.find('.bud')
    if (draggingLine) {
      for (const budIndex in buds) { // to change this cause performance issues
        const bud = buds[budIndex]
        const hitGroup = bud.children[1]
        const hitAreas = hitGroup.children
        for (const hitAreaIndex in hitAreas) {
          const hitArea = hitAreas[hitAreaIndex]
          hitArea.on('mousemove', BudUtils.snapToPreview)
        }
        hitGroup.on('mouseover', (evt) => {
          const stage = utils.getStage()
          const highlighter = stage.find('.highlighter')[0]
          highlighter.show()
          highlighter.setAttr('attachedObjId', evt.target.parent.parent.getAttr('objId'))
          setHoverBudBorder(true)
        })
        hitGroup.on('mouseout', (evt) => {
          const stage = utils.getStage()
          const highlighter = stage.find('.highlighter')[0]
          highlighter.hide()
          highlighter.setAttr('attachedObjId', null)
          setHoverBudBorder(false)
        })
      }
    } else {
      setHoverBudBorder(false)
      for (const budIndex in buds) {
        const bud = buds[budIndex]
        const hitGroup = bud.children[1]
        const hitAreas = hitGroup.children
        hitGroup.off('mouseup')
        for (const hitAreaIndex in hitAreas) {
          const hitArea = hitAreas[hitAreaIndex]
          hitArea.off('mousemove')
        }
        hitGroup.off('mouseover')
        hitGroup.off('mouseout')
        const stage = utils.getStage()
        const highlighter = stage.find('.highlighter')[0]
        highlighter.hide()
      }
    }

  }, [ draggingLine ])
  return <></>
}
export { UpdateBudBorderEvt }