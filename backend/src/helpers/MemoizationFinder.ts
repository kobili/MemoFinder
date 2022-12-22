import Decimal from 'decimal.js'
import { uniq, zipObject } from 'lodash'

import { IFormattedData, ISignature } from './FunctionCallDataFormatter'

interface IMemoizationResult {
  funcName: string
  isMemoized: boolean
  signatureMemoizationResult: ISignatureMemoizationResult[]
  memoizationScore: number
  estimatedTimeSaved: number
}
interface ISignatureMemoizationResult {
  signature: string
  lineNumbers: number[]
  numCalled: number[]
  estimatedTimeSaved: number
  memoizationScore: number
}

interface IMemoizationAlgorithmOptions {
  timeUnitMultiplier: number
}

const DEFAULT_OPTIONS: IMemoizationAlgorithmOptions = {
  timeUnitMultiplier: 1000 // default is milliseconds
}
export class MemoizationFinder {
  public static findMemiozations(
    data: IFormattedData,
    options: IMemoizationAlgorithmOptions = DEFAULT_OPTIONS
  ): IMemoizationResult[] {
    const functionMap: Record<string, Record<string, ISignature>> = {}
    for (const [signature, signatureData] of Object.entries(data.signatures)) {
      const [funcName] = signature.split('(')
      if (functionMap[funcName]) {
        functionMap[funcName][signature] = signatureData
      } else {
        functionMap[funcName] = {
          [signature]: signatureData
        }
      }
    }

    const result: IMemoizationResult[] = []
    for (const [funcName, signatures] of Object.entries(functionMap)) {
      const isFunctionMemoized = this.isFunctionMemoized(signatures)
      const signatureMemoizationResult = this.getSignatureMemoizationResults(
        signatures,
        isFunctionMemoized,
        options
      )
      result.push({
        funcName,
        isMemoized: isFunctionMemoized,
        signatureMemoizationResult,
        memoizationScore: isFunctionMemoized
          ? 0
          : Math.max(...signatureMemoizationResult.map((result) => result.memoizationScore)),
        estimatedTimeSaved: isFunctionMemoized
          ? 0
          : Math.max(...signatureMemoizationResult.map((result) => result.estimatedTimeSaved))
      })
    }

    return result.sort((a, b) => b.memoizationScore - a.memoizationScore)
  }

  private static getSignatureMemoizationResults(
    signatures: Record<string, ISignature>,
    isMemoized: boolean,
    options: IMemoizationAlgorithmOptions
  ): ISignatureMemoizationResult[] {
    const results: ISignatureMemoizationResult[] = []
    for (const [signature, signatureData] of Object.entries(signatures)) {
      const { numInstances, totalTime, instances } = signatureData
      const returnValues = uniq(Object.values(instances).map((instance) => instance.returnValue))

      const memoizationScore =
        // Math.log(numInstances - returnValues.length + 1)*(((totalTime / numInstances) * options.timeUnitMultiplier)**2)*(totalTime * options.timeUnitMultiplier)
        Math.log(numInstances - returnValues.length + 1) *
        ((totalTime / numInstances) * options.timeUnitMultiplier) ** 2
      const lineNumbers = uniq(Object.values(instances).map((instance) => instance.line))
      const estimatedTimeSaved = (totalTime / numInstances) * (numInstances - 1)
      const lineNumbersToNumCalled: Record<number, number> = zipObject(
        lineNumbers,
        new Array(lineNumbers.length).fill(0)
      )
      let numCalled: number[]
      if (lineNumbers.length === 1) {
        numCalled = [numInstances]
      } else {
        for (const instance of Object.values(instances)) {
          lineNumbersToNumCalled[instance.line] += 1
        }

        numCalled = Object.values(lineNumbersToNumCalled)
      }
      results.push({
        signature,
        lineNumbers: Object.keys(lineNumbersToNumCalled).map((line) => parseInt(line, 10)),
        numCalled,
        estimatedTimeSaved,
        memoizationScore
      })
    }
    return results
  }

  private static isFunctionMemoized(signatures: Record<string, ISignature>): boolean {
    // using P(memoized) = 0.5 as a baseline
    const probabilityMemoized = 0.5
    const validSignatures = Object.values(signatures).filter(
      (signature) => signature.numInstances > 1
    )
    const relativeIncreases = validSignatures.map((validSignatures) => {
      const { numInstances, totalTime, instances } = validSignatures
      const longestTime = Math.max(...Object.values(instances).map((instance) => instance.time))
      const avgTime = totalTime / numInstances
      return longestTime / avgTime
    })
    const probabilityMemoizedGivenRelativeIncrease =
      relativeIncreases.reduce(
        (acc, relativeIncrease) =>
          acc * this.getProbabilityRelativeIncreaseGivenMemoized(relativeIncrease),
        1
      ) * probabilityMemoized

    const probabilityNotMemoizedGivenRelativeIncrease =
      relativeIncreases.reduce((acc, relativeIncrease) => {
        // naively assuming that the conditional probability of RI given not memoized is the compliment of the conditional probability of RI given memoized
        const decimal = new Decimal(
          this.getProbabilityRelativeIncreaseGivenMemoized(relativeIncrease)
        )
        const compliment = decimal.mul(-1).add(1)
        return acc * compliment.toNumber()
      }, 1) *
      (1 - probabilityMemoized)
    console.log(
      probabilityMemoizedGivenRelativeIncrease,
      probabilityNotMemoizedGivenRelativeIncrease,
      relativeIncreases,
      relativeIncreases.map((relativeIncrease) =>
        this.getProbabilityRelativeIncreaseGivenMemoized(relativeIncrease)
      )
    )
    return probabilityMemoizedGivenRelativeIncrease >= probabilityNotMemoizedGivenRelativeIncrease
  }

  private static getProbabilityRelativeIncreaseGivenMemoized(relativeIncrease: number): number {
    const probability = Math.min(1, 1.5 * Math.log(relativeIncrease))
    // if probability is 0 or 1 it will cause the whole conditional probability to be 0 so we smooth it out a bit
    return probability <= 0 ? 0.01 : probability >= 1 ? 0.99 : probability
  }
}
