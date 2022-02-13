module.exports = {
  port: 8081,
  db: {
    database: process.env.DB_NAME || 'spooderweb',
    user: process.env.DB_USER || 'spooderweb',
    password: process.env.DB_PASS || 'spooderweb',
    options: {
      dialect: process.env.DIALECT || 'sqlite',
      host: process.env.HOST || 'localhost',
      storage: './spooderweb.sqlite',
      logging: console.log
    }
  }
}