import React, { useEffect, useState } from 'react'
import * as reactKonva from 'react-konva'
import * as utils from './utils'
import styles from './edit.module'

const hexagonLineColor = 'black'

const lightRadius = 50

const lightsList = []
const rippleList = []

const clear = (ctx) => {
  const lightBack = document.getElementById('lightBack')
  ctx.clearRect(0, 0, lightBack.height*2, lightBack.width*2)
}

const startPointX = window.innerWidth*0.8
const startPointY = window.innerHeight/2

const width = window.screen.width
const height = window.screen.height

const secondColor = '#1a2653'
const firstColor = '#006bce'

const backgroundGradient = (ctx) => {
  const grd = ctx.createRadialGradient(startPointX, startPointY, 100, startPointX, startPointY, 1000)
  grd.addColorStop(0, firstColor)
  grd.addColorStop(1, secondColor)
  return grd
} 

function drawHexagonGrid(ctx, width, height) {
  const hexesPerRow = Math.ceil(width / 70.81) 
  const hexesPerCol = Math.ceil(height / 69.28)
  const hexagonWidth = 40 * 2 
  const gapWidth = 2
  const xDiff = hexagonWidth * 0.75 
  const yDiff = Math.sqrt(Math.pow(hexagonWidth, 2) - Math.pow(hexagonWidth/2, 2))/2
  let lastX = -xDiff 
  let lastY = yDiff 
  const grd = backgroundGradient(ctx)
  ctx.fillStyle = grd
  // ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.strokeStyle = 'rgba(0, 0, 0, 0)'
  for (let colNum = 0; colNum < hexesPerCol; colNum++) {
    for (let rowNum = 0; rowNum < hexesPerRow; rowNum++) {
      let x = lastX + xDiff
      let y
      if (rowNum % 2 === 0) { // even
        y = lastY - yDiff 
      } else if (rowNum % 2 !== 0) { // odd
        y = lastY + yDiff 
      }
      lastX = x
      lastY = y
      if (rowNum + 1 === hexesPerRow) {
        lastX = -xDiff
        lastY = yDiff + 2 * yDiff * (colNum + 1)
      }
      drawHexagon(ctx, hexagonPoints(hexagonWidth/2-gapWidth, x, y))
      ctx.fill()
      ctx.stroke()
    }
  }
}

const lightSpeed = 20 // pixels per second
const drawRate = 20 // per second

const draw = (lightBack, ctx) => {
  const radius = 240 
  const grd = backgroundGradient(ctx)
  ctx.fillStyle = grd
  // ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(0, 0, width, height)
  for (const light of lightsList) {
    const timeElapsed = 1/drawRate
    const distTravelled = timeElapsed * lightSpeed * 10
    let angle = light.direction
    while (angle > 90) {
      angle -= 90
    } 
    const xChange = Math.cos(angle) * distTravelled
    const yChange = Math.sin(angle) * distTravelled
    if (light.isLeft) {
      light.x -= xChange
    } else {
      light.x += xChange
    }
    if (light.isUp) {
      light.y -= yChange
    } else {
      light.y += yChange
    }
    const x = light.x
    const y = light.y
    const grd = ctx.createRadialGradient(x, y, 0, x, y, radius)
    grd.addColorStop(0, `rgba(255, 255, 255, ${light.opacity})`)
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()
  }

  const rippleWidth = 500 
  for (const ripple of rippleList) {
    const x = ripple.x
    const y = ripple.y
    let grd
    if (ripple.radius > rippleWidth) {
      grd = ctx.createRadialGradient(x, y, ripple.radius-rippleWidth, x, y, ripple.radius)
    } else {
      grd = ctx.createRadialGradient(x, y, 0, x, y, ripple.radius)
    } 
    grd.addColorStop(0, 'rgba(0, 0, 0, 0)')
    grd.addColorStop(0.5, `rgba(255, 255, 255, ${ripple.opacity})`)
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(x, y, ripple.radius, 0, 2 * Math.PI)
    ctx.fill()
    ripple.radius += 180 
  } 
}

const randRange = (min, max, prec=4) => {
  const num = (Math.random() * (max - min) + min).toFixed(prec)
  return num
}

const isDirectionLeft = (direction) => {
  const topLeft = 90
  const bottomLeft = 270
  if (direction <= topLeft) {
    return true
  }
  if (direction <= bottomLeft + 90 && direction >= bottomLeft) {
    return true
  }
  return false
}

function Background() {
  // const firstColor = '#75e6ff'
  useEffect(() => {
    const hexagons = document.getElementById('hexagons') 
    const hexagonCtx = hexagons.getContext('2d')
    drawHexagonGrid(hexagonCtx, hexagons.offsetWidth, hexagons.offsetHeight)
    const lightBack = document.getElementById('lightBack')
    const lightBackCtx = lightBack.getContext('2d')
    const lightLoop = () => {
      const rndTimeOut = randRange(0, 2) 
      setTimeout(() => {
        console.log(rndTimeOut)
        const x = randRange(0, hexagons.width, 0)
        const y = randRange(0, hexagons.height, 0)
        const direction = randRange(0, 360, 0) 
        const directionIsUp = direction / 180 < 1
        const directionIsLeft = isDirectionLeft(direction) 
        let nearestBorderX = directionIsLeft ? 0 : width
        let nearestBorderY = directionIsUp ? 0 : height
        const Ynearest = nearestBorderX - nearestBorderY < 0
        let ttl
        if (Ynearest) {
          ttl = Math.abs(y - nearestBorderY) / lightSpeed
        } else {
          ttl = Math.abs(x - nearestBorderX) / lightSpeed
        }
        console.log(ttl)
        const light = {
          x: Number(x),
          y: Number(y),
          direction: Number(direction),
          ttl: ttl,
          isLeft: directionIsLeft,
          isUp: directionIsUp,
          opacity: 0
        } // imagine using degrees for angle couldnt be me
        const lightIndex = lightsList.length
        lightsList.push(light)
        setTimeout(() => {
          const opacityInterval = setInterval(() => {
            const light = lightsList[lightIndex]
            if (!light || light.opacity <= 0) {
              console.log('cleared')  
              clearInterval(opacityInterval)
              lightsList.splice(lightIndex, 1)
              return
            }
            light.opacity -= 0.1
          }, 100)
        }, ttl * 100)
        const opacityInterval = setInterval(() => {
          const light = lightsList[lightIndex]
          if (!light || light.opacity >= 1) {
            clearInterval(opacityInterval)
            return
          }
          light.opacity += 0.1
        }, 100)
        
        lightLoop()
      }, rndTimeOut * 1000)
    }
    lightLoop()
    const grd = backgroundGradient(lightBackCtx)
    lightBackCtx.fillStyle = grd
    lightBackCtx.fillRect(0, 0, width, height)
    const drawLoop = () => {
      setTimeout(() => {
        if (lightsList.length > 0) {
          requestAnimationFrame(() => {clear(lightBackCtx); draw(lightBack, lightBackCtx)})
        }
        drawLoop()
      }, 1000 / drawRate)
    }
    drawLoop()
    document.addEventListener('mousedown', ({ pageX, pageY }) => {
      const rippleIndex = rippleList.length
      const { x, y } = utils.getCanvasMousePos(pageX, pageY)
      rippleList.push({
        x: x,
        y: y,
        radius: 1,
        opacity: 0
      })
      setTimeout(() => {
        const opacityInterval = setInterval(() => {
          const ripple = rippleList[rippleIndex]
          if (!ripple || ripple.opacity <= 0) {
            clearInterval(opacityInterval)
            rippleList.splice(rippleIndex, 1)
            return
          }
          ripple.opacity -= 0.1
        }, 50)
      }, 50)
      const opacityInterval = setInterval(() => {
        const ripple = rippleList[rippleIndex]
        if (!ripple || ripple.opacity >= 0.7) {
          clearInterval(opacityInterval)
          return
        }
        ripple.opacity += 0.1
      }, 50)
    })
  }, [])
  return (
    <>
      <div className={styles.divBackground} id='divHexagons'>
        <canvas
          id='hexagons'
          x={0}
          y={0}
          width={width}
          height={height}></canvas>
      </div>
      <div className={styles.divLightBack} id='divLightBack'>
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

<reactKonva.Rect // should look like the frozen in the calculator app (lol)
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