'use strict';
const readline = require('node:readline')
const { EventEmitter } = require('node:events')

const TAB_WIDTH = 4

class Processor extends EventEmitter {
  #stream = null
  #regex = /./
  #lineIdx = 0
  #lastMatch = undefined

  #linesSoFar = []

  constructor({regex, stream}) {
    super()
    this.#stream = stream
    this.#regex = regex
    const rl = readline.createInterface({input: stream})
    rl.on('line', (line) => this.#processLine(line))
    rl.on('close', () => {
      this.#flush(this.#linesSoFar)
      this.emit('close')
    })
  }

  #getLineInfo(line) {
    this.#lineIdx++
    let indent = 0
    for (let idx = 0; idx < line.length; idx++) {
      if (line[idx] === ' ') {
        indent++
      } else if (line[idx] === '\t') {
        indent += TAB_WIDTH
      } else {
        break
      }
    }
    return new Proxy({ indent, line, matched: !!line.match(this.#regex), number: this.#lineIdx }, {
      get: (target, property) => {
        if (Object.keys(target).includes(property)) {
          return target[property]
        }
        throw new Error(`${property} is undefined on object`)
      }
    })
  }

  #flush(lines) {
    while (lines.length > 0) {
      if (lines[0].matched) {
        break
      }
      lines.shift()
    }
    if (lines.length > 0) {
      this.emit('lines', lines.map(({line, number}) => ({line, number})).reverse())
      lines.splice(0, lines.length)
    }
  }

  #processLine(line) {
    const currentLine = this.#getLineInfo(line)
    let soFar = this.#linesSoFar

    while (soFar.length > 0) {
      const previousLine = soFar[0]
      if (previousLine.indent >= currentLine.indent) {
        if (previousLine.matched) {
          if (previousLine.indent > currentLine.indent) {
            this.#flush(soFar)
          } else {
            break
          }
        } else {
          if (this.#lastMatch?.indent === currentLine.indent && previousLine.indent === currentLine.indent) {
            break
          }
          soFar.shift()
        }
      } else {
        break
      }
    }
    soFar.unshift(currentLine)
    if (currentLine.matched) {
      this.#lastMatch = currentLine
    }
  }
}

module.exports = Processor
