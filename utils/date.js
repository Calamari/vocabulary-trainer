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

function daysInWords(days) {
  switch (days) {
    case 0:
      return 'today'
    case 1:
      return 'tomorrow'
    case 2:
      return 'the day after tomorrow'
    default:
      return `in ${days} days`
  }
}

module.exports = {
  startOfDay,
  addDays,
  today,
  inDays,
  daysInWords
}
