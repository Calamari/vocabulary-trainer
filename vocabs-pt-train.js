#!/usr/bin/env node

var path = require('path')
var fs = require('fs')
var chalk = require('chalk')
var pkg = require('./package.json')
var c = require('./constants')
var today = startOfDay(new Date())
var levenshtein = require('fast-levenshtein')
var clear = require('console-clear')
const conjugationBeginnings = require('./config').conjugationBeginnings
const now = new Date().getTime()
const THRESHOLD = 1

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

function main() {
  clear(true)
  askSomething()
    .then(waitToClear)
    .then(main)
}
main()

function askSomething() {
  const vocab = JSON.parse(fs.readFileSync(vocabFile))
  const chosenItem = chooseRandomly(vocab.filter(v => v.nextRepetition < now))
  if (!chosenItem) {
    console.log('Looks like you are done for today. No words to train left.\n');
    process.exit(0);
  }

  switch (chosenItem.type) {
    case c.TYPE_CONJUGATION:
      return askConjugation(chosenItem)
    default:
      return askWord(chosenItem)
  }
}

function askWord(item) {
  return new Promise(function(resolve, reject) {
    const question = `Translate "${item.germanWord}": `
    rl.question(question, function(input) {
      const distance = levenshtein.get(item.word, input)
      process.stdout.cursorTo(question.length, 0)
      if (distance === 0) {
        console.log(chalk.green(input))
        console.log('Super, that was correct!')
        wordWasRight(item).then(resolve)
      } else if (distance <= THRESHOLD) {
        // @TODO Show within word where it is wrong
        console.log(chalk.green(input))
        console.log(`Good enough, but the correct version would be: ${item.word}`)
        wordWasRight(item).then(resolve)
      } else {
        console.log(chalk.red(input))
        console.log('That was wrong, the right translation is:', chalk.bold(item.word))
        wordWasWrong(item).then(resolve)
      }
    })
  })
}

function askConjugation(item) {
  return new Promise(function(resolve, reject) {
    clear(true)
    console.log('Conjugate the following verb in', chalk.gray.italic(item.tense), 'tense:', chalk.bold(item.word), '\n')
    askForm({ item, index: 0, fails: 0 })
      .then(askForm)
      .then(askForm)
      .then(askForm)
      .then(askForm)
      .then(({ fails }) => {
        if (fails) {
          console.log('Sorry. But you have to try that again today')
          return wordWasWrong(item)
        } else {
          console.log('Super, that was correct!\nTo the next one…')
          return wordWasRight(item)
        }
      })
      .then(resolve)
  })
}

function askForm({ item, index, fails }) {
  return new Promise(function(resolve, reject) {
    const rightAnswer = item.forms[index]

    rl.question(conjugationBeginnings[index] + ' ', function(input) {
      process.stdout.cursorTo(conjugationBeginnings[index].length + 1, index + 2)
      if (input === rightAnswer) {
        console.log(chalk.green(input))
      } else {
        console.log(chalk.red.strikethrough(input), `[${rightAnswer}]`)
        ++fails
      }
      resolve({ item, index: index + 1, fails})
    })
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
