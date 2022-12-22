import { helloOperation, sanityCheckOperation } from './BaseOperations'
import { pythonFunctionCallCountOperation } from './PythonPostOperation'
import { IOperation } from './types'

export const operations: IOperation[] = [
  sanityCheckOperation,
  helloOperation,
  pythonFunctionCallCountOperation
]
