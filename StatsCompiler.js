// THESE ARE THE ORIGINAL PLAYLISTS
const { readFileSync } = require('fs')
const fileContent = readFileSync('./public/data/PlaylisterData.json', 'utf-8');
const playlisterData = JSON.parse(fileContent);
let playlist = playlisterData.playlists.shift();
let songsMap = [];
let songsList = [];

while (playlist) {
    let song = playlist.songs.shift();
    while (song) {
        let key = song.title.trim().toLowerCase() + "-" + song.artist.trim().toLowerCase() + "-" + song.year;
        let value = songsMap[key];
        if (value) {
            value.count++;
        }
        else {
            songsMap[key] = song;
            songsList.push(song);
            song.count = 1;
        }
        song = playlist.songs.shift();    
    }
    playlist = playlisterData.playlists.shift();
}

const fs = require('fs');

// SORT BY TITLE
songsList.sort((a, b) => a.title.localeCompare(b.title));
let output = "";
for (let i = 0; i < songsList.length; i++) {
    let song = songsList[i];
    output += song.title + " by " + song.artist + "(" + song.year + "), Count: " + song.count + "\n";
}
fs.writeFileSync('SongsSortedByTitle.txt', output, 'utf-8');
console.log("SongsSortedByTitle.txt generated");

// SORT BY TITLE
songsList.sort((a, b) => a.artist.localeCompare(b.artist));
output = "";
for (let i = 0; i < songsList.length; i++) {
    let song = songsList[i];
    output += song.artist + ": " + song.title + " (" +  song.year + "), Count: " + song.count + "\n";
}
fs.writeFileSync('SongsSortedByArtist.txt', output, 'utf-8');
console.log("SongsSortedByArtist.txt generated");

// SORT BY YEAR
songsList.sort((a, b) => a.year - b.year);
output = "";
for (let i = 0; i < songsList.length; i++) {
    let song = songsList[i];
    output += song.year + ": " + song.title + " by " + song.artist + ", Count: " + song.count + "\n";
}
fs.writeFileSync('SongsSortedByYear.txt', output, 'utf-8');
console.log("SongsSortedByYear.txt generated");

// SORT BY COUNT
songsList.sort((a, b) => b.count - a.count);
output = "";
for (let i = 0; i < songsList.length; i++) {
    let song = songsList[i];
    output += song.title + " by " + song.artist + " (" + song.year + "), Count: " + song.count + "\n";
}
fs.writeFileSync('SongsSortedByCount.txt', output, 'utf-8');
console.log("SongsSortedByCount.txt generated");