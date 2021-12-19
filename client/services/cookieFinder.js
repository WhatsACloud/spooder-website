module.exports = (cookieName) => {
  console.log('cookies', document.cookie)
  const cookies = document.cookie.split(';')
  for (var i = 0; cookies.length; i++) {
    if (cookies[i].split('=')[0] === cookieName) {
      console.log(cookies[i].split('=')[1])
      return cookies[i].split('=')[1]
    }
  }
}
