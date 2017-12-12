const c = require('../constants')
const { inDays } = require('../utils/date')
const WordBase = require('./WordBase')

module.exports = class Word extends WordBase {
  constructor (word, translation) {
    super()
    this.word = word
    this.translation = translation
    this.type = c.TYPE_TRANSLATION
  }

  toJson () {
    return {
      word: this.word,
      translation: this.translation,
      nextRepetition: this.nextRepetition.getTime(),
      consecutiveRight: this.consecutiveRight,
      timesEnteredWrong: this.timesEnteredWrong,
      seen: this.seen,
      type: this.type
    }
  }

  static fromJson (json) {
    const obj = new Word(json.word, json.translation)
    obj.seen = json.seen
    obj.consecutiveRight = json.consecutiveRight
    obj.timesEnteredWrong = json.timesEnteredWrong
    obj.nextRepetition = new Date(json.nextRepetition)
    return obj
  }
}
