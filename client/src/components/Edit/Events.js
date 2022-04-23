const createBud = (e, buds, setBuds, Bud) => { // e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft, e.pageY - 40 + divCanvas.scrollTop
  console.log(buds)
  if (buds) {
    const budsCopy = [...buds]
    console.log('hey')
    budsCopy.push(
      <Bud
        key={buds.length}
        x={e.pageX - window.innerWidth * 0.15 + divCanvas.scrollLeft}
        y={e.pageY - 40 + divCanvas.scrollTop}></Bud>
    )
    setBuds(budsCopy)
  }
}

module.exports = {
  mouseDown: (e, setMiddleMouseDown) => {
    if (e.button === 1) {
      setMiddleMouseDown(true)
    }
  },
  mouseUp: (e, setMiddleMouseDown) => {
    if (e.button === 1) {
      setMiddleMouseDown(false)
    }
  },
  mouseMove: (e, middleMouseDown, mousePos, setMousePos) => {
    const divCanvas = document.getElementById('divCanvas')
    const x = e.pageX
    const y = e.pageY
    if ((!middleMouseDown) || (!mousePos.y || !mousePos.x)) {
      setMousePos({
        x: x,
        y: y
      })
      return
    }
    const xDiff = mousePos.x - x
    const yDiff = mousePos.y - y
    const multi = 8
    // divCanvas.scrollBy(-xDiff*multi, -yDiff*multi)
    divCanvas.scrollLeft += -xDiff*multi
    divCanvas.scrollTop += -yDiff*multi
    setMousePos({
      x: x,
      y: y
    })
  }
}