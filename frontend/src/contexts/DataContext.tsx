import { hsv } from 'color-convert'
import { ObjectData } from 'gojs'
import { ReactDiagram } from 'gojs-react'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

import { SERVER_URL } from '../constants/constants'

export enum VisualizationType {
  Tree = 'Tree',
  Grid = 'Grid',
  Tabular = 'Tabular'
}

interface DataContextProps {
  data: Data
  tableData: TableData[]
  runCode: () => void
  ref: React.RefObject<ReactDiagram>
  nodesDataArray: ObjectData[]
  linksDataArray: ObjectData[] | undefined
  visualization: VisualizationType
  setVisualization: (visualization: VisualizationType) => void
  code: string
  codeBeforeAnalysis: string
  setCode: (code: string) => void
}

export interface Data {
  metaData: MetaData // information about the overall on a high level
  signatures: {
    [signature: string]: Signature // signature is the method name + parameters: fib(n=18)
  }
}

interface MetaData {
  runtime: number // runtime of the program in milliseconds, same as time for module (root)
  root: string // signature of the root method
  // total number of instances in the tree, equal to Object.values(signatures).reduce((acc, signature) => acc + signature.numInstances, 0)
  // if the number of signatures is too large, we won't create the nodes and links for the tree visualization
  totalInstances: number
}

interface Signature {
  numInstances: number // number of times the signature is called, equal to Object.keys(instances).length
  totalTime: number // total time spent in this method in milliseconds, equal to Object.values(instances).reduce((acc, curr) => acc + curr.time, 0)
  instances: {
    [id: string]: Instance
  }
}

interface Instance {
  // represents the id of the instance, unique for all function calls
  caller?: string // optional id of the caller, undefined if the function is root / standalone
  line: number // line number of the call
  time: number // time taken to execute this instance in milliseconds
  returnValue?: any // optional return value of the function call
}

export interface MemoizationResult2 {
  funcName: string
  isMemoized: boolean
  signatureMemoizationResult: MemoizationResult[]
  memoizationScore: number
  estimatedTimeSaved: number
}

export interface MemoizationResult {
  signature: string // signature of the method
  lineNumbers: number[] // line numbers where the method is called
  numCalled: number[] // number of times the method is called at each line number
  estimatedTimeSaved: number // estimated time saved in milliseconds
  memoizationScore: number // memoization score
}

// MemoizationResult grouped by method name and line number
interface TableData {
  name: string // name of the method
  lineNumber: number // line number where the method is called
  numCalled: number // number of times the method name is called for this line number
  estimatedTimeSaved: number // estimated time saved in milliseconds'
  memoizationScore: number // memoization score
  isMemoized: boolean // whether the method is already memoized
}

const DataContext = createContext({} as DataContextProps)

export const DataProvider = ({ children }: any) => {
  const [data, setData] = useState<Data>({} as Data)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [memoResults, setMemoResults] = useState<MemoizationResult2[]>([])
  const [tableData, setTableData] = useState<TableData[]>([])
  const ref = useRef<ReactDiagram>(null)
  const [visualization, setVisualization] = useState<VisualizationType>(VisualizationType.Tree)
  const [nodesDataArray, setNodesDataArray] = useState<ObjectData[]>([])
  const [linksDataArray, setLinksDataArray] = useState<ObjectData[] | undefined>([])
  const [treeNodes, setTreeNodes] = useState<ObjectData[]>([])
  const [treeLinks, setTreeLinks] = useState<ObjectData[]>([])
  const [gridNodes, setGridNodes] = useState<ObjectData[]>([])
  const [codeBeforeAnalysis, setCodeBeforeAnalysis] = useState('')
  const [code, setCode] = useState(
    'def fib(n):\n\tif n == 0 or n == 1:\n\t\treturn 1\n\treturn fib(n - 1) + fib(n - 2)\n\nif __name__ == "__main__":\n\tfib(5)'
  )

  useEffect(() => {
    ref.current?.clear()
    if (visualization === VisualizationType.Tree) {
      setNodesDataArray(treeNodes)
      setLinksDataArray(treeLinks)
    } else if (visualization === VisualizationType.Grid) {
      setNodesDataArray(gridNodes)
      setLinksDataArray(undefined)
    }
  }, [visualization])

  const runCode = async () => {
    if (!code.includes('# we estimate that memoization or caching this function')) {
      setCodeBeforeAnalysis(code)
    }
    const response = await fetch(`${SERVER_URL}/python`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code
      })
    })

    const body = await response.json()

    if (body.error) {
      throw new Error(body.error)
    }

    const {
      graphData,
      memoizationData
    }: {
      graphData: Data
      memoizationData: MemoizationResult2[]
    } = body.result

    const memoResultsGrouped: {
      [name: string]: {
        [lineNumber: number]: TableData
      }
    } = {}
    for (const result of memoizationData) {
      memoResultsGrouped[result.funcName] = {}
      for (const signatureResult of result.signatureMemoizationResult) {
        for (let i = 0; i < signatureResult.lineNumbers.length; i++) {
          const lineNumber = signatureResult.lineNumbers[i]
          const numCalled = signatureResult.numCalled[i]
          if (!memoResultsGrouped[result.funcName][lineNumber]) {
            memoResultsGrouped[result.funcName][lineNumber] = {
              name: result.funcName,
              lineNumber,
              numCalled,
              estimatedTimeSaved: result.estimatedTimeSaved,
              memoizationScore: result.memoizationScore,
              isMemoized: result.isMemoized
            }
          } else {
            memoResultsGrouped[result.funcName][lineNumber].numCalled += numCalled
          }
        }
      }
    }
    setTableData(
      Object.values(memoResultsGrouped)
        .map((group) => Object.values(group))
        .flat()
        .map((result) => ({
          ...result,
          estimatedTimeSaved: Number((result.estimatedTimeSaved * 1000).toFixed(6)),
          memoizationScore: Number(result.memoizationScore.toFixed(6))
        }))
    )
    setMemoResults(
      memoizationData.map((result) => ({
        ...result,
        estimatedTimeSaved: Number((result.estimatedTimeSaved * 1000).toFixed(6)),
        memoizationScore: Number(result.memoizationScore.toFixed(6))
      }))
    )
    setData(graphData)

    const { signatures, metaData } = graphData
    const treeNodes: ObjectData[] = []
    const treeLinks: ObjectData[] = []
    const gridNodes: ObjectData[] = []
    const { runtime, root } = metaData
    for (const signature in signatures) {
      const { numInstances, totalTime, instances } = signatures[signature]
      const formattedTotalTime = (totalTime * 1000).toFixed(6)
      const timePercentage = totalTime === 0 ? 0 : totalTime / runtime
      if (signature !== root) {
        gridNodes.push({
          key: signature,
          label: signature,
          numCalls: numInstances,
          totalTime: formattedTotalTime,
          color: `#${hsv.hex([120 - (totalTime / runtime) * 120, 100, 100])}`,
          // assign size based on the total time spent in the function
          height: 100 + (totalTime / runtime) * 100,
          width: 100 + (totalTime / runtime) * 100
        })
      }
      for (const instanceId in instances) {
        const { caller, time, line, returnValue } = instances[instanceId]
        const formattedTime = (time * 1000).toFixed(6)
        treeNodes.push({
          key: instanceId,
          label: signature,
          line,
          time: formattedTime,
          totalTime: formattedTotalTime,
          returnValue: returnValue !== undefined ? returnValue : null,
          // we can either use totalTime or time for color, totalTime gives a better representation of the time spent in the signature
          color: `#${hsv.hex([120 - timePercentage * 120, 100, 100])}`
        })
        if (caller) {
          treeLinks.push({
            from: caller,
            to: instanceId,
            label: `line ${line}`
          })
        }
      }
    }

    setTreeNodes(treeNodes)
    setTreeLinks(treeLinks)
    setGridNodes(gridNodes)

    ref.current?.clear()
    if (visualization === VisualizationType.Tree) {
      setNodesDataArray(treeNodes)
      setLinksDataArray(treeLinks)
    } else if (visualization === VisualizationType.Grid) {
      setNodesDataArray(gridNodes)
      setLinksDataArray(undefined)
    }
  }

  return (
    <DataContext.Provider
      value={{
        codeBeforeAnalysis,
        data,
        tableData,
        runCode,
        ref,
        nodesDataArray,
        linksDataArray,
        visualization,
        setVisualization,
        code,
        setCode
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
