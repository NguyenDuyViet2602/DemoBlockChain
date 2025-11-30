// src/components/VideoPlayer.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaSpinner,
  FaCog,
  FaBackward,
  FaForward,
} from 'react-icons/fa';

const VideoPlayer = ({ videoUrl, title, isYouTube = false, lessonId, onWatchTimeUpdate }) => {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeoutRef = useRef(null);
  const watchTimeUpdateIntervalRef = useRef(null);
  const lastWatchTimeRef = useRef(0);

  // YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (url.includes('watch?v=')) {
      const videoId = url.split('watch?v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
    }
    return url;
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (isYouTube) return; // YouTube controls are handled by iframe
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, isYouTube]);

  // Handle volume
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (isYouTube || !videoRef.current) return;
    
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;
    const newTime = percentage * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.webkitRequestFullscreenElement) {
        container.webkitRequestFullscreenElement();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    }
  }, [isFullscreen]);

  // Handle playback speed
  const handleSpeedChange = useCallback((speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSettings(false);
    }
  }, []);

  // Skip forward/backward
  const skip = useCallback((seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  // Show/hide controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSettings && !e.target.closest('.settings-menu')) {
        setShowSettings(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSettings]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTube) return;

    const handleTimeUpdate = () => {
      const newTime = video.currentTime;
      setCurrentTime(newTime);
      setProgress((newTime / duration) * 100);
      
      // Track watch time (update every 10 seconds)
      if (lessonId && onWatchTimeUpdate) {
        const watchTime = Math.floor(newTime);
        // Only update if watch time increased by at least 10 seconds
        if (watchTime > lastWatchTimeRef.current && watchTime % 10 === 0) {
          lastWatchTimeRef.current = watchTime;
          onWatchTimeUpdate(watchTime);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    };

    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange({ target: { value: Math.min(1, volume + 0.1) } });
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange({ target: { value: Math.max(0, volume - 0.1) } });
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (watchTimeUpdateIntervalRef.current) {
        clearInterval(watchTimeUpdateIntervalRef.current);
      }
    };
  }, [duration, isYouTube, volume, togglePlay, toggleMute, toggleFullscreen, skip, handleVolumeChange, lessonId, onWatchTimeUpdate]);

  // YouTube watch time tracking (simple approach - track when iframe is visible)
  useEffect(() => {
    if (!isYouTube || !lessonId || !onWatchTimeUpdate) return;
    
    let startTime = Date.now();
    let totalWatchTime = 0;
    let isVisible = true;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, pause tracking
        if (isVisible) {
          totalWatchTime += (Date.now() - startTime) / 1000;
          isVisible = false;
        }
      } else {
        // Tab is visible, resume tracking
        if (!isVisible) {
          startTime = Date.now();
          isVisible = true;
        }
      }
    };
    
    // Track every 10 seconds
    const interval = setInterval(() => {
      if (isVisible && !document.hidden) {
        totalWatchTime += 10;
        const watchTimeSeconds = Math.floor(totalWatchTime);
        if (watchTimeSeconds > lastWatchTimeRef.current && watchTimeSeconds % 10 === 0) {
          lastWatchTimeRef.current = watchTimeSeconds;
          onWatchTimeUpdate(watchTimeSeconds);
        }
      }
    }, 10000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isYouTube, lessonId, onWatchTimeUpdate]);

  if (isYouTube) {
    // YouTube video - use iframe với custom wrapper
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    return (
      <div
        ref={playerContainerRef}
        className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
        onMouseMove={handleMouseMove}
      >
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          sandbox="allow-scripts allow-same-origin allow-presentation"
          onError={(e) => {
            // Ignore YouTube CORS errors - they're from YouTube's side, not our code
            // These errors don't affect video playback
            e.preventDefault();
            e.stopPropagation();
          }}
        />
        {/* Custom overlay cho YouTube (optional - có thể ẩn) */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            showControls ? 'opacity-0' : 'opacity-0'
          }`}
        >
          {/* Có thể thêm custom controls overlay cho YouTube nếu cần */}
        </div>
      </div>
    );
  }

  // HTML5 video player với custom controls
  return (
    <div
      ref={playerContainerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setTimeout(() => setShowControls(false), 1000);
        }
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onClick={togglePlay}
        onLoadedData={() => setIsLoading(false)}
      />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <FaSpinner className="text-white text-4xl animate-spin" />
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Center play button */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center group/play"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 group-hover/play:bg-white/30 transition-all">
              <FaPlay className="text-white text-4xl ml-1" />
            </div>
          </button>
        )}

        {/* Bottom controls bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress bar */}
          <div
            className="h-1.5 bg-white/30 rounded-full cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-emerald-500 rounded-full transition-all relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 text-white">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="hover:text-emerald-400 transition-colors"
            >
              {isPlaying ? (
                <FaPause className="text-xl" />
              ) : (
                <FaPlay className="text-xl" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={toggleMute}
                className="hover:text-emerald-400 transition-colors"
              >
                {isMuted ? (
                  <FaVolumeMute className="text-lg" />
                ) : (
                  <FaVolumeUp className="text-lg" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Skip buttons */}
            <button
              onClick={() => skip(-10)}
              className="hover:text-emerald-400 transition-colors"
              title="Lùi 10 giây (←)"
            >
              <FaBackward className="text-lg" />
            </button>
            <button
              onClick={() => skip(10)}
              className="hover:text-emerald-400 transition-colors"
              title="Tới 10 giây (→)"
            >
              <FaForward className="text-lg" />
            </button>

            {/* Time */}
            <span className="text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Settings (Playback speed) */}
            <div className="relative settings-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
                className="hover:text-emerald-400 transition-colors"
                title="Cài đặt"
              >
                <FaCog className="text-lg" />
              </button>
              {showSettings && (
                <div
                  className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[140px] z-50 border border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-xs text-white/80 mb-2 px-2 font-semibold">Tốc độ phát</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`block w-full text-left px-3 py-1.5 text-sm rounded hover:bg-emerald-500/30 transition-colors ${
                        playbackRate === speed
                          ? 'text-emerald-400 font-semibold bg-emerald-500/20'
                          : 'text-white'
                      }`}
                    >
                      {speed === 1 ? 'Bình thường' : `${speed}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="hover:text-emerald-400 transition-colors"
              title="Toàn màn hình (F)"
            >
              {isFullscreen ? (
                <FaCompress className="text-lg" />
              ) : (
                <FaExpand className="text-lg" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

