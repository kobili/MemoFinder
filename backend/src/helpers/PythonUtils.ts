import path from 'path'
import { PythonShell } from 'python-shell'

export class PythonUtils {
  public static async runPythonScript(args: string[], scriptName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.resolve('../', 'function_call_counter', `${scriptName}.py`)
      PythonShell.run(scriptPath, { args }, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.stringify(results))
        }
      })
    })
  }
}
