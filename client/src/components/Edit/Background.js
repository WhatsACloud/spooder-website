import React, { useEffect, useState } from 'react'
import * as reactKonva from 'react-konva'
import { getStage } from './HelperFuncs'

function Background() {
  useEffect(() => {
    const background = getStage().children[0]
    console.log(background)
  }, [])
  return (
    <>
      <reactKonva.Rect // should look like the frozen background in the calculator app (lol)
        x={0}
        y={0}
        width={window.innerWidth + 2 * 2000}
        height={window.innerHeight + 2 * 2000}
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={70}
        fillRadialGradientColorStops={[0, 'red', 0.5, 'yellow', 1, 'blue']}>

      </reactKonva.Rect>
    </>
  )
}
export { Background as Background }