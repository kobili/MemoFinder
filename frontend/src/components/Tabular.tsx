import React from 'react'
import { Col, Table } from 'react-bootstrap'

import { useData } from '../contexts/DataContext'

export const Tabular = () => {
  const { tableData } = useData()
  const filteredTableData = tableData.filter((row) => row.lineNumber !== -1)
  return (
    <>
      {filteredTableData.length > 0 ? (
        <div className="p-3">
          <Table bordered hover>
            <thead>
              <tr>
                <th>Method name</th>
                <th>Line number</th>
                <th># times called</th>
                <th>Estimated time saved (ms)</th>
                <th>Should Memoize?</th>
            </tr>
            </thead>
            <tbody>
              {filteredTableData.map(({ estimatedTimeSaved, numCalled, name, lineNumber, memoizationScore }) => (
                <tr key={`${name}${lineNumber}`}>
                  <td>{name}</td>
                  <td>{lineNumber}</td>
                  <td>{numCalled}</td>
                  <td>{estimatedTimeSaved}</td>
                  <td style={{ backgroundColor: memoizationScore > 0.05 ? '#d4edda' : '#f8d7da' }}>{memoizationScore > 0.05 ? 'Should memoize' : 'No need to memoize'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <Col className="d-flex justify-content-center align-items-center h-100">
          <h3>Nothing to show</h3>
        </Col>
      )}
    </>
  )
}
