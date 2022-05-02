import React, { useEffect, useState } from 'react'
import * as reactKonva from 'react-konva'
import { getStage, hexagonPoints, drawHexagon, getHexagonLines } from './HelperFuncs'
import styles from './edit.module'

function hexagon({ x, y, radius }) {
  return ( 
    <reactKonva.Shape
      x={x+radius}
      y={y+radius-4.5}
      radius={radius}
      fill='rgba(0, 0, 0, 0)'
      stroke='black'
      sceneFunc={(ctx, shape) => {
        const points = hexagonPoints(shape.getAttr('radius'), 0, 0) // why is this not the same as points variable above???
        drawHexagon(ctx, points)
        ctx.fillStrokeShape(shape)
      }}>
    </reactKonva.Shape>
  )
}

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

const clear = (ctx) => {
  const background = getElementById('background')
  ctx.clearRect(0, 0, background.height, background.width)
}

const startPointX = window.innerWidth*0.8
const startPointY = window.innerHeight/2

const width = window.screen.width
const height = window.screen.height

const secondColor = '#1a2653'
const firstColor = '#006bce'

const draw = (background, ctx) => {
  const grd = ctx.createRadialGradient(startPointX, startPointY, 100, startPointX, startPointY, 1000)
  grd.addColorStop(0, firstColor)
  grd.addColorStop(1, secondColor)
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, width, height)
  drawHexagonGrid(ctx, background.offsetWidth, background.offsetHeight)
}

function Background() {
  // const firstColor = '#75e6ff'
  useEffect(() => {
    const background = document.getElementById('background') 
    const ctx = background.getContext('2d')
    const interval = setInterval(() => {
      requestAnimationFrame(() => draw(background, ctx))
    }, 10)
  }, [])
  return (
    <canvas
      id='background'
      x={0}
      y={0}
      width={width}
      height={height}></canvas>
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