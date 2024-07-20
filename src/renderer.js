document.addEventListener('DOMContentLoaded', () => {
    const selectMusicButton = document.getElementById('selectMusic');
    const selectLyricsButton = document.getElementById('selectLyrics');
    const audioPlayer = document.getElementById('audioPlayer');
    const lyricsDiv = document.getElementById('lyrics');
  
    let lyrics = [];
  
    selectMusicButton.addEventListener('click', async () => {
      const filePath = await window.electron.selectMusicFile();
      if (filePath) {
        audioPlayer.src = filePath;
      }
    });
  
    selectLyricsButton.addEventListener('click', async () => {
      const filePath = await window.electron.selectLyricsFile();
      if (filePath) {
        fetchLyrics(filePath);
      }
    });
  
    audioPlayer.addEventListener('timeupdate', () => {
      updateLyrics(audioPlayer.currentTime, lyrics);
    });
  
    function fetchLyrics(filePath) {
      fetch(`file://${filePath}`)
        .then(response => response.text())
        .then(data => {
          lyrics = parseLRC(data);
        });
    }
  
    function parseLRC(data) {
      const lines = data.split('\n');
      const lyrics = [];
      const timeRegex = /\[(\d{2}):(\d{2}\.\d{2})\]/;
  
      lines.forEach(line => {
        const match = timeRegex.exec(line);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseFloat(match[2]);
          const time = minutes * 60 + seconds;
          const text = line.replace(timeRegex, '').trim();
          lyrics.push({ time, text });
        }
      });
  
      return lyrics;
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
  