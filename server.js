import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Ensure downloads directory exists (optional, not needed for streaming)
const DOWNLOADS_DIR = path.resolve('./downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR);
}

// API to get video info using yt-dlp
app.get('/api/video-info', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const ytDlpProcess = spawn('yt-dlp', ['--dump-json', url]);

    let jsonOutput = '';
    ytDlpProcess.stdout.on('data', (data) => {
      jsonOutput += data.toString();
    });

    ytDlpProcess.on('close', () => {
      try {
        const info = JSON.parse(jsonOutput);
        res.json({
          title: info.title,
          thumbnail: info.thumbnail,
          duration: info.duration,
          formats: info.formats.map((format) => ({
            quality: format.format_note,
            ext: format.ext,
            itag: format.format_id,
          })),
        });
      } catch (error) {
        console.error('Error parsing yt-dlp output:', error);
        res.status(500).json({ error: 'Failed to fetch video info' });
      }
    });
  } catch (error) {
    console.error('Video info error:', error);
    res.status(500).json({ error: 'Failed to retrieve video info' });
  }
});

// API to stream and download video/audio
app.get('/api/download', async (req, res) => {
  try {
    const { url, format = 'best' } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Prepare the yt-dlp command for streaming
    const ytDlpProcess = spawn('yt-dlp', [
      '-f',
      format === 'audio' ? 'bestaudio' : 'best',
      '-o',
      '-',
      url,
    ]);

    // Set the appropriate content headers
    const filename = `download.${format === 'audio' ? 'mp3' : 'mp4'}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      format === 'audio' ? 'audio/mpeg' : 'video/mp4'
    );

    // Stream the video/audio directly to the user
    ytDlpProcess.stdout.pipe(res);

    ytDlpProcess.on('error', (err) => {
      console.error('yt-dlp error:', err);
      res.status(500).json({ error: 'Error during download' });
    });

    ytDlpProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('yt-dlp process exited with code:', code);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed' });
        }
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Download request failed' });
    }
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
