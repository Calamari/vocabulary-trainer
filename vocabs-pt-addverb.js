#!/usr/bin/env node

var path = require('path')
var fs = require('fs')
var chalk = require('chalk')
var pkg = require('./package.json')
var c = require('./constants')
const { inDays } = require('./utils/date')
const conjugationBeginnings = require('./config').conjugationBeginnings

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

var vocabFile = path.join(__dirname, pkg.vocabFile);

var program = require('commander')

program
  .parse(process.argv)

// MAIN PROGRAM:

askForWord()
  .then(checkIfWordExists)
  .then(askForForms)
  .then(askForNextRepetition)
  .then(save)
  .then(confirm)
  .catch(onError)


function askForWord() {
  return new Promise(function(resolve, reject) {
    rl.question('Enter word we want to conjugate: ', resolve)
  })
}

function checkIfWordExists(word) {
  return new Promise(function(resolve, reject) {
    const vocab = JSON.parse(fs.readFileSync(vocabFile))
    const entries = vocab.filter(x => x.word === word && x.type === c.TYPE_CONJUGATION)

    if (entries.length > 0) {
      console.log('Word does already exist.')
      process.exit(0)
    }
    resolve(word)
  })
}

function askForForms(word) {
  return new Promise(function(resolve, reject) {
    console.log('Enter conjugations in', chalk.gray.italic(c.ONLY_TENSE), 'tense:')

    askForm({ forms: [], index: 0 })
      .then(askForm)
      .then(askForm)
      .then(askForm)
      .then(askForm)
      .then(({ forms }) => {
        resolve({
          type: c.TYPE_CONJUGATION,
          tense: c.ONLY_TENSE,
          word,
          forms
        })
      })
  })
}

function askForm({ forms, index }) {
  return new Promise(function(resolve, reject) {
    rl.question(conjugationBeginnings[index] + ' ', function(input) {
      resolve({ forms: [...forms, input], index: index + 1 })
    })
  })
}

function askForNextRepetition(wordObject) {
  return new Promise(function(resolve, reject) {
    rl.question('When should we ask for it next? (in days, enter for immediately) ', function(countStr) {
      var days = parseInt(countStr, 10) || 0

      wordObject.nextRepetition = inDays(days).getTime()
      resolve(wordObject)
    })
  })
}

function save(wordObject) {
  return new Promise(function(resolve, reject) {
    const vocab = JSON.parse(fs.readFileSync(vocabFile))

    vocab.push(wordObject)

    fs.writeFileSync(vocabFile, JSON.stringify(vocab))
    resolve(wordObject)
  })
}

function confirm(wordObject) {
  console.log('Asking about', chalk.bold(wordObject.word), `after ${new Date(wordObject.nextRepetition)}`)
  process.exit(0)
}

function onError(err) {
  console.error('Sorry, something unexpected happend', err)
  process.exit(1)
}
}
