import React, { useEffect, useState } from 'react'
import styles from './edit.module'
// import { Canvg } from 'canvg'

const gridLink = "http://phrogz.net/tmp/grid.gif"

const spoodawebData = {
  "a test": {
    "pronounciation": "pronounciation test",
    "contexts": [
        "this is a context for testing",
        "this is the second context"
    ],
    "examples": [
        [
            "does this link up with the context???",
            "does this too?"
        ],
        [
            "this should go to the second context"
        ]
    ],
    "links": {
        "1": 0.1,
        "2": 1,
        "3": 0.65
    },
    "position": {
      "x": 100,
      "y": 50
    }
  },
  "gay": {
    "pronounciation": "pronounciation test",
    "contexts": [
        "this is a context for testing",
        "this is the second context"
    ],
    "examples": [
        [
            "does this link up with the context???",
            "does this too?"
        ],
        [
            "this should go to the second context"
        ]
    ],
    "links": {
        "1": 0.1,
        "2": 1,
        "3": 0.65
    },
    "position": {
      "x": 200,
      "y": 120
    }
  }
}

const a = 2 * Math.PI / 6
const r = 50
const hexagonColor = "rgb(79, 47, 255)"

function drawHexagon(x, y, ctx) {
  ctx.fillStyle = hexagonColor
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i))
  }
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
}

const preventZoomKeys = {
  "=": true,
  "+": true,
  "-": true,
  "_": true
}

const preventZoom = e => {
  if (e.ctrlKey === true && (preventZoomKeys[e.key])) {
    console.log('success')
    e.preventDefault()
  }
}

const preventZoomScroll = e => {
  console.log(e)
  if (e.ctrlKey) {
    e.preventDefault()
  }
}

const mouseDown = (e, setMiddleMouseDown) => {
  if (e.button === 1) {
    const divCanvas = document.getElementById('divCanvas')
    setMiddleMouseDown(true)
  }
}

const mouseUp = (e, setMiddleMouseDown) => {
  if (e.button === 1) {
    const divCanvas = document.getElementById('divCanvas')
    setMiddleMouseDown(false)
  }
}

const mouseMove = (e, middleMouseDown, mousePos, setMousePos) => {
  if (!middleMouseDown) {
    setMousePos({
      x: x,
      y: y
    })
    return
  }
  const x = e.pageX
  const y = e.pageY
  if (!mousePos.y) {
    setMousePos({
      x: x,
      y: y
    })
    return
  }
  const xDiff = mousePos.x - x
  const yDiff = mousePos.y - y
  divCanvas.scrollBy(-xDiff*8, -yDiff*8)
  setMousePos({
    x: x,
    y: y
  })
} // todo: add ability to detect overlay in objects in canvas

function Edit() {
  const [ middleMouseDown, setMiddleMouseDown ] = useState(false)
  const [ mousePos, setMousePos ] = useState({
    x: null,
    y: null
  })
  useEffect(() => {
    const mouseDownWrapper = (e) => {
      mouseDown(e, setMiddleMouseDown)
    }
    const mouseUpWrapper = (e) => {
      mouseUp(e, setMiddleMouseDown)
    }
    const mouseMoveWrapper = (e) => {
      mouseMove(e, middleMouseDown, mousePos, setMousePos)
    }
    document.addEventListener('keydown', preventZoom)
    document.getElementById('canvas').addEventListener('wheel', preventZoomScroll)
    document.addEventListener('mousedown', mouseDownWrapper)
    document.addEventListener('mouseup', mouseUpWrapper)
    document.addEventListener('mousemove', mouseMoveWrapper)
    const preCanvas = document.getElementById('canvas')
    preCanvas.width = window.innerWidth + 2 * 2000
    preCanvas.height = window.innerHeight + 2 * 2000
    const canvas = preCanvas.getContext('2d')
    const gradient = canvas.createRadialGradient(150, 50, 5, 90, 60, 100);
    gradient.addColorStop(1, "rgb(205, 255, 255)")
    gradient.addColorStop(0, "white")
    canvas.fillStyle = gradient
    canvas.fillRect(0, 0, preCanvas.width, preCanvas.height)
    for (const budName in spoodawebData) {
      const bud = spoodawebData[budName]
      drawHexagon(bud.position.x, bud.position.y, canvas)
    }
    return () => {
      document.removeEventListener('keydown', preventZoom)
      document.getElementById('canvas').removeEventListener('wheel', preventZoomScroll)
      document.removeEventListener('mousedown', mouseDownWrapper)
      document.removeEventListener('mouseup', mouseUpWrapper)
      document.removeEventListener('mousemove', mouseMoveWrapper)
    }
  })
  return (
    <>
      <div className={styles.divCanvas} id='divCanvas'>
        <canvas className={styles.canvas} id='canvas'></canvas>
      </div>
    </>
  );
}

/*
<svg id='svg'>
  <defs>
    <pattern id="p2" patternUnits="userSpaceOnUse" x="0" y="0" width="10" height="10">
      <image xlinkHref="http://phrogz.net/tmp/grid.gif" width="10" height="10" />
    </pattern>
  </defs>
  <rect fill='url(#p2)' stroke-width="5px"></rect>
</svg>
*/
export default Edit;

/*
FOR FUTURE REFERENCE

$(document).keydown(function(event) {
if (event.ctrlKey==true &amp;&amp; (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109' || event.which == '187' || event.which == '189' ) ) {
event.preventDefault();
}
// 107 Num Key +
// 109 Num Key -
// 173 Min Key hyphen/underscor Hey
// 61 Plus key +/= key
});
$(window).bind('mousewheel DOMMouseScroll', function (event) {
if (event.ctrlKey == true) {
event.preventDefault();
}
});

*/