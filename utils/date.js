function startOfDay(date) {
  var time = date.getTime()
  return new Date(time - (time % 86400000))
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000)
}

function today() {
  return startOfDay(new Date())
}

function inDays(num) {
  return addDays(today(), num)
}

module.exports = {
  startOfDay,
  addDays,
  today,
  inDays
}
