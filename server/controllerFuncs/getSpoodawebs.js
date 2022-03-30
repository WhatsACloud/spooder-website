module.exports = {
  end(req, res, next) {
    const response = []
    for (const index in req.body.webs) {
      const web = req.body.webs[index].dataValues
      response.push({id: web.id, title: web.title})
    }
    console.log(response)
    res.send(response)
  }
}