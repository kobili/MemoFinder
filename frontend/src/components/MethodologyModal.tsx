import 'katex/dist/katex.min.css'

import { Modal } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

import { METHODOLOGY } from '../constants/constants'

export const MethodologyModal = ({
  show,
  setShow
}: {
  show: boolean
  setShow: (show: boolean) => void
}) => (
  <Modal show={show} onHide={() => setShow(false)} centered size="xl">
    <Modal.Header closeButton>
      <Modal.Title>Methodology</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ReactMarkdown
        children={METHODOLOGY}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      />
    </Modal.Body>
  </Modal>
)
