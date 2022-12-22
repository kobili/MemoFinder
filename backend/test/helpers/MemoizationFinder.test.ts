import { expect } from 'chai'

import { MemoizationFinder } from '../../src/helpers/MemoizationFinder'
import { DummyObjectCreator } from '../DummyObjectCreator'

describe(MemoizationFinder.name, () => {
  it('properly calculates memoization data and returns a sorted list', () => {
    const data = DummyObjectCreator.createFormattedData({
      signatures: {
        'test(1)': DummyObjectCreator.createSignature({
          numInstances: 3,
          totalTime: 18,
          instances: {
            '1': DummyObjectCreator.createInstance({
              line: 1,
              time: 3
            }),
            '2': DummyObjectCreator.createInstance({
              line: 1,
              time: 6
            }),
            '3': DummyObjectCreator.createInstance({
              line: 2,
              time: 9
            })
          }
        }),
        'test(2)': DummyObjectCreator.createSignature({
          numInstances: 2,
          totalTime: 2,
          instances: {
            '1': DummyObjectCreator.createInstance({
              line: 1,
              time: 1
            }),
            '2': DummyObjectCreator.createInstance({
              line: 1,
              time: 1
            })
          }
        }),
        'foo(2)': DummyObjectCreator.createSignature({
          numInstances: 2,
          totalTime: 4,
          instances: {
            '1': DummyObjectCreator.createInstance({
              line: 3,
              time: 3
            }),
            '2': DummyObjectCreator.createInstance({
              line: 1,
              time: 1
            })
          }
        })
      }
    })

    const result = MemoizationFinder.findMemiozations(data, { timeUnitMultiplier: 1 })
    expect(result[0].estimatedTimeSaved).to.equal(12)
    expect(result[0].funcName).to.equal('test')
    expect(result[0].memoizationScore).to.be.a('number') // memoizationScore is subject to change
    expect(result[0].isMemoized).to.equal(false)
    expect(result[0].signatureMemoizationResult[0].signature).to.equal('test(1)')
    expect(result[0].signatureMemoizationResult[1].signature).to.equal('test(2)')
    expect(result[0].signatureMemoizationResult[0].estimatedTimeSaved).to.equal(12)
    expect(result[0].signatureMemoizationResult[1].estimatedTimeSaved).to.equal(1)
    expect(result[0].signatureMemoizationResult[0].lineNumbers).to.deep.equal([1, 2])
    expect(result[0].signatureMemoizationResult[1].lineNumbers).to.deep.equal([1])

    expect(result[1].estimatedTimeSaved).to.equal(0)
    expect(result[1].funcName).to.equal('foo')
    expect(result[1].memoizationScore).to.equal(0)
    expect(result[1].isMemoized).to.equal(true)
    expect(result[1].signatureMemoizationResult[0].signature).to.equal('foo(2)')
    expect(result[1].signatureMemoizationResult[0].estimatedTimeSaved).to.equal(2)
    expect(result[1].signatureMemoizationResult[0].lineNumbers).to.deep.equal([3, 1])
  })
})
