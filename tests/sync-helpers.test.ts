import { describe, expect, it, vi } from 'vitest'
import { standingsSnapshots, topScorerSnapshots } from '../server/db/schema.js'
import { replaceExistingRoundSnapshotBundle } from '../server/services/sync-helpers.js'

describe('replaceExistingRoundSnapshotBundle', () => {
  it('removes prior round snapshots before a fresh insert', async () => {
    const where = vi.fn(async () => undefined)
    const tx = {
      delete: vi.fn(() => ({ where })),
    }

    await replaceExistingRoundSnapshotBundle(tx as never, 2)

    expect(tx.delete).toHaveBeenCalledTimes(2)
    expect(tx.delete).toHaveBeenNthCalledWith(1, topScorerSnapshots)
    expect(tx.delete).toHaveBeenNthCalledWith(2, standingsSnapshots)
    expect(where).toHaveBeenCalledTimes(2)
  })
})
