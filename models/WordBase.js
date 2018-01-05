const c = require('../constants')
const { inDays } = require('../utils/date')

module.exports = class WordBase {
  repeatInDays (days) {
    this.nextRepetition = inDays(days)
  }

  gotItRight () {
    this.seen = (this.seen || 0) + 1
    this.consecutiveRight = (this.consecutiveRight || 0) + 1
    this.nextRepetitionInDays = Math.pow(2, this.consecutiveRight - 1)
    this.nextRepetition = inDays(this.nextRepetitionInDays)
  }

  gotItWrong () {
    this.seen = (this.seen || 0) + 1,
    this.timesEnteredWrong = (this.timesEnteredWrong || 0) + 1
    this.consecutiveRight = 0
    this.nextRepetitionInDays = 0
    this.nextRepetition = inDays(0)
  }

  toJson () {
    throw 'Implement me'
  }

  static fromJson () {
    throw 'Implement me'
  }
}
