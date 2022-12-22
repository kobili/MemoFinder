import { IOperation, OperationType } from './types'

export const sanityCheckOperation: IOperation = {
  path: '/',
  type: OperationType.Get,
  func: (req, res) => {
    res.status(200).send('server is live')
  }
}

export const helloOperation: IOperation = {
  path: '/hello',
  type: OperationType.Get,
  func: (req, res) => {
    res.status(200).send('Hello World!')
  }
}
