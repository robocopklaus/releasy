import core from '@actions/core'

export const run = (): void => {
  try {
    core.info('Hello, world!')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
