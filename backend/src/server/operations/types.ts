export enum OperationType {
  Get = 'get',
  Post = 'post',
  Del = 'del'
}

export interface IOperation {
  path: string
  type: OperationType
  func: (req, res) => void
}
