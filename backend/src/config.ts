interface IConfig {
  port: number
}

export const config: IConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 1234
}
