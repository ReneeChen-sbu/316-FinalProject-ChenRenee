import { describe, it, expect, vi } from 'vitest'
const MongoDatabaseManager = require('../../db/mongodb')

describe("DatabaseManager interface", () => {
  const manager = new MongoDatabaseManager()

  it("exposes user helpers", () => {
    expect(typeof manager.getUserByEmail).toBe('function')
    expect(typeof manager.createUser).toBe('function')
  })

  it("exposes playlist helpers", () => {
    expect(typeof manager.createPlaylist).toBe('function')
    expect(typeof manager.getPlaylistById).toBe('function')
  })

  it("exposes song helpers", () => {
    expect(typeof manager.createSong).toBe('function')
    expect(typeof manager.findSongs).toBe('function')
  })
})
