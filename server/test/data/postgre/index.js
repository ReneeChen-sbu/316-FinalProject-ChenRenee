const path = require("path");
require('dotenv').config({ path: path.join(__dirname, "../../../.env") });

const PostgreDatabaseManager = require("../../../db/postgresql/index.js");
const testData = require("../example-db-data.json");

async function resetPostgre() {
    const db = new PostgreDatabaseManager();
    await db.connect();

    // wipe tables first
    await db.User.destroy({ where: {}, truncate: true, cascade: true });
    await db.Playlist.destroy({ where: {}, truncate: true, cascade: true });

    // refill users
    for (const user of testData.users) {
        await db.createUser({
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            password_hash: user.passwordHash
        });

        console.log("created user -> " + user.email);
    }

    // refill playlists
    for (const p of testData.playlists) {
        await db.createPlaylist({
            name: p.name,
            songs: p.songs || [],
            ownerEmail: p.ownerEmail || "renee@chen.com"
        });
        
        console.log("created playlist -> " + p.name);
    }

    console.log("Postgre reset complete");
}

resetPostgre();
