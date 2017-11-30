const c = require('../constants')
const { inDays } = require('../utils/date')
const WordBase = require('./WordBase')

module.exports = class Verb extends WordBase {
  constructor (word, forms, tense) {
    super()
    this.word = word
    this.forms = forms
    this.tense = tense
    this.type = c.TYPE_CONJUGATION
  }

  toJson () {
    return {
      word: this.word,
      forms: this.forms,
      tense: this.tense,
      nextRepetition: this.nextRepetition.getTime(),
      type: this.type
    }
  }

  static fromJson (json) {
    const obj = new Verb(json.word, json.forms, json.tense)
    obj.seen = json.seen
    obj.consecutiveRight = json.consecutiveRight
    obj.timesEnteredWrong = json.timesEnteredWrong
    obj.nextRepetition = new Date(json.nextRepetition)
    return obj
  }
}
