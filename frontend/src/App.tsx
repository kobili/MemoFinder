import './App.css'

import React, { useState } from 'react'
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap'

import { CodeEditor, Grid, Icon, MethodologyModal, Tabular, ToolTip, Tree } from './components'
import { useData, VisualizationType } from './contexts/DataContext'

const App = () => {
  const { runCode, setVisualization, visualization, codeBeforeAnalysis, setCode } = useData()
  const [showCode, setShowCode] = React.useState(true)
  const [showModal, setShowModal] = React.useState(false)
  const [error, setError] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const analyze = async () => {
    setIsRunning(true)
    try {
      await runCode()
      setError('')
    } catch (e: any) {
      setError(e.message)
    }
    setIsRunning(false)
  }

  const renderVisualization = () => {
    switch (visualization) {
      case VisualizationType.Grid:
        return <Grid />
      case VisualizationType.Tree:
        return <Tree />
      case VisualizationType.Tabular:
        return <Tabular />
      default:
        return null
    }
  }

  return (
    <>
      <MethodologyModal show={showModal} setShow={setShowModal} />
      <div className="d-flex flex-column vh-100">
        <div className="text-bg-dark d-flex justify-content-between px-4 py-3 align-middle">
          <h3 className="m-0 p-0">MemoFinder</h3>
          <div className="d-flex">
            <Icon
              id="methodology-icon"
              iconName="Question"
              buttonClassname="ms-3"
              variant="outline-danger"
              onClick={() => setShowModal(true)}
              size={22}
              tooltipText="Methodology"
            />
            <Icon
              id="reset-code-icon"
              iconName="ArrowClockwise"
              buttonClassname="ms-3"
              variant="outline-danger"
              onClick={() => setCode(codeBeforeAnalysis)}
              disabled={codeBeforeAnalysis === ''}
              size={20}
              tooltipText="Reset Code"
            />
            <Icon
              id="code-icon"
              iconName="CodeSlash"
              buttonClassname="ms-3"
              variant="outline-danger"
              onClick={() => setShowCode(!showCode)}
              active={showCode}
              tooltipText={showCode ? 'Hide Code' : 'Show Code'}
            />
            <Icon
              id="table-icon"
              iconName="Table"
              buttonClassname="ms-3"
              variant="outline-danger"
              active={visualization === VisualizationType.Tabular}
              onClick={() => {
                setVisualization(VisualizationType.Tabular)
              }}
              tooltipText="Tabular View"
            />
            <Icon
              id="grid-icon"
              iconName="ColumnsGap"
              buttonClassname="ms-3"
              variant="outline-danger"
              active={visualization === VisualizationType.Grid}
              onClick={() => {
                setVisualization(VisualizationType.Grid)
              }}
              tooltipText="Grid View"
            />
            <Icon
              id="tree-icon"
              iconName="Diagram3Fill"
              buttonClassname="ms-3"
              variant="outline-danger"
              active={visualization === VisualizationType.Tree}
              onClick={() => {
                setVisualization(VisualizationType.Tree)
              }}
              tooltipText="Tree View"
            />
            <ToolTip text="Analyze Code">
              <Button
                variant="outline-danger"
                className="run ms-3"
                onClick={analyze}
                disabled={isRunning}
              >
                {isRunning && (
                  <Spinner
                    animation="border"
                    variant="danger"
                    size="sm"
                    as="span"
                    className="me-2"
                  />
                )}
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </Button>
            </ToolTip>
          </div>
        </div>
        <Container fluid className="flex-grow-1">
          <Row className="h-100" xs={showCode ? 2 : 1}>
            {showCode && (
              <Col className="px-0">
                <CodeEditor />
              </Col>
            )}
            {error ? (
              <Col className="d-flex justify-content-center align-items-center">
                <h4>
                  <code>{error}</code>
                </h4>
              </Col>
            ) : (
              <Col className="px-0">{renderVisualization()}</Col>
            )}
          </Row>
        </Container>
      </div>
    </>
  )
}

export default App
