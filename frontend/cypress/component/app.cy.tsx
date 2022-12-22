import '../../src/index.css'
import '../../src/App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import React from 'react'

import App from '../../src/App'
import { Data, DataProvider, MemoizationResult } from '../../src/contexts/DataContext'

// EXPECTS: backend to be running
describe('App Integration Tests', () => {
  let diagram: go.Diagram
  let response: {
    graphData: Data
    memoizationData: MemoizationResult[]
  }

  const updateDiagram = () => {
    cy.window().then((win) => {
      diagram = win.go.Diagram.fromDiv(
        win.document.getElementsByClassName('graph')[0]
      ) as go.Diagram
    })

    // wait for diagram to be initialized
    cy.wait(1000)
  }

  const runCode = () => {
    cy.get('.run').click()
    cy.wait('@getData').then((interception) => {
      response = interception.response?.body.result
      updateDiagram()
    })
  }

  const checkForNoComments = () => {
    cy.get('.monaco-editor textarea:first')
      .invoke('val')
      .then((code) => {
        if (typeof code === 'string') {
          // check that the starter code lines DO NOT HAVE comments
          expect(code.includes('#')).to.be.false
        } else {
          throw new Error('code is not a string')
        }
      })
  }

  const checkLinks = () => {
    const responseLinks = []
    const { signatures } = response.graphData
    for (const signature in signatures) {
      const { instances } = signatures[signature]
      for (const instanceId in instances) {
        const { caller, line } = instances[instanceId]
        if (caller) {
          responseLinks.push({
            from: caller,
            to: instanceId,
            label: `line ${line}`
          })
        }
      }
    }
    const graphLinks = (diagram.model as go.GraphLinksModel).linkDataArray
    expect(graphLinks).length(responseLinks.length)
    expect(
      (diagram.model as go.GraphLinksModel).linkDataArray.map(({ from, to, label }) => ({
        from,
        to,
        label
      }))
    ).to.deep.equal(responseLinks)
  }

  beforeEach(() => {
    cy.mount(
      <DataProvider>
        <App />
      </DataProvider>
    )
    cy.get('.graph').should('exist')

    cy.intercept('/python').as('getData')
  })

  describe('Default Code fib(n=5)', () => {
    it('should generate the default tree and grid graph', () => {
      runCode()

      cy.fixture('fib5').then((fib5) => {
        const { tree } = fib5

        // check nodes for tree
        expect(diagram.nodes.count).to.equal(tree.nodes.length)
        expect(
          diagram.model.nodeDataArray.map(({ label, line, returnValue }) => ({
            label,
            line,
            returnValue
          }))
        ).to.deep.equal(tree.nodes)

        // check links for tree
        checkLinks()
      })

      // change to grid view
      cy.get('#grid-icon').click()
      updateDiagram()

      cy.fixture('fib5').then((fib5) => {
        const { grid } = fib5

        // check nodes for grid
        expect(diagram.nodes.count).to.equal(grid.nodes.length)
        expect(
          diagram.model.nodeDataArray.map(({ key, label, numCalls }) => ({
            key,
            label,
            numCalls
          }))
        ).to.deep.equal(grid.nodes)
      })
    })

    it('should add comments on correct lines', () => {
      checkForNoComments()
      runCode()

      cy.get('.monaco-editor textarea:first')
        .invoke('val')
        .then((code) => {
          if (typeof code === 'string') {
            const lines = code.split('\n')
            // check that the 4th and 5th lines HAVE comments
            // this indicates that our memoization algorithm worked
            expect(lines[3].includes('#')).to.be.true
            expect(lines[4].includes('#')).to.be.true
          } else {
            throw new Error('code is not a string')
          }
        })
    })
  })

  // https://leetcode.com/problems/house-robber
  describe('Recursive Robber', () => {
    const typeCode = () => {
      cy.get('.monaco-editor textarea:first')
        .type('{selectall}{backspace}')
        .type(
          'def house_robber(nums):\nreturn recursive_robber(nums, len(nums) - 1)\n' +
            '{backspace}' +
            'def recursive_robber(nums, i):\nif i == 0: return nums[0]\nif i == 1: return max(nums[0], nums[1])\n' +
            'return max(recursive_robber(nums, i-1), nums[i] + recursive_robber(nums, i-2))\n' +
            '{backspace}' +
            'if __name__ == "__main__":\nhouse_robber([1,2,3,4,5])',
          { force: true }
        )
    }

    it('should generate the correct graph for recursive robber', () => {
      typeCode()
      runCode()

      cy.fixture('recursive_robber').then((rr) => {
        const { tree } = rr

        // check nodes for tree
        expect(diagram.nodes.count).to.equal(tree.nodes.length)
        expect(
          diagram.model.nodeDataArray.map(({ label, line, returnValue }) => ({
            label,
            line,
            returnValue
          }))
        ).to.deep.equal(tree.nodes)

        // check links for tree
        checkLinks()
      })

      // change to grid view
      cy.get('#grid-icon').click()
      updateDiagram()

      cy.fixture('recursive_robber').then((rr) => {
        const { grid } = rr

        // check nodes for grid
        expect(diagram.nodes.count).to.equal(grid.nodes.length)
        expect(
          diagram.model.nodeDataArray.map(({ key, label, numCalls }) => ({
            key,
            label,
            numCalls
          }))
        ).to.deep.equal(grid.nodes)
      })
    })

    it('should add comments on correct lines', () => {
      typeCode()
      checkForNoComments()
      runCode()

      cy.get('.monaco-editor textarea:first')
        .invoke('val')
        .then((code) => {
          if (typeof code === 'string') {
            const lines = code.split('\n')
            // check that the 6th and 7th lines HAVE comments
            // this indicates that our memoization algorithm worked
            expect(lines[5].includes('#')).to.be.true
            expect(lines[6].includes('#')).to.be.true
          } else {
            throw new Error('code is not a string')
          }
        })
    })
  })
})
