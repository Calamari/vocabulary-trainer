#!/usr/bin/env node

var path = require('path')
var fs = require('fs')
var chalk = require('chalk')
var pkg = require('./package.json')
var c = require('./constants')
const Word = require('./models/Word')

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

askForGerman()
  .then(checkIfWordExists)
  .then(askForForeignLang)
  .then(askForNextRepetition)
  .then(save)
  .then(confirm)
  .catch(onError)


function askForGerman() {
  return new Promise(function(resolve, reject) {
    rl.question('Enter german word: ', function(word) {
      resolve(word)
    })
  })
}

function checkIfWordExists(word) {
  return new Promise(function(resolve, reject) {
    const vocab = JSON.parse(fs.readFileSync(vocabFile))
    const entries = vocab.filter(x => x.word === word)

    if (entries.length > 0) {
      console.log('Word does already exist.')
      process.exit(0)
    }
    resolve(word)
  })
}

function askForForeignLang(word) {
  return new Promise(function(resolve, reject) {
    rl.question('Enter foreign word: ', function(translation) {
      resolve(new Word(word, translation))
    })
  })
}

function askForNextRepetition(wordObject) {
  return new Promise(function(resolve, reject) {
    rl.question('When should we ask for it next? (in days, enter for immediately) ', function(countStr) {
      var days = parseInt(countStr, 10) || 0

      wordObject.repeatInDays(days)
      resolve(wordObject)
    })
  })
}

function save(wordObject) {
  return new Promise(function(resolve, reject) {
    const vocab = JSON.parse(fs.readFileSync(vocabFile))

    vocab.push(wordObject.toJson())

    fs.writeFileSync(vocabFile, JSON.stringify(vocab))
    resolve(wordObject)
  })
}

function confirm(wordObject) {
  console.log('Asking about', chalk.bold(wordObject.word), `after ${wordObject.nextRepetition}`)
  process.exit(0)
}

function onError(err) {
  console.error('Sorry, something unexpected happend', err)
  process.exit(1)
}
