import * as utils from "../utils"

const select = (evt, setSelectedObj) => {
  evt.cancelBubble = true
  const konvaObj = evt.target.parent
  const objId = konvaObj.getAttr('objId')
  setSelectedObj(objId)
}
export { select }