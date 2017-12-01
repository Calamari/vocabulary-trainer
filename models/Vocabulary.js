const fs = require('fs')

const c = require('../constants')
const { inDays } = require('../utils/date')

const Mapping = {}
Mapping[c.TYPE_CONJUGATION] = require('./Verb')
Mapping[c.TYPE_TRANSLATION] = require('./Word')

module.exports = class Vocabulary {
  constructor (vocabFile) {
    this.vocabFile = vocabFile
  }

  get set () {
    const now = new Date().getTime()
    const vocab = JSON.parse(fs.readFileSync(this.vocabFile))
    if (this._setIds) {
      const currentSet = vocab.filter(v => v.nextRepetition < now && this._setIds.indexOf(v.word) !== -1)

      if (currentSet.length) return currentSet
    }
    const set = vocab.filter(v => v.nextRepetition < now).slice(0, c.SET_LENGTH)
    this._setIds = set.map(v => v.word)
    return set
  }

  get currentSetLength () {
    if (!this._setIds) return 0
    const now = new Date().getTime()
    const vocab = JSON.parse(fs.readFileSync(this.vocabFile))
    return vocab.filter(v => v.nextRepetition < now && this._setIds.indexOf(v.word) !== -1).length
  }

  nextItem () {
    let item = chooseRandomly(this.set)
    if (item) {
      return Mapping[item.type].fromJson(item)
    }
  }

  updateWord (item) {
    const vocab = JSON.parse(fs.readFileSync(this.vocabFile))
    const newVocab = vocab.map(function(v) {
      if (v.word === item.word) {
        return item.toJson()
      }
      return v
    })
    fs.writeFileSync(this.vocabFile, JSON.stringify(newVocab))
  }

  addNewWord (item) {
    const vocab = JSON.parse(fs.readFileSync(this.vocabFile))

    vocab.push(wordObject.toJson)

    fs.writeFileSync(this.vocabFile, JSON.stringify(vocab))
  }
}

function chooseRandomly(items) {
  const len = items.length
  return items[Math.floor(Math.random() * len)]
}
