import {
  IFormattedData,
  IInstance,
  IMetaDeta,
  ISignature
} from '../src/helpers/FunctionCallDataFormatter'

export class DummyObjectCreator {
  public static createFormattedData(formattedData?: Partial<IFormattedData>): IFormattedData {
    return {
      metaData: this.createMetaData(),
      signatures: {
        module: this.createSignature()
      },
      ...formattedData
    }
  }

  public static createMetaData(metaData?: Partial<IMetaDeta>): IMetaDeta {
    return {
      runtime: 0,
      root: 'module',
      totalInstances: 1,
      ...metaData
    }
  }

  public static createSignature(signature?: Partial<ISignature>): ISignature {
    return {
      numInstances: 1,
      totalTime: 0,
      instances: {
        module: this.createInstance()
      },
      ...signature
    }
  }

  public static createInstance(instance?: Partial<IInstance>): IInstance {
    return {
      line: -1,
      time: 0,
      ...instance
    }
  }
}
