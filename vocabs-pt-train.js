#!/usr/bin/env node

var path = require('path')
var fs = require('fs')
var pkg = require('./package.json')
var today = startOfDay(new Date())
var levenshtein = require('fast-levenshtein')
var clear = require('console-clear')
const now = new Date().getTime()
const THRESHOLD = 1

var boldOpen = '\u001b[1m'
var boldClose = '\u001b[22m'

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

askWord()
  // .then(checkIfWordExists)
  // .then(askForForeignLang)
  // .then(askForNextRepetition)
  // .then(save)
  // .catch(onError)


function askWord() {
  const vocab = JSON.parse(fs.readFileSync(vocabFile))
  const chosenItem = chooseRandomly(vocab.filter(v => v.nextRepetition < now))

  if (!chosenItem) {
    console.log('Looks like you are done for today. No words to train left.');
    process.exit(0);
  }

  rl.question(`Translate "${chosenItem.germanWord}":`, function(input) {
    const distance = levenshtein.get(chosenItem.word, input)
    if (distance === 0) {
      console.log('Super, that was correct!\nTo the next one…')
      wordWasRight(chosenItem)
        .then(waitToClear)
        .then(askWord)
    } else if (distance <= THRESHOLD) {
      console.log(`Good enough, but the correct version would be: ${chosenItem.word}`)
      wordWasRight(chosenItem)
        .then(waitToClear)
        .then(askWord)
    } else {
      console.log('That was wrong, the right translation is:', boldOpen, chosenItem.word, boldClose)
      wordWasWrong(chosenItem)
        .then(waitToClear)
        .then(askWord)
    }
  })
}

function save(wordObject) {
  const vocab = JSON.parse(fs.readFileSync(vocabFile))

  vocab.push(wordObject)

  fs.writeFileSync(vocabFile, JSON.stringify(vocab))
  process.exit(0)
}

function wordWasRight(item) {
  return updateWord({
    ...item,
    seen: (item.seen || 0) + 1,
    consecutiveRight: (item.consecutiveRight || 0) + 1,
    nextRepetition: addDays(today, 1).getTime()
  })
}

function wordWasWrong(item) {
  return updateWord({
    ...item,
    seen: (item.seen || 0) + 1,
    timesEnteredWrong: (item.timesEnteredWrong || 0) + 1,
    consecutiveRight: 0
  })
}

function waitToClear() {
  return new Promise(function(resolve, reject) {
    rl.question('\n\nPress any key to proceed.', function() {
      clear(true)
      resolve()
    })
  })
}

function updateWord(item) {
  return new Promise(function(resolve, reject) {
    const vocab = JSON.parse(fs.readFileSync(vocabFile))
    const newVocab = vocab.map(function(v) {
      if (v.germanWord === item.germanWord) {
        return item
      }
      return v
    })
    fs.writeFileSync(vocabFile, JSON.stringify(newVocab))
    resolve()
  });
}

function chooseRandomly(items) {
  const len = items.length
  return items[Math.floor(Math.random() * len)]
}

function startOfDay(date) {
  var time = date.getTime()
  return new Date(time - (time % 86400000))
}

function addDays(date, days) {
  return new Date(date.getTime() + (days * 86400000))
}
