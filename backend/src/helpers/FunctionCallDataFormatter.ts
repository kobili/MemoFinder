// these interfaces are coupled their corresponding interface in the frontend
export interface IFormattedData {
  metaData: IMetaDeta
  signatures: Record<string, ISignature>
}

export interface IMetaDeta {
  runtime: number
  root: string
  totalInstances: number
}

export interface ISignature {
  numInstances: number
  totalTime: number
  instances: Record<string, IInstance>
}

export interface IInstance {
  caller?: string
  line: number
  time: number
  returnValue?: any
}

const MODULE = 'module'

export class FunctionCallDataFormatter {
  public static formatFunctionCallData(rawFunctionCallData: any): IFormattedData {
    const { function_calls: functionCalls, totals, returnUID } = rawFunctionCallData
    if (
      !functionCalls ||
      !totals ||
      !this.validateFunctionCallData(functionCalls) ||
      !this.validateTotals(totals) ||
      typeof returnUID !== 'string'
    ) {
      throw new Error('Invalid function call data')
    }

    const signatures: Record<string, ISignature> = {}
    for (const [signatureAndId, rawInstance] of Object.entries(functionCalls)) {
      const [signature, callId] = this.getSignatureAndId(signatureAndId)
      const [, callerId] = this.getSignatureAndId(rawInstance.caller)

      const instance: IInstance = {
        caller: callerId === `<${MODULE}>` ? MODULE : callerId,
        line: rawInstance.lineno,
        time: rawInstance.process_time,
        returnValue: rawInstance.return_value === returnUID ? undefined : rawInstance.return_value
      }

      if (signatures[signature]) {
        signatures[signature].numInstances += 1
        signatures[signature].totalTime += instance.time
        signatures[signature].instances[callId] = instance
      } else {
        signatures[signature] = {
          numInstances: 1,
          totalTime: instance.time,
          instances: {
            [callId]: instance
          }
        }
      }
    }

    const moduleTotalTime = Object.values(signatures)
      .flatMap((signature) => Object.values(signature.instances))
      .reduce((sum, instance) => {
        if (instance.caller === MODULE) {
          return sum + instance.time
        }
        return sum
      }, 0)

    signatures[MODULE] = {
      numInstances: 1,
      totalTime: moduleTotalTime,
      instances: {
        [MODULE]: { line: -1, time: moduleTotalTime }
      }
    }

    return {
      metaData: {
        runtime: moduleTotalTime,
        root: MODULE,
        totalInstances: Object.values(signatures).reduce(
          (sum, signature) => sum + signature.numInstances,
          0
        )
      },
      signatures
    }
  }

  private static getSignatureAndId(signatureAndId: string): [string, string] {
    const splitIndex = signatureAndId.lastIndexOf('$')
    const signature = signatureAndId.slice(0, splitIndex)
    const id = signatureAndId.slice(splitIndex + 1)
    return [signature, id]
  }

  private static validateFunctionCallData(
    functionCalls: Record<string, any>
  ): functionCalls is Record<
    string,
    { caller: string; lineno: number; return_value: any; process_time: number }
  > {
    // ? maybe only do this for one value of functionCall to save time
    for (const value of Object.values(functionCalls)) {
      if (!value || !value.caller || !value.lineno || !value.process_time) {
        return false
      }
    }
    return true
  }

  private static validateTotals(totals: Record<string, any>): totals is {
    number_of_calls: Record<string, number>
    processing_time: Record<string, number>
  } {
    // ? maybe only do this for one value of totals to save time
    if (!totals || !totals.number_of_calls || !totals.processing_time) {
      return false
    }
    return true
  }
}
