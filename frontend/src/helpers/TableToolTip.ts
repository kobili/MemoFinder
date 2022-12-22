import * as go from 'gojs'

export class TableToolTip extends go.Adornment {
  private table: go.Panel

  constructor(type?: go.PanelLayout | string, init?: Partial<go.Adornment>) {
    super(type, init)
    this.table = new go.Panel('Table', {
      margin: 5
    })
    this.add(
      new go.Shape('Rectangle', {
        fill: 'white',
        stroke: 'black'
      })
    ).add(this.table)
  }

  public addCell(
    row: number,
    column: number,
    text?: string,
    textBinding?: string,
    conv?: go.TargetConversion,
    columnSpan = 1,
    rowSpan = 1
  ) {
    const textBlock = new go.TextBlock({
      margin: 5,
      row,
      column,
      rowSpan,
      columnSpan
    })

    if (text) {
      textBlock.text = text
    } else if (textBinding) {
      textBlock.bind(new go.Binding('text', textBinding, conv))
    }
    this.table.add(textBlock)

    return this
  }
}
