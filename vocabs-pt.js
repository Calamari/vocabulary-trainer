#!/usr/bin/env node

var path = require('path')
var fs = require('fs')
var pkg = require('./package.json')

var vocabFile = path.join(__dirname, pkg.vocabFile);

if (!fs.existsSync(vocabFile)) {
  fs.writeFileSync(vocabFile, JSON.stringify([]))
}

var program = require('commander')

program
  .version(pkg.version)

program
  .command('add', 'add a new word to vocabulary')
  .command('addverb', 'add a new verb conjugation test to vocabulary')
  .command('train', 'train some words')

program.parse(process.argv);
