## API endpoints:
### sanity check
```typescript
"/": {
  get: {
    description: "returns a message to indicate server is live",
    responses: {
      200: {
        text: "server is live"
      }
    }
  }
}
```

### hello world
```typescript
"/hello": {
  get: {
    description: "returns hello world"
    responses: {
      200: {
        text: "Hello World!"
      }
    }
  }
}
```

### python analysis
```typescript
"/python": {
  post: {
    description: "takes python code and runs it for data collection, formats the data, runs analysis on the data, returns formatted data and memoization result",
    postBody: {
      code: string
    },
    responses: {
      200: {
        schema: {
          result: {
            graphData: IFormattedData,
            memoizationData: Array<IMemoizationResult>
          }
        }
      },
      400: {
        schema: {
          error: string
        }
      }
    }
  }
}

interface IFormattedData {
  metaData: IMetaData
  signatures: Record<string, ISignature>
}

interface IMetaData {
  runtime: number
  root: string
  totalInstances: number
}

interface ISignature {
  numInstances: number
  totalTime: number
  instances: Record<string, IInstance>
}

interface IInstance {
  caller?: string
  line: number
  time: number
  returnValue?: any
}

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
```