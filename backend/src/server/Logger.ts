import chalk from 'chalk'

export class Logger {
  public static endpointLogger = () => (req, res, next) => {
    const date = new Date()
    const formattedDate = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    if (res.headersSent) {
      console.log(
        `${chalk.blueBright(`[${formattedDate}]:`)} ${chalk.yellow(`${req.method}:${req.url}`)}`
      )
    } else {
      res.on('finish', () => {
        const isSuccess = res.statusCode === 200 || res.statusCode === 304
        const color = isSuccess ? chalk.green : chalk.red
        console.log(
          `${chalk.blueBright(`[${formattedDate}]:`)} ${color(
            `${req.method}:${req.url} ${res.statusCode}`
          )} ${isSuccess ? '' : chalk.grey(res.statusMessage)}`
        )
      })
    }
    next()
  }
}
