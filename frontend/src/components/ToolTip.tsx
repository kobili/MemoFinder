import { OverlayTrigger, Tooltip } from 'react-bootstrap'

export const ToolTip = ({ text, children }: { text: string; children: any }) => (
  <OverlayTrigger placement="bottom" overlay={<Tooltip>{text}</Tooltip>}>
    <div>{children}</div>
  </OverlayTrigger>
)
