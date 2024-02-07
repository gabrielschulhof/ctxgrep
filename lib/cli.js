#!/usr/bin/env node
'use strict';
const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const fs = require('node:fs')
const process = require('node:process')
const Processor = require('./processor')

const y = yargs(hideBin(process.argv))
  .usage(
`$0 [-b] [-t n] regex [filename|-]

Searches the input ('filename', or standard input if omitted or set to '-') for
'regex' and prints out lines that match it and all preceding lines that have a
smaller indent`)
  .option('box-chars', {
    alias: 'b',
    type: 'boolean',
    description:
      'preprocess input to replace Unicode box drawing characters with spaces',
  })
  .option('tab-width', {
    alias: 't',
    type: 'number',
    description: 'tab width',
  })
const args = y.parse()

if (!args._[0]) {
  y.showHelp()
  process.exit(1)
}

const regex = new RegExp(args._[0])
const filename = args._[1]

if (filename === '-') {
  filename = undefined
}

(new Processor({
  ...(args.boxChars ? {
    isWhitespace: (char) => [' ', '│', '├', '─', '└'].includes(char)
  }: {}),
  regex,
  stream: filename
    ? fs.createReadStream(filename)
    : process.stdin
})).on('lines', (lines) => {
  console.log(lines.map(({line, number}) => `${filename || 'stdin'}:${String(number).padStart(6, ' ')}:${line}`).join('\n'))
})
