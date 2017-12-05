#!/usr/bin/env node

var path = require('path')
var chalk = require('chalk')
var pkg = require('./package.json')
var c = require('./constants')
const exec = require('child_process').exec
const { inDays } = require('./utils/date')
const Vocabulary = require('./models/Vocabulary')
var levenshtein = require('fast-levenshtein')
var clear = require('console-clear')
const config = require('./config')
const THRESHOLD = 1

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const vocabFile = path.join(__dirname, pkg.vocabFile);
const vocabulary = new Vocabulary(vocabFile)

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
  const chosenItem = vocabulary.nextItem()
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
    const question = `Translate "${item.word}": `
    rl.question(question, function(input) {
      const distance = levenshtein.get(item.translation, input)
      process.stdout.cursorTo(question.length, 0)
      if (distance === 0) {
        console.log(chalk.green(input))
        console.log('Super, that was correct!')
        item.gotItRight()
      } else if (distance <= THRESHOLD) {
        // @TODO Show within word where it is wrong
        console.log(chalk.green(input))
        console.log(`Good enough, but the correct version would be: ${item.translation}`)
        item.gotItRight()
      } else {
        console.log(chalk.red(input))
        console.log('That was wrong, the right translation is:', chalk.bold(item.translation))
        item.gotItWrong()
      }
      exec(`say -v "${config.voice}" "${item.translation}"`)
      vocabulary.updateWord(item)
      resolve()
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
          item.gotItWrong()
        } else {
          console.log('Super, that was correct!\nTo the next one…')
          item.gotItRight()
        }
        vocabulary.updateWord(item)
      })
      .then(resolve)
  })
}

function askForm({ item, index, fails }) {
  return new Promise(function(resolve, reject) {
    const rightAnswer = item.forms[index]

    rl.question(config.conjugationBeginnings[index] + ' ', function(input) {
      process.stdout.cursorTo(config.conjugationBeginnings[index].length + 1, index + 2)
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

function waitToClear() {
  return new Promise(function(resolve, reject) {
    console.log(`\n\n${vocabulary.currentSetLength} items until next set`)
    rl.question('Press any key to proceed.', function() {
      clear(true)
      resolve()
    })
  })
}
