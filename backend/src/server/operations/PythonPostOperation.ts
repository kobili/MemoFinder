import { existsSync, readFileSync } from 'fs'
import path from 'path'

import { FunctionCallDataFormatter } from '../../helpers/FunctionCallDataFormatter'
import { MemoizationFinder } from '../../helpers/MemoizationFinder'
import { PythonUtils } from '../../helpers/PythonUtils'
import { IOperation, OperationType } from './types'

export const pythonFunctionCallCountOperation: IOperation = {
  path: '/python',
  type: OperationType.Post,
  func: async (req, res) => {
    try {
      const { code } = req.body
      await PythonUtils.runPythonScript([code], 'counter')

      const pathToFile = path.resolve('../', 'function_call_counter', 'func_calls.json')
      if (!existsSync(pathToFile)) {
        throw new Error('data file failed to generate')
      }

      const rawData = JSON.parse(readFileSync(pathToFile, 'utf8'))

      const graphData = FunctionCallDataFormatter.formatFunctionCallData(rawData)
      const memoizationData = MemoizationFinder.findMemiozations(graphData)

      res.status(200).json({ result: { graphData, memoizationData } })
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
}
