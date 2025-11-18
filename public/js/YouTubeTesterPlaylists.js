function loadJSONSync(url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false); // false makes it synchronous
  xhr.send(null);

  if (xhr.status === 200) {
    return JSON.parse(xhr.responseText);
  } else {
    throw new Error(`Failed to load JSON: ${xhr.status}`);
  }
}

function initPlayer() {
  // 2. This code loads the IFrame Player API code asynchronously.
  let tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  let firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// THIS OVERRIDES A GLOBAL FUNCTION THAT WILL BE CALLED AS A 
// CALLBACK BECUASE WE USED THE YOUTUBE IFRAME API
function onYouTubeIframeAPIReady() {
  console.log("onYouTubeIframeAPIReady()");
  player = new YT.Player('youtube_test_player', {
    height: '390',
    width: '640',
    videoId: currentSong.youTubeId,
    useLocalHTML: true,
    playerVars: {
      'playsinline': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  });
}
function onPlayerError(event) {
  unembeddableSongs.push({
    playlistName: currentPlaylist.name,
    song: currentSong
  });
  incSong();
}
function onPlayerReady(event) {
  console.log('onPlayerReady()');
  event.target.playVideo();
}
function onPlayerStateChange(event) {
  console.log("onPlayerStateChange() event.data: " + event.data);
  let playerStatus = event.data;
  let color;
  if (playerStatus == -1) {
    // VIDEO UNSTARTED
    color = "#37474F";
    console.log("Video unstarted");
  } else if (playerStatus == 0) {
    // THE VIDEO HAS COMPLETED PLAYING
    color = "#FFFF00";
    console.log("Video ended");
  } else if (playerStatus == 1) {
    // THE VIDEO IS PLAYING
    color = "#33691E";
    console.log("Video playing");
    incSong();
  } else if (playerStatus == 2) {
    // THE VIDEO IS PAUSED
    color = "#DD2C00";
    console.log("Video paused");
  } else if (playerStatus == 3) {
    // THE VIDEO IS BUFFERING
    color = "#AA00FF";
    console.log("Video buffering");
  } else if (playerStatus == 5) {
    // THE VIDEO HAS BEEN CUED
    color = "#FF6DOO";
    console.log("Video cued");
  }
  if (color) {
    document.getElementById('youtube_test_player').style.borderColor = color;
  }
}
function stopVideo() {
  console.log("stopVideo()");
  player.stopVideo();
}

function loadCurrentSongDetails() {
  // UPDATE THE PLAYER
  currentSongLabel.textContent = currentSong.title + " by " + currentSong.artist + " (" + currentSong.year + ")";
  currentPlaylistLabel.textContent = currentPlaylist.name + "(" + currentPlaylist.ownerEmail + ")";
}

function loadCurrentSong() {
  loadCurrentSongDetails();
  player.loadVideoById(currentSong.youTubeId);
}

function incSong() {
  currentSongIndex++;
  if (currentSongIndex == currentPlaylist.songs.length) {
    currentPlaylistIndex++;
    currentSongIndex = 0;
  }
  // ARE WE DONE?
  if (currentPlaylistIndex == playlisterData.playlists.length) {
    saveUnembeddableSongs();
  }
  else {
    currentPlaylist = playlisterData.playlists[currentPlaylistIndex];
    currentSong = currentPlaylist.songs[currentSongIndex];
    loadCurrentSong();
  }
}

function saveUnembeddableSongs() {
  console.log("saveUnembeddableSongs");
  fetch('http://localhost:4000/saveData', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unembeddableSongs)
  });
}

function initHandler() {
  document.getElementById("next-song-button").addEventListener('click', () => {
    incSong();
  });
}

// THESE ARE THE ORIGINAL PLAYLISTS
const playlisterData = loadJSONSync('data/PlaylisterData.json');
let currentPlaylistIndex = 0;
let currentPlaylist = playlisterData.playlists[currentPlaylistIndex];
let currentSongIndex = 0;
let currentSong = currentPlaylist.songs[currentSongIndex];

// THESE ARE THE CONTROLS THE USER WILL INTERACT WITH
let currentSongLabel = document.getElementById("current-song-label");
let currentPlaylistLabel = document.getElementById("current-playlist-label");

// THIS IS FOR KEEPING TRACK OF THE SONGS THAT ARE NOT EMBEDDABLE
let unembeddableSongs = [];

// THIS IS THE YOUTUBE PLAYER
let player;

// SET EVERYTHING UP
initHandler();
loadCurrentSongDetails();
initPlayer();
