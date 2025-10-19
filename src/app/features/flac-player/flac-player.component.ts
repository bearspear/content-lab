import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CueParserService } from './services/cue-parser.service';
import { CueData } from './models/cue-data.model';
import { MetadataService } from './services/metadata.service';
import { PlaylistStorageService } from './services/playlist-storage.service';

// Track interface
interface Track {
  filename: string;
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  file?: File;
  url?: string;
  // Metadata properties
  year?: number;
  genre?: string;
  trackNumber?: number;
  albumArt?: string; // Blob URL for album artwork
  bitrate?: number;
  sampleRate?: number;
  codec?: string;
  // CUE-specific properties
  startTime?: number; // Start time in seconds (for CUE-based tracks)
  endTime?: number;   // End time in seconds (for CUE-based tracks)
  isCueTrack?: boolean; // True if this track is from a CUE sheet
}

@Component({
  selector: 'app-flac-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flac-player.component.html',
  styleUrl: './flac-player.component.scss'
})
export class FlacPlayerComponent implements OnInit, OnDestroy {
  // File upload state
  isDragOver = false;

  // Playlist and tracks
  playlist: Track[] = [];
  currentTrackIndex = -1;
  currentTrack: Track | null = null;

  // Audio player state
  private audioElement: HTMLAudioElement | null = null;
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  volume = 70;

  // CUE sheet state
  private currentAudioFile: File | null = null; // The loaded audio file
  private currentCueData: CueData | null = null; // Parsed CUE data

  // Auto-save interval
  private autoSaveInterval: any = null;

  constructor(
    private cueParser: CueParserService,
    private metadata: MetadataService,
    private storage: PlaylistStorageService
  ) {}

  // Computed properties
  get hasAudioLoaded(): boolean {
    return this.currentTrack !== null;
  }

  get progressPercentage(): number {
    if (this.duration === 0) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  ngOnInit(): void {
    // Load saved player state
    const savedState = this.storage.loadPlayerState();
    if (!this.storage.isStateStale(savedState)) {
      this.volume = savedState.volume;
    }

    // Initialize audio element
    this.audioElement = new Audio();
    this.audioElement.volume = this.volume / 100;

    // Set up event listeners
    this.audioElement.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
    this.audioElement.addEventListener('loadedmetadata', this.onLoadedMetadata.bind(this));
    this.audioElement.addEventListener('ended', this.onTrackEnded.bind(this));
    this.audioElement.addEventListener('error', this.onAudioError.bind(this));

    // Auto-save state every 5 seconds
    this.autoSaveInterval = setInterval(() => {
      this.saveCurrentState();
    }, 5000);
  }

  ngOnDestroy(): void {
    // Clear auto-save interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Save final state
    this.saveCurrentState();

    // Clean up audio element
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }

    // Revoke object URLs to free memory
    this.playlist.forEach(track => {
      if (track.url) {
        URL.revokeObjectURL(track.url);
      }
      // Also revoke album art URLs
      if (track.albumArt) {
        this.metadata.revokeAlbumArt(track.albumArt);
      }
    });
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    console.log('💧 onDrop triggered');
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    console.log('📂 Files received:', files?.length || 0);
    if (files) {
      this.handleFiles(Array.from(files));
    } else {
      console.warn('⚠️ No files in drop event');
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
    // Reset input so the same file can be selected again
    input.value = '';
  }

  private async handleFiles(files: File[]): Promise<void> {
    console.log('🔍 handleFiles called with:', files.length, 'files');

    // Separate audio files and CUE files
    const audioFiles = files.filter(file =>
      file.name.toLowerCase().endsWith('.flac') ||
      file.name.toLowerCase().endsWith('.mp3') ||
      file.name.toLowerCase().endsWith('.wav')
    );
    const cueFiles = files.filter(file =>
      file.name.toLowerCase().endsWith('.cue')
    );

    console.log('📁 Audio files:', audioFiles.length, 'CUE files:', cueFiles.length);

    // Check for CUE + audio file combination
    if (cueFiles.length > 0 && audioFiles.length > 0) {
      console.log('📀 Handling CUE sheet...');
      await this.handleCueSheet(cueFiles[0], audioFiles[0]);
      return;
    }

    // No CUE file - handle as individual tracks
    if (audioFiles.length === 0) {
      console.warn('⚠️ No audio files selected');
      return;
    }

    console.log('🎵 Processing', audioFiles.length, 'audio files...');

    // Extract metadata and add files to playlist
    for (const file of audioFiles) {
      try {
        console.log('🔄 Processing file:', file.name);
        // Extract metadata from the audio file
        const metadata = await this.metadata.extractMetadata(file);

        const track: Track = {
          filename: file.name,
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album,
          year: metadata.year,
          genre: metadata.genre,
          trackNumber: metadata.trackNumber,
          albumArt: metadata.albumArt,
          bitrate: metadata.bitrate,
          sampleRate: metadata.sampleRate,
          codec: metadata.codec,
          file: file,
          url: URL.createObjectURL(file),
          isCueTrack: false
        };
        this.playlist.push(track);

        console.log(`✅ Loaded: ${metadata.artist} - ${metadata.title}`);
      } catch (error) {
        console.error('❌ Error loading file:', file.name, error);
      }
    }

    // If no track is currently loaded, load the first one
    if (this.currentTrackIndex === -1 && this.playlist.length > 0) {
      console.log('▶️ Auto-playing first track');
      this.playTrack(0);
    }
  }

  /**
   * Handle CUE sheet + audio file combination
   */
  private async handleCueSheet(cueFile: File, audioFile: File): Promise<void> {
    try {
      // Parse CUE file
      const cueData = await this.cueParser.parse(cueFile);

      // Validate CUE data
      const validation = this.cueParser.validateCueData(cueData);
      if (!validation.valid) {
        console.error('Invalid CUE file:', validation.errors);
        alert('Invalid CUE file:\n' + validation.errors.join('\n'));
        return;
      }

      // Store CUE data and audio file
      this.currentCueData = cueData;
      this.currentAudioFile = audioFile;

      // Create object URL for the audio file (shared by all tracks)
      const audioUrl = URL.createObjectURL(audioFile);

      // Clear existing playlist
      this.playlist = [];

      // Create tracks from CUE data
      cueData.tracks.forEach(cueTrack => {
        const track: Track = {
          filename: `${cueTrack.trackNumber.toString().padStart(2, '0')}. ${cueTrack.title}`,
          title: cueTrack.title || `Track ${cueTrack.trackNumber}`,
          artist: cueTrack.performer || cueData.album.artist || 'Unknown Artist',
          album: cueData.album.title || 'Unknown Album',
          file: audioFile,
          url: audioUrl,
          startTime: cueTrack.startTime,
          endTime: cueTrack.endTime,
          duration: cueTrack.duration,
          isCueTrack: true
        };
        this.playlist.push(track);
      });

      console.log(`Loaded ${this.playlist.length} tracks from CUE sheet`);
      console.log(`Album: ${cueData.album.title} - ${cueData.album.artist}`);

      // Auto-play first track
      if (this.playlist.length > 0) {
        this.playTrack(0);
      }
    } catch (error) {
      console.error('Error loading CUE sheet:', error);
      alert('Failed to load CUE sheet');
    }
  }

  // Playback controls
  playTrack(index: number): void {
    if (index < 0 || index >= this.playlist.length) return;

    this.currentTrackIndex = index;
    this.currentTrack = this.playlist[index];

    if (this.audioElement && this.currentTrack.url) {
      // For CUE-based tracks, we may already have the audio loaded
      const needsReload = this.audioElement.src !== this.currentTrack.url;

      if (needsReload) {
        this.audioElement.src = this.currentTrack.url;
        this.audioElement.load();
      }

      // Wait for metadata to be loaded before seeking
      const playAudio = () => {
        // Seek to track start time for CUE-based tracks
        if (this.currentTrack?.isCueTrack && this.currentTrack.startTime !== undefined) {
          this.audioElement!.currentTime = this.currentTrack.startTime;
        }

        this.audioElement!.play()
          .then(() => {
            this.isPlaying = true;
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            this.isPlaying = false;
          });
      };

      if (needsReload) {
        // Wait for loadedmetadata event
        this.audioElement.addEventListener('loadedmetadata', playAudio, { once: true });
      } else {
        // Audio already loaded, can play immediately
        playAudio();
      }
    }
  }

  togglePlayPause(): void {
    if (!this.audioElement) return;

    if (this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
    } else {
      this.audioElement.play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch(error => {
          console.error('Error playing audio:', error);
        });
    }
  }

  previousTrack(): void {
    if (this.hasPreviousTrack()) {
      this.playTrack(this.currentTrackIndex - 1);
    }
  }

  nextTrack(): void {
    if (this.hasNextTrack()) {
      this.playTrack(this.currentTrackIndex + 1);
    }
  }

  hasPreviousTrack(): boolean {
    return this.currentTrackIndex > 0;
  }

  hasNextTrack(): boolean {
    return this.currentTrackIndex < this.playlist.length - 1;
  }

  seekTo(event: MouseEvent): void {
    if (!this.audioElement) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;

    this.audioElement.currentTime = percentage * this.duration;
  }

  onVolumeChange(): void {
    if (this.audioElement) {
      this.audioElement.volume = this.volume / 100;
    }
    // Save volume immediately
    this.storage.savePlayerState({ volume: this.volume });
  }

  // Audio event handlers
  private onTimeUpdate(): void {
    if (this.audioElement) {
      this.currentTime = this.audioElement.currentTime;

      // For CUE-based tracks, check if we've reached the end time
      if (this.currentTrack?.isCueTrack && this.currentTrack.endTime !== undefined) {
        if (this.currentTime >= this.currentTrack.endTime) {
          // Move to next track
          if (this.hasNextTrack()) {
            this.nextTrack();
          } else {
            // Last track in CUE sheet
            this.audioElement.pause();
            this.isPlaying = false;
          }
        }
      }
    }
  }

  private onLoadedMetadata(): void {
    if (this.audioElement) {
      // For CUE-based tracks, use the track's duration, not the full file duration
      if (this.currentTrack?.isCueTrack && this.currentTrack.duration !== undefined) {
        this.duration = this.currentTrack.duration;
      } else {
        this.duration = this.audioElement.duration;

        // Update track duration in playlist for non-CUE tracks
        if (this.currentTrack) {
          this.currentTrack.duration = this.duration;
        }
      }

      // For CUE tracks with no end time (last track), calculate it now
      if (this.currentTrack?.isCueTrack && this.currentTrack.endTime === undefined) {
        this.currentTrack.endTime = this.audioElement.duration;
        this.currentTrack.duration = this.currentTrack.endTime - (this.currentTrack.startTime || 0);
        this.duration = this.currentTrack.duration;
      }
    }
  }

  private onTrackEnded(): void {
    // Auto-play next track if available
    if (this.hasNextTrack()) {
      this.nextTrack();
    } else {
      this.isPlaying = false;
    }
  }

  private onAudioError(event: Event): void {
    console.error('Audio error:', event);
    this.isPlaying = false;
  }

  // Playlist management methods
  removeTrack(index: number, event?: Event): void {
    // Prevent click event from bubbling to play track
    if (event) {
      event.stopPropagation();
    }

    if (index < 0 || index >= this.playlist.length) return;

    const track = this.playlist[index];

    // Revoke object URLs to free memory
    if (track.url && !track.isCueTrack) {
      URL.revokeObjectURL(track.url);
    }
    if (track.albumArt) {
      this.metadata.revokeAlbumArt(track.albumArt);
    }

    // Remove track from playlist
    this.playlist.splice(index, 1);

    // Handle currently playing track
    if (index === this.currentTrackIndex) {
      // Current track was removed
      if (this.playlist.length === 0) {
        // No more tracks - reset player
        this.stopPlayback();
        this.currentTrackIndex = -1;
        this.currentTrack = null;
      } else {
        // Play next track (same index, since array shifted)
        const newIndex = Math.min(index, this.playlist.length - 1);
        this.playTrack(newIndex);
      }
    } else if (index < this.currentTrackIndex) {
      // Track before current was removed - adjust index
      this.currentTrackIndex--;
    }
  }

  clearPlaylist(): void {
    // Stop playback
    this.stopPlayback();

    // Revoke all object URLs
    this.playlist.forEach(track => {
      if (track.url && !track.isCueTrack) {
        URL.revokeObjectURL(track.url);
      }
      if (track.albumArt) {
        this.metadata.revokeAlbumArt(track.albumArt);
      }
    });

    // Clear playlist
    this.playlist = [];
    this.currentTrackIndex = -1;
    this.currentTrack = null;
  }

  private stopPlayback(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
    }
  }

  // State persistence methods
  private saveCurrentState(): void {
    this.storage.savePlayerState({
      volume: this.volume,
      lastTrackIndex: this.currentTrackIndex,
      lastPosition: this.currentTime
    });
  }

  // Export methods
  exportPlaylistAsM3U(): void {
    if (this.playlist.length === 0) {
      alert('Playlist is empty. Add some tracks first.');
      return;
    }

    // Generate M3U content
    let m3uContent = '#EXTM3U\n';
    m3uContent += `# Generated by Content Lab FLAC Player - ${new Date().toLocaleString()}\n`;
    m3uContent += `# Total tracks: ${this.playlist.length}\n\n`;

    this.playlist.forEach((track) => {
      // Add track info line
      const duration = track.duration ? Math.round(track.duration) : -1;
      const artist = track.artist || 'Unknown Artist';
      const title = track.title || track.filename;
      m3uContent += `#EXTINF:${duration},${artist} - ${title}\n`;

      // Add metadata as comments
      if (track.album) {
        m3uContent += `# Album: ${track.album}\n`;
      }
      if (track.year) {
        m3uContent += `# Year: ${track.year}\n`;
      }
      if (track.genre) {
        m3uContent += `# Genre: ${track.genre}\n`;
      }

      // Add filename (note: this is just the filename, not a full path)
      m3uContent += `${track.filename}\n\n`;
    });

    // Create blob and download
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `playlist-${Date.now()}.m3u`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('📝 Playlist exported as M3U');
  }

  // Utility methods
  formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
