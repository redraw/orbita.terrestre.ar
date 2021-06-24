function toISOString(date) {
  // hating javascript
  const [year, month, day] = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ]
  const [hour, minute, second] = [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ]
  const dt = new Date(
    Date.UTC(year, month, day, hour, minute, second)
  )
  return dt.toISOString()
}

export {
  toISOString
}