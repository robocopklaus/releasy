import * as core from '@actions/core'

export const run = (): void => {
  try {
    core.info('Hello, world!')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
