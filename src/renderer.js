document.addEventListener('DOMContentLoaded', () => {
  const selectMusicButton = document.getElementById('selectMusic');
  const selectLyricsButton = document.getElementById('selectLyrics');
  const audioPlayer = document.getElementById('audioPlayer');
  const lyricsDiv = document.getElementById('lyrics');

  let audioFilePath = '';
  let lyrics = [];
  let songTitle = '';
  let artistName = '';

  selectMusicButton.addEventListener('click', async () => {
    audioFilePath = await window.electron.selectMusicFile();
    if (audioFilePath) {
      audioPlayer.src = audioFilePath;
      songTitle = prompt('Enter song title:');
      artistName = prompt('Enter artist name:');
    }
  });

  selectLyricsButton.addEventListener('click', async () => {
    const filePath = await window.electron.selectLyricsFile();
    if (filePath) {
      fetchLyricsFromFile(filePath);
    }
  });

  audioPlayer.addEventListener('timeupdate', () => {
    updateLyrics(audioPlayer.currentTime, lyrics);
  });

  function fetchLyricsFromFile(filePath) {
    fetch(`file://${filePath}`)
      .then(response => response.text())
      .then(data => {
        lyrics = parseLRC(data);
      });
  }

  function parseLRC(data) {
    const lines = data.split('\n');
    const parsedLyrics = [];
    lines.forEach(line => {
      const text = line.trim();
      if (text) {
        // Assume each line in LRC is formatted as [mm:ss.xx] lyrics
        const timeMatch = text.match(/\[(\d{2}):(\d{2}\.\d{2})\]/);
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1], 10);
          const seconds = parseFloat(timeMatch[2]);
          const time = minutes * 60 + seconds;
          const lyricText = text.replace(/\[\d{2}:\d{2}\.\d{2}\]/, '').trim();
          parsedLyrics.push({ time, text: lyricText });
        }
      }
    });
    return parsedLyrics;
  }

  function updateLyrics(currentTime, lyrics) {
    const currentLyric = lyrics.find((lyric, index) => {
      const nextLyric = lyrics[index + 1];
      return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
    });

    if (currentLyric) {
      lyricsDiv.innerText = currentLyric.text;
    }
  }
});
