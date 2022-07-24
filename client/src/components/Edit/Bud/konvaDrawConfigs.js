import * as BudUtils from './BudUtils'

const budGroupConfig = (x, y, objId) => {
  return {
    x: x,
    y: y,
    objId: objId,
    draggable: true,
  }
}
export { budGroupConfig }

const radius = 40

const budShapeConfig = () => {
  return {
    strokeWidth: 0,
    radius: radius,
    sceneFunc: (ctx, shape) => {
      const points = BudUtils.hexagonPoints(shape.getAttr('radius'), 0, 0) // why is this not the same as points variable above???
      BudUtils.drawHexagon(ctx, points)
      ctx.fillStrokeShape(shape)
    },
    // fill: 'blue',
    // shadowColor: 'blue',
    shadowBlur: 10,
    // shadowOffset: { x: 10, y: 10 },
    shadowOpacity: 0.8,
    id: 'budShape',
  }
}
export { budShapeConfig }