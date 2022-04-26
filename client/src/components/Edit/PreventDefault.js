const preventZoomKeys = {
  "=": true,
  "+": true,
  "-": true,
  "_": true
}

module.exports = {
  preventZoom: e => {
    if (e.ctrlKey === true && (preventZoomKeys[e.key])) {
      e.preventDefault()
    }
  },
  preventZoomScroll: e => {
    if (e.ctrlKey) {
      e.preventDefault()
    }
  }
}