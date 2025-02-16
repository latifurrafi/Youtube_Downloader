import React, { useState } from 'react';
import { Youtube, Download } from 'lucide-react';

type Format = 'video' | 'audio';

function App() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<Format>('video');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const downloadVideo = async (videoUrl: string, downloadFormat: Format) => {
    try {
      const downloadUrl = `http://localhost:3001/api/download?url=${encodeURIComponent(videoUrl)}&format=${downloadFormat}`;

      // Create an anchor element to trigger the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = ''; // You can specify a filename here if needed
      document.body.appendChild(a);
      a.click(); // Trigger the download
      document.body.removeChild(a); // Clean up the DOM

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setError('Failed to start download');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus('loading');
    setError('');

    try {
      await downloadVideo(url, format);
    } catch (err) {
      setStatus('error');
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Youtube className="w-12 h-12 text-red-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">YouTube Downloader</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Video URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              required
            />
          </div>

          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={() => setFormat('video')}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                format === 'video'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>Video</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('audio')}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                format === 'audio'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>Audio</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || !url}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <span>Processing...</span>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download {format === 'video' ? 'Video' : 'Audio'}</span>
              </>
            )}
          </button>
        </form>

        {status === 'success' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 text-sm">
              Your download should begin automatically. If it doesn't,
              please check your browser's download settings.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This tool allows you to download YouTube videos easily and safely.
            Please ensure you have the rights to download the content.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
