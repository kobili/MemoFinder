import { expect } from 'chai'

import { FunctionCallDataFormatter } from '../../src/helpers/FunctionCallDataFormatter'
import { DummyObjectCreator } from '../DummyObjectCreator'

describe(FunctionCallDataFormatter.name, () => {
  const returnUID = 'returnUID'
  it('should throw an error if the input is invalid', () => {
    expect(() => FunctionCallDataFormatter.formatFunctionCallData({})).to.throw()
  })

  it('should return only module if the input is empty', () => {
    const result = FunctionCallDataFormatter.formatFunctionCallData({
      function_calls: {},
      totals: {
        processing_time: {},
        number_of_calls: {}
      },
      returnUID: 'returnUID'
    })
    expect(result).to.deep.equal(DummyObjectCreator.createFormattedData())
  })

  it('should return the correct output for a single function call', () => {
    const result = FunctionCallDataFormatter.formatFunctionCallData({
      function_calls: {
        'test(1)$1': {
          caller: '<module>',
          lineno: 1,
          process_time: 1,
          return_value: returnUID
        }
      },
      totals: {
        number_of_calls: {
          'test()': 1
        },
        processing_time: {
          'test()': 1
        }
      },
      returnUID
    })
    expect(result).to.deep.equal({
      metaData: {
        runtime: 1,
        root: 'module',
        totalInstances: 2
      },
      signatures: {
        module: {
          numInstances: 1,
          totalTime: 1,
          instances: {
            module: { line: -1, time: 1 }
          }
        },
        'test(1)': {
          numInstances: 1,
          totalTime: 1,
          instances: {
            '1': { caller: 'module', line: 1, time: 1, returnValue: undefined }
          }
        }
      }
    })
  })

  it('should return the correct output for multiple function calls', () => {
    const result = FunctionCallDataFormatter.formatFunctionCallData({
      function_calls: {
        'test(1)$1': {
          caller: '<module>',
          lineno: 1,
          process_time: 6,
          return_value: returnUID
        },
        'test(1)$2': {
          caller: 'test(1)$1',
          lineno: 2,
          process_time: 2,
          return_value: returnUID
        },
        'test(2)$3': {
          caller: 'test(1)$2',
          lineno: 3,
          process_time: 4,
          return_value: 123
        }
      },
      totals: {
        number_of_calls: {
          'test()': 3
        },
        processing_time: {
          'test()': 12
        }
      },
      returnUID
    })
    expect(result).to.deep.equal({
      metaData: {
        runtime: 6,
        root: 'module',
        totalInstances: 4
      },
      signatures: {
        module: {
          numInstances: 1,
          totalTime: 6,
          instances: {
            module: { line: -1, time: 6 }
          }
        },
        'test(1)': {
          numInstances: 2,
          totalTime: 8,
          instances: {
            '1': { caller: 'module', line: 1, time: 6, returnValue: undefined },
            '2': { caller: '1', line: 2, time: 2, returnValue: undefined }
          }
        },
        'test(2)': {
          numInstances: 1,
          totalTime: 4,
          instances: {
            '3': { caller: '2', line: 3, time: 4, returnValue: 123 }
          }
        }
      }
    })
  })

  it('returns correct output with multiple module calls', () => {
    const result = FunctionCallDataFormatter.formatFunctionCallData({
      function_calls: {
        'test(1)$1': {
          caller: '<module>',
          lineno: 1,
          process_time: 6,
          return_value: returnUID
        },
        'test(1)$2': {
          caller: 'test(1)$1',
          lineno: 2,
          process_time: 2,
          return_value: returnUID
        },
        'test(2)$3': {
          caller: '<module>',
          lineno: 1,
          process_time: 4,
          return_value: 123
        }
      },
      totals: {
        number_of_calls: {
          'test()': 3
        },
        processing_time: {
          'test()': 12
        }
      },
      returnUID
    })
    expect(result).to.deep.equal({
      metaData: {
        runtime: 10,
        root: 'module',
        totalInstances: 4
      },
      signatures: {
        module: {
          numInstances: 1,
          totalTime: 10,
          instances: {
            module: { line: -1, time: 10 }
          }
        },
        'test(1)': {
          numInstances: 2,
          totalTime: 8,
          instances: {
            '1': { caller: 'module', line: 1, time: 6, returnValue: undefined },
            '2': { caller: '1', line: 2, time: 2, returnValue: undefined }
          }
        },
        'test(2)': {
          numInstances: 1,
          totalTime: 4,
          instances: {
            '3': { caller: 'module', line: 1, time: 4, returnValue: 123 }
          }
        }
      }
    })
  })
})
