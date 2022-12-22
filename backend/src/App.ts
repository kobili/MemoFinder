import { config } from './config'
import { Server } from './server/Server'

// App based on CPSC 310 (2022 FALL) starter code
export class App {
  public static async initServer(port: number) {
    console.info(`App::initServer( ${port} ) - start`)

    const server = new Server(port)
    return server
      .start()
      .then(() => {
        console.info('App::initServer() - started')
      })
      .catch((err: Error) => {
        console.error(`App::initServer() - error starting server: ${err.message}`)
      })
  }
}

// This ends up starting the whole system and listens on a hardcoded port (4321)
console.info('App - starting')
;(async () => {
  await App.initServer(config.port)
})()
