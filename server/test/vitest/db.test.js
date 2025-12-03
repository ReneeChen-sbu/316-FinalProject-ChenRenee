import { describe, it, expect } from 'vitest'
const db = require('../db/mongodb/index')

describe("DatabaseManager Tests", () => {

    it("should create user", async () => {
        const email = `test_${Math.random()}@test.com`
        const user = await db.createUser({
            userName: "Test User",
            email,
            passwordHash: "fakehash123"
        })

        expect(user.email).toBe(email)
    })

    it("should find user by email", async () => {
        const existing = await db.getUserByEmail("renee@chen.com")
        expect(existing).not.toBeNull()
    })

    it("should create playlist", async () => {
        const playlist = await db.createPlaylist({
            name: "Vitest Playlist",
            ownerEmail: "renee@chen.com",
            songs: []
        })
        expect(playlist.name).toBe("Vitest Playlist")
    })

    it("should get all playlists", async () => {
        const all = await db.getAllPlaylists()
        expect(Array.isArray(all)).toBe(true)
    })

})
