import core from '@actions/core'

const run = () => {
  try {
    core.info('Hello, world!')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
