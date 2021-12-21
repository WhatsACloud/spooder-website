module.exports = (cookieName) => {
  if (!document.cookie) return false
  const cookies = document.cookie.split(';')
  console.log(cookies)
  for (var i = 0; i < cookies.length; i++) {
    if (cookies[i].split('=')[0].replace(/\s/g, '') === cookieName) {
      return cookies[i].split('=')[1]
    }
  }
}
