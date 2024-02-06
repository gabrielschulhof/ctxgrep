'use strict';
const path = require('node:path')
const fs = require('node:fs/promises')
const { createReadStream } = require('node:fs')
const assert = require('node:assert')
const Processor = require('../lib/processor')

const test = async (dir) => {
  const result = []

  const inFile = await createReadStream(path.join(dir, 'in.txt'))
  const expectedOutput = (await fs.readFile(path.join(dir, 'out.txt'), 'utf8')).split('\n').slice(0, -1)
  
  const proc = new Processor({regex: /match/, stream: inFile})
  proc.on('lines', lines => result.push(...lines))
  await new Promise(resolve => {
    proc.on('close', () => resolve())
  })

  assert.deepStrictEqual(result.map(({line}) => line), expectedOutput, dir)
}

;(async () => {

const testCaseDir = path.join(__dirname, 'cases')
const dirs = await fs.readdir(testCaseDir)
const result = await Promise.allSettled(dirs.map(dir => test(path.join(testCaseDir, dir))))

console.log(result
  .map(oneResult => ({...oneResult, ...(oneResult.status === 'rejected' ? {reason: oneResult.reason.stack} : {})}))
  .map(({status, reason, value}, index) => {
    console.log(`test case '${dirs[index]}':\n  status:\n${status}\n  outcome:\n${status === 'rejected' ? reason : value}`)
  })
)
})()
