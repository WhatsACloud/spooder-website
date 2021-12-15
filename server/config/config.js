module.exports = {
  port: 8081,
  db: {
    database: process.env.DB_NAME || 'fanfiction-website',
    user: process.env.DB_USER || 'fanfiction-website',
    password: process.env.DB_PASS || 'fanfiction-website',
    options: {
      dialect: process.env.DIALECT || 'sqlite',
      host: process.env.HOST || 'localhost',
      storage: './fanfiction-website.sqlite',
      logging: console.log
    }
  }
}