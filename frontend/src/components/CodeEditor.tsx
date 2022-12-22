import Editor from '@monaco-editor/react'
import { useEffect } from 'react'

import { useData } from '../contexts/DataContext'

export const CodeEditor = () => {
  const { code, setCode, tableData } = useData()

  useEffect(() => {
    let displacement = 0
    let codeLines = code.split('\n')
    for (const {
      isMemoized,
      name,
      numCalled,
      estimatedTimeSaved,
      memoizationScore,
      lineNumber
    } of tableData) {
      if (isMemoized || numCalled <= 1 || estimatedTimeSaved <= 0 || memoizationScore <= 0.05) {
        continue
      }
      const line = lineNumber - 1 + displacement
      const tabs = codeLines[line].match(/^\s*/)?.[0] ?? ''
      const txtToInsert1 = `${tabs}# This line is causing ${numCalled} repeated calls to the function ${name}`
      const txtToInsert2 = `${tabs}# we estimate that memoization or caching this function can save ${estimatedTimeSaved} milliseconds`
      codeLines = [
        ...codeLines.slice(0, line),
        txtToInsert1,
        txtToInsert2,
        ...codeLines.slice(line)
      ]
      displacement += 2
    }
    setCode(codeLines.join('\n'))
  }, [tableData])

  return (
    <Editor
      defaultLanguage="python"
      value={code}
      onChange={(value) => setCode(value || '')}
      theme="light"
      options={{
        scrollBeyondLastLine: false,
        minimap: { enabled: false }
      }}
      loading=""
      className="editor"
    />
  )
}
