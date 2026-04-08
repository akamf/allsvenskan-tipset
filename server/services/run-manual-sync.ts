import { getSqlClient } from '../db/client'
import { runNightlySync } from './sync'

runNightlySync()
  .then(async (result) => {
    console.log(JSON.stringify(result, null, 2))
    await getSqlClient().end({ timeout: 1 })
  })
  .catch(async (error) => {
    console.error(error)
    await getSqlClient().end({ timeout: 1 })
    process.exit(1)
  })
