#!/usr/bin/env node
'use strict';
const fs = require('node:fs')
const process = require('node:process')
const Processor = require('./processor')

const regex = new RegExp(process.argv[2])
const filename = process.argv[3]

if (!regex) {
  console.error(
`Usage: ${process.argv[0]} <regex> [filename|-]\n
  regex: a regular expression
  filename: the name of the file to process. Defaults to stdout if - is given
  or if the argument is omitted`
  )
  process.exit(1)
}

if (filename === '-') {
  filename = undefined
}

(new Processor({
  regex,
  stream: filename
    ? fs.createReadStream(filename)
    : process.stdin
})).on('lines', (lines) => {
  console.log(lines.map(({line, number}) => `${filename || 'stdin'}:${String(number).padStart(6, ' ')}:${line}`).join('\n'))
})
