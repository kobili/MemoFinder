import { expect, request, use } from 'chai'
import chaiHttp from 'chai-http'

import { Server } from '../../src/server/Server'

const PORT = 1234
const baseApiURL = `localhost:${PORT}`

const sanityCheck = () => request(baseApiURL).get('/')
const getHello = () => request(baseApiURL).get('/hello')
const postPython = (code: string) => request(baseApiURL).post('/python').send({ code })

describe('server', () => {
  use(chaiHttp)
  let server: Server

  before(async () => {
    server = new Server(PORT)
    await server.start()
  })

  after(async () => {
    await server.stop()
  })

  describe('sanity endpoints', () => {
    it('sanity check', async () => {
      const res = await sanityCheck()
      expect(res).to.have.status(200)
      expect(res.text).to.equal('server is live')
    })

    it('GET hello', async () => {
      const res = await getHello()
      expect(res).to.have.status(200)
      expect(res.text).to.equal('Hello World!')
    })
  })

  describe('python endpoint', () => {
    it('properly POST python', async () => {
      const code = 'print("hello world")'
      const res = await postPython(code)
      expect(res).to.have.status(200)
      expect(res.body).to.have.property('result')
      expect(res.body.result).to.have.property('graphData')
      expect(res.body.result).to.have.property('memoizationData')
    })

    it('fails to POST python', async () => {
      const res = await postPython('')
      expect(res).to.have.status(400)
      expect(res.body).to.have.property('error')
    })
  })
})
