class Category {
  static colorErrMsg = (color) => new Error(`The color ${color} is invalid, expected hex color (e.g. #100f1e)`)
  name = ''
  color = ''
  _categId = null
  get categId() { return this._categId }
  toJSON = () => {
    return { name: this.name, color: this.color }
  }
  constructor(name, color) {
    if (color.length !== 7 || color.substring(0, 1) !== "#") throw Category.colorErrMsg(color)
    for (const letter of color.substring(1)) {
      if (isNaN(Number(letter)) && !(['a', 'b', 'c', 'd', 'e', 'f'].includes(letter))) {
        throw Category.colorErrMsg(color)
      }
    }
    this.name = name
    this.color = color
  }
}
export { Category }

class Categories {
  nextCategId = 1
  categories = null
  add = (category) => {
    this.categories[this.nextCategId] = category
    category._categId = this.nextCategId
    this.nextCategId += 1
  }
  getById = (id) => this.categories[id]
  toJSON = () => {
    const categs = {}
    for (const [ categId, category ] of Object.entries(this.categories)) {
      categs[categId] = category.toJSON()
    }
    delete categs[0]
    return categs
  }
  constructor() {
    this.categories = {
      0: new Category('Default', '#0000ff')
    }
  }
}
export { Categories }