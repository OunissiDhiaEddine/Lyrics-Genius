document.addEventListener('DOMContentLoaded', () => {
  const selectMusicButton = document.getElementById('selectMusic');
  const selectLyricsButton = document.getElementById('selectLyrics');
  const fetchLyricsButton = document.getElementById('fetchLyrics');
  const audioPlayer = document.getElementById('audioPlayer');
  const lyricsDiv = document.getElementById('lyrics');

  let audioFilePath = '';
  let lyrics = [];

  selectMusicButton.addEventListener('click', async () => {
    console.log('Select Music button clicked');
    try {
      audioFilePath = await window.electron.selectMusicFile();
      console.log('Selected file path:', audioFilePath);
      if (audioFilePath) {
        audioPlayer.src = audioFilePath;
      } else {
        console.log('No file selected');
      }
    } catch (error) {
      console.error('Error selecting music file:', error);
    }
  });

  selectLyricsButton.addEventListener('click', async () => {
    console.log('Select Lyrics button clicked');
    const filePath = await window.electron.selectLyricsFile();
    console.log('Selected lyrics file path:', filePath);
    if (filePath) {
      fetchLyricsFromFile(filePath);
    }
  });

  fetchLyricsButton.addEventListener('click', async () => {
    console.log('Fetch Lyrics button clicked');
    if (audioFilePath) {
      await fetchLyricsFromAPI();
    }
  });

  audioPlayer.addEventListener('timeupdate', () => {
    updateLyrics(audioPlayer.currentTime, lyrics);
  });

  async function fetchLyricsFromAPI() {
    console.log('Fetching lyrics from API');
    const songTitle = 'song title'; // Replace with actual logic to determine song title
    const apiKey = await window.electron.getGeniusApiKey();
    console.log('Using API key:', apiKey);
    console.log('Song title:', songTitle);

    try {
      const searchResponse = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(songTitle)}&access_token=${apiKey}`);
      if (!searchResponse.ok) {
        throw new Error(`Search request failed with status ${searchResponse.status}`);
      }
      const searchData = await searchResponse.json();
      console.log('Search data:', searchData);

      if (searchData.response && searchData.response.hits.length > 0) {
        const songPath = searchData.response.hits[0].result.path;
        console.log('Song path:', songPath);

        const lyricsResponse = await fetch(`https://api.genius.com${songPath}?access_token=${apiKey}`);
        if (!lyricsResponse.ok) {
          throw new Error(`Lyrics request failed with status ${lyricsResponse.status}`);
        }
        const lyricsData = await lyricsResponse.json();
        console.log('Lyrics data:', lyricsData);

        if (lyricsData.response && lyricsData.response.song && lyricsData.response.song.lyrics) {
          const lyricsHtml = lyricsData.response.song.lyrics.plain;
          lyricsDiv.innerText = lyricsHtml;
        } else {
          lyricsDiv.innerText = 'Lyrics not found.';
        }
      } else {
        lyricsDiv.innerText = 'Song not found.';
      }
    } catch (error) {
      console.error('Error fetching lyrics from API:', error);
      lyricsDiv.innerText = `Error fetching lyrics: ${error.message}`;
    }
  }

  function fetchLyricsFromFile(filePath) {
    console.log('Fetching lyrics from file:', filePath);
    fetch(`file://${filePath}`)
      .then(response => response.text())
      .then(data => {
        lyrics = parseLRC(data);
      })
      .catch(error => console.error('Error fetching lyrics from file:', error));
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
