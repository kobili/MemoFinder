import cors from 'cors'
import express, { Application } from 'express'
import { Server as HTTPServer } from 'http'

import { Logger } from './Logger'
import { operations } from './operations'
import { OperationType } from './operations/types'

// server class based on CPSC 310 (2022 FALL) server starter code
export class Server {
  private readonly expressApp: Application

  private server: HTTPServer | undefined

  constructor(private readonly port: number) {
    this.expressApp = express()

    this.registerMiddlewares()
    this.registerRoutes()
  }

  private registerMiddlewares(): void {
    this.expressApp.use(express.json())
    this.expressApp.use(cors())

    // logging middleware
    this.expressApp.use(Logger.endpointLogger())
  }

  private registerRoutes(): void {
    for (const { type, path, func } of operations) {
      switch (type) {
        case OperationType.Get:
          this.expressApp.get(path, func)
          break
        case OperationType.Post:
          this.expressApp.post(path, func)
          break
        case OperationType.Del:
          this.expressApp.delete(path, func)
          break
      }
    }
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.info('Server::start() - start')
      if (this.server) {
        console.error('Server::start() - server already listening')
        reject()
      } else {
        this.server = this.expressApp
          .listen(this.port, () => {
            console.info(`Server::start() - server listening on port: ${this.port}`)
            resolve()
          })
          .on('error', (err: Error) => {
            console.error(`Server::start() - server ERROR: ${err.message}`)
            reject(err)
          })
      }
    })
  }

  public stop(): Promise<void> {
    console.info('Server::stop()')
    return new Promise((resolve, reject) => {
      if (this.server === undefined) {
        console.error('Server::stop() - ERROR: server not started')
        reject()
      } else {
        this.server.close(() => {
          console.info('Server::stop() - server closed')
          resolve()
        })
      }
    })
  }
}
