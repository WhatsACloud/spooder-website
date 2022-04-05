import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Authorizer from '../Shared/Authorizer'
import styles from './edit.module'
import konva from 'konva'
import { KonvaNodeEvent } from 'konva/lib/types'

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
    setMiddleMouseDown(true)
  }
}

const mouseUp = (e, setMiddleMouseDown) => {
  if (e.button === 1) {
    setMiddleMouseDown(false)
  }
}

const mouseMove = (e, middleMouseDown, mousePos, setMousePos) => {
  const x = e.pageX
  const y = e.pageY
  if (!middleMouseDown) {
    setMousePos({
      x: x,
      y: y
    })
    return
  }
  if (!mousePos.y) {
    setMousePos({
      x: x,
      y: y
    })
    return
  }
  const xDiff = mousePos.x - x
  const yDiff = mousePos.y - y
  const multi = 2
  divCanvas.scrollBy(-xDiff*multi, -yDiff*multi)
  setMousePos({
    x: x,
    y: y
  })
}

function DrawCanvas() {
  useEffect(() => {
    const stage = new konva.Stage({
      container: document.getElementById('divCanvas'),
      width: window.innerWidth + 2 * 2000,
      height: window.innerHeight + 2 * 2000
    })
    const mainLayer = new konva.Layer()
    // document.getElementsByClassName('konvajs-content')[0].addEventListener('wheel', preventZoomScroll)
    document.addEventListener('wheel', preventZoomScroll)

    for (const name in spoodawebData) {
      const bud = spoodawebData[name]
      const hexagon = new konva.RegularPolygon({
        x: bud.position.x,
        y: bud.position.y,
        sides: 6,
        radius: 40,
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 1,
        draggable: true,
      })
      mainLayer.add(hexagon)
    }
    stage.add(mainLayer)
  }, [])
  return <></>
}

function Edit() {
  const navigate = useNavigate()
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
    document.addEventListener('mousedown', mouseDownWrapper)
    document.addEventListener('mouseup', mouseUpWrapper)
    document.addEventListener('mousemove', mouseMoveWrapper)
    return () => {
      document.removeEventListener('keydown', preventZoom)
      // document.getElementsByClassName('konvajs-content')[0].removeEventListener('wheel', preventZoomScroll)
      document.removeEventListener('wheel', preventZoomScroll)
      document.removeEventListener('mousedown', mouseDownWrapper)
      document.removeEventListener('mouseup', mouseUpWrapper)
      document.removeEventListener('mousemove', mouseMoveWrapper)
    }
  }, [middleMouseDown])
  return (
    <>
      <Authorizer navigate={navigate} requireAuth={true}></Authorizer>
      <div className={styles.divCanvas} id='divCanvas'>
      </div>
      <DrawCanvas></DrawCanvas>
    </>
  )
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
export default Edit

/*
FOR FUTURE REFERENCE

$(document).keydown(function(event) {
if (event.ctrlKey==true &amp&amp (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109' || event.which == '187' || event.which == '189' ) ) {
event.preventDefault()
}
// 107 Num Key +
// 109 Num Key -
// 173 Min Key hyphen/underscor Hey
// 61 Plus key +/= key
})
$(window).bind('mousewheel DOMMouseScroll', function (event) {
if (event.ctrlKey == true) {
event.preventDefault()
}
})

*/