import * as go from 'gojs'
import { PackedLayout } from 'gojs/extensionsJSM/PackedLayout'
import { ReactDiagram } from 'gojs-react'

import { useData } from '../contexts/DataContext'
import { TableToolTip } from '../helpers/TableToolTip'

class RectangularPackedLayout extends PackedLayout {
  constructor() {
    super()
    this.packShape = PackedLayout.Rectangular
    this.sortMode = PackedLayout.Area
    this.spacing = 25
  }
}

export const Grid = () => {
  const { ref, nodesDataArray } = useData()

  const GridDiagram = () =>
    new go.Diagram({
      layout: new RectangularPackedLayout(),
      allowDelete: false,
      allowCopy: false,
      allowInsert: false,
      allowMove: false,
      'toolManager.hoverDelay': 100,
      'toolManager.toolTipDuration': 20000,
      // DOCS: https://gojs.net/latest/extensionsJSM/PackedLayout.html
      nodeTemplate: new go.Node('Auto', {
        toolTip: new TableToolTip('Auto')
          .addCell(0, 0, undefined, 'label', undefined, 2)
          .addCell(1, 0, 'time')
          .addCell(1, 1, undefined, 'totalTime', (time) => `${time} ms`)
          .addCell(2, 0, '# calls')
          .addCell(2, 1, undefined, 'numCalls')
      })
        .add(
          new go.Shape({ strokeWidth: 0 })
            .bind('width', 'width')
            .bind('height', 'height')
            .bind('fill', 'color')
        )
        .add(
          new go.TextBlock({
            margin: 10,
            font: 'bold 14px sans-serif',
            stroke: '#333',
            wrap: go.TextBlock.WrapFit,
            textAlign: 'center',
            verticalAlignment: go.Spot.Center
          })
            .bind('text', 'label')
            .bind('width', 'width')
            .bind('height', 'height')
        )
    })

  return (
    <ReactDiagram
      ref={ref}
      divClassName="graph"
      initDiagram={GridDiagram}
      nodeDataArray={nodesDataArray}
    />
  )
}
