function getCanvasMousePos(x, y) {
  return {x: x - window.innerWidth * 0.15 + divCanvas.scrollLeft, y: y - 40 + divCanvas.scrollTop}
}

function withinRect(mousePos, startX, startY, endX, endY) {
  const x = mousePos.x
  const y = mousePos.y
  const xStartIn = x > startX
  const yStartIn = y > startY
  const xEndIn = x < endX
  const yEndIn = y < endY
  if (xStartIn && yStartIn && xEndIn && yEndIn) {
    return true
  }
  return false
}

function isInCanvas(mousePos) {
  const startX = window.innerWidth * 0.15
  const startY = 0
  const endX = window.innerWidth
  const endY = window.innerHeight
  return withinRect(mousePos, startX, startY, endX, endY)
}

function getHexagonLines(points) {
  const lines = []
  let lastPoint = points[0]
  for (let i = 1; i < 7; i++) {
    let newPoint = points[i]
    if (newPoint === undefined) {
      newPoint = points[0]
    }
    lines.push([
      lastPoint,
      newPoint
    ])
    lastPoint = newPoint
  }
  return lines
}

const a = 2 * Math.PI / 6

function hexagonPoints(r, x, y) {
  const points = []
  for (var i = 0; i < 6; i++) {
    points.push({x: x + r * Math.cos(a * i), y: y + r * Math.sin(a * i)})
  }
  return points
}

function drawHexagon(ctx, points) {
  ctx.beginPath()
  for (var i = 0; i < 6; i++) {
    const x = points[i].x
    const y = points[i].y
    ctx.lineTo(x, y)
  }
  ctx.closePath()
}

const snapToPreview = (evt) => {
  const radius = 40
  const mousePos = getCanvasMousePos(evt.evt.pageX, evt.evt.pageY)
  const hitLinePoints = evt.target.getAttr('borderPoints')
  const rise = hitLinePoints[1].y - hitLinePoints[0].y
  const run = hitLinePoints[1].x - hitLinePoints[0].x
  const gradient = rise / run
  const highlighter = evt.target.parent.parent.parent.parent.find('.highlighter')[0]
  const bud = evt.target.parent.parent.children[0]
  const hitIndex = evt.target.index+1
  let x
  let y
  if (hitIndex === 2 || hitIndex === 5) {
    x = mousePos.x
    y = evt.target.getAttr('borderPoints')[0].y
  } else if (hitIndex === 3) {
    x = (
      Math.abs(evt.target.getY() - mousePos.y)
      / gradient
      + hitLinePoints[1].x
    )
    y = mousePos.y
  } else if (hitIndex === 6) { // yandere dev moment
    x = (
      - (
        Math.abs(evt.target.getY() - mousePos.y)
        / gradient
      )
      + hitLinePoints[1].x
    )
    y = mousePos.y
  } else if (hitIndex === 1) {
    x = (
      Math.abs(evt.target.getY() - mousePos.y)
      / gradient
      + hitLinePoints[1].x
      + radius / 2
    )
    y = mousePos.y
  } else if (hitIndex === 4) {
    x = (
      - (
        Math.abs(evt.target.getY() - mousePos.y)
        / gradient
      )
      + hitLinePoints[1].x
      - radius / 2
    )
    y = mousePos.y
  }
  
  if (x === undefined) {
    console.log('a')
  }
  let xStartingPointIndex = 0
  let yStartingPointIndex = 1
  if (hitIndex > 3) {
    xStartingPointIndex = 1
    yStartingPointIndex = 0
  }
  if (hitIndex === 3) {
    xStartingPointIndex = 0
    yStartingPointIndex = 0
  } else if (hitIndex === 6) {
    xStartingPointIndex = 1
    yStartingPointIndex = 1
  }
  if (x > hitLinePoints[xStartingPointIndex].x) {
    x = hitLinePoints[xStartingPointIndex].x
  } else if (x < hitLinePoints[Math.abs(xStartingPointIndex-1)].x) { // gets opposite point
    x = hitLinePoints[Math.abs(xStartingPointIndex-1)].x
  }
  if (y > hitLinePoints[yStartingPointIndex].y) {
    y = hitLinePoints[yStartingPointIndex].y
  } else if (y < hitLinePoints[Math.abs(yStartingPointIndex-1)].y) {
    y = hitLinePoints[Math.abs(yStartingPointIndex-1)].y
  }
  highlighter.setX(x)
  highlighter.setY(y)
}

module.exports = {
  getCanvasMousePos: getCanvasMousePos,
  isInCanvas: isInCanvas,
  getHexagonLines: getHexagonLines,
  hexagonPoints: hexagonPoints,
  drawHexagon: drawHexagon,
  snapToPreview: snapToPreview
}