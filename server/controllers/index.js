const routes = {
    '/login': require('./login'),
    '/register': require('./register'),
    '/webs': require('./spoodaweb')
  }
  
function addApiRoutes(app) {
  Object.keys(routes).forEach((route) => {
    const router = routes[route]
    app.use(route, router)
  })
}
  
  module.exports = addApiRoutes