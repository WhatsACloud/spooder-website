import React, { useEffect, useState } from 'react'
import * as reactKonva from 'react-konva'
import { getStage, hexagonPoints, drawHexagon, getHexagonLines } from './HelperFuncs'
import styles from './edit.module'

const hexagonLineColor = 'black'

function drawHexagonGrid(ctx, width, height) {
  const hexesPerRow = Math.ceil(width / 70.81) 
  const hexesPerCol = Math.ceil(height / 69.28)
  let lastX = -60 
  let lastY = 34.64 
  for (let colNum = 0; colNum < hexesPerCol; colNum++) {
    for (let rowNum = 0; rowNum < hexesPerRow; rowNum++) {
      let x 
      let y
      if (rowNum % 2 === 0) {
        x = lastX + 60
        y = lastY - 34.64
      } else if (rowNum % 2 !== 0) {
        x = lastX + 60
        y = lastY + 34.64 
      }
      lastX = x
      lastY = y
      if (rowNum + 1 === hexesPerRow) {
        lastX = -60
        lastY = 34.64 + 69.28 * (colNum + 1)
      }
      drawHexagon(ctx, hexagonPoints(40, x, y))
      ctx.stroke()
    }
  }
}

const lightRadius = 50

const renderLight = (ctx, light) => {
  console.log(light)

}

const clear = (ctx) => {
  const background = document.getElementById('background')
  ctx.clearRect(0, 0, background.height, background.width)
}

const startPointX = window.innerWidth*0.8
const startPointY = window.innerHeight/2

const width = window.screen.width
const height = window.screen.height

const secondColor = '#1a2653'
const firstColor = '#006bce'

/*

function drawHexagonGrid(ctx, width, height, light=null) {
  const hexesPerRow = Math.ceil(width / 70.81) 
  const hexesPerCol = Math.ceil(height / 69.28)
  const hexagonWidth = 40 * 2 
  const xDiff = hexagonWidth * 0.75 
  const yDiff = Math.sqrt(Math.pow(hexagonWidth, 2) - Math.pow(hexagonWidth/2, 2))
  let lastX = -xDiff 
  let lastY = yDiff 
  for (let colNum = 0; colNum < hexesPerCol; colNum++) {
    for (let rowNum = 0; rowNum < hexesPerRow; rowNum++) {
      let x 
      let y
      if (rowNum % 2 === 0) {
        x = lastX + xDiff 
        y = lastY - yDiff 
      } else if (rowNum % 2 !== 0) {
        x = lastX + xDiff
        y = lastY + yDiff 
      }
      lastX = x
      lastY = y
      if (rowNum + 1 === hexesPerRow) {
        lastX = -xDiff
        lastY = yDiff + 2 * yDiff * (colNum + 1)
      }
      drawHexagon(ctx, hexagonPoints(40, x, y))
      ctx.stroke()
    }
  }
}

*/

const draw = (background, ctx) => {
  ctx.fillStyle = 'black'
  const grd = ctx.createRadialGradient(startPointX, startPointY, 100, startPointX, startPointY, 1000)
  grd.addColorStop(0, firstColor)
  grd.addColorStop(1, secondColor)
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, width, height)
  drawHexagonGrid(ctx, background.offsetWidth, background.offsetHeight)
}

const randRange = (min, max, prec=4) => {
  const num = (Math.random() * (max - min) + min).toFixed(prec)
  return num
}

function Background() {
  // const firstColor = '#75e6ff'
  useEffect(() => {
    const background = document.getElementById('background') 
    const ctx = background.getContext('2d')
    const loop = () => {
      const rndTimeOut = randRange(0, 4) 
      requestAnimationFrame(() => {clear(ctx); draw(background, ctx)})
      setTimeout(() => {
        console.log(rndTimeOut)
        const light = {x: randRange(0, background.width, 0), y: randRange(0, background.height, 0), direction: randRange(0, 360, 0)} // imagine using degrees for angle couldnt be me
        requestAnimationFrame(() => {clear(ctx); draw(background, ctx, light)})
        if (light) {
          renderLight(ctx, light)
        }
        loop()
      }, rndTimeOut * 1000)
    }
    loop()
  }, [])
  return (
    <>
      <div className={styles.divBackground} id='divBackground'>
        <canvas
          id='background'
          x={0}
          y={0}
          width={width}
          height={height}></canvas>
      </div>
      <div className={styles.divBackground} id='divLightBack'>
        <canvas
          id='lightBack'
          x={0}
          y={0}
          width={width}
          height={height}></canvas>
      </div>
    </>
  )
}

/*

<reactKonva.Rect // should look like the frozen background in the calculator app (lol)
  x={0}
  y={0}
  width={width}
  height={height}
  fillRadialGradientStartPoint={{ x: startPointX, y: startPointY }}
  fillRadialGradientStartRadius={100}
  fillRadialGradientEndPoint={{ x: startPointX, y: startPointY }}
  fillRadialGradientEndRadius={1000}
  fillRadialGradientColorStops={[0, firstColor, 1, secondColor]}></reactKonva.Rect>
<Hexagons
  width={width}
  height={height}></Hexagons>

*/

export { Background as Background }