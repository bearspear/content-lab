# FLAC Player Test Files

This directory contains sample CUE files for testing the FLAC Player's CUE sheet functionality.

---

## Quick Test Setup

### Option 1: Use Your Own Music

If you have any FLAC files:

1. Take ANY FLAC file you have (doesn't matter what it is)
2. Rename it to `sample-album.flac`
3. Place it in this `test-files/` directory alongside `sample-album.cue`
4. Open the FLAC Player at `http://localhost:5001/tools/flac-player`
5. Drag both files (`sample-album.cue` and `sample-album.flac`) onto the drop zone

**Note:** The CUE file will create 5 virtual tracks from your audio file at the timestamps specified.

---

## Option 2: Download Free/Public Domain Audio

### Internet Archive - Free Music Archive

Download high-quality FLAC files from:
- **URL:** https://archive.org/details/audio
- **Search for:** "FLAC" or specific genres
- **Filter by:** Public Domain or Creative Commons

**Example Downloads:**
1. Classical music (often public domain)
2. Jazz recordings
3. Nature sounds
4. Podcasts in FLAC format

### Bandcamp Free Downloads

Many artists offer free FLAC downloads:
- **URL:** https://bandcamp.com/
- Search for "free download" + "FLAC"
- Download any free album in FLAC format

### Jamendo Music

Free music for personal use:
- **URL:** https://www.jamendo.com/
- Filter by FLAC format
- Download any track

---

## Option 3: Create Test Audio

### Using FFmpeg (if installed)

Generate a 20-minute test tone:

```bash
# Navigate to test-files directory
cd /Users/mbehringer/Projects2/ng-md2html/test-files

# Generate a 20-minute FLAC file with test tones
ffmpeg -f lavfi -i "sine=frequency=440:duration=1200" \
  -f lavfi -i "sine=frequency=554:duration=1200" \
  -filter_complex "[0:a][1:a]amerge=inputs=2[out]" \
  -map "[out]" -c:a flac sample-album.flac
```

This creates a 20-minute FLAC file with stereo test tones that you can use with the sample CUE file.

---

## Sample CUE File Breakdown

The provided `sample-album.cue` creates these tracks:

| Track | Title | Start Time | Duration (approx) |
|-------|-------|------------|-------------------|
| 01 | Opening Track | 0:00 | 3:24 |
| 02 | Second Movement | 3:24 | 4:18 |
| 03 | Interlude | 7:42 | 2:33 |
| 04 | Main Theme | 10:15 | 6:12 |
| 05 | Finale | 16:28 | (rest of file) |

**Total Album Length:** Should be at least 16:28 (20 minutes recommended)

---

## Testing Scenarios

### Test 1: Basic Loading
1. Drop `sample-album.cue` + `sample-album.flac`
2. ✅ Should see 5 tracks in playlist
3. ✅ Should show "Sample Artist - Sample Album"
4. ✅ Track durations should be calculated

### Test 2: Playback
1. Click Track 1 → Should start at 0:00
2. Click Track 3 → Should jump to 7:42
3. ✅ Each track should play from correct position

### Test 3: Auto-Advance
1. Play Track 1
2. Wait until ~3:24
3. ✅ Should auto-advance to Track 2

### Test 4: Duration Display
1. Load CUE + FLAC
2. Play any track
3. ✅ Duration should show track length (not full file)

### Test 5: Last Track
1. Play Track 5
2. ✅ Should play from 16:28 to end of file
3. ✅ Duration calculated when audio loads

---

## Alternative CUE Files

### For Shorter Test Audio (5 minutes)

Create `short-test.cue`:

```cue
PERFORMER "Test Artist"
TITLE "Short Test Album"
FILE "short-test.flac" WAVE
  TRACK 01 AUDIO
    TITLE "Track One"
    INDEX 01 00:00:00
  TRACK 02 AUDIO
    TITLE "Track Two"
    INDEX 01 01:30:00
  TRACK 03 AUDIO
    TITLE "Track Three"
    INDEX 01 03:00:00
```

### For Classical Music Test

Create `classical-test.cue`:

```cue
REM GENRE "Classical"
REM DATE "2024"
PERFORMER "Symphony Orchestra"
TITLE "Beethoven - Symphony No. 5"
FILE "symphony.flac" WAVE
  TRACK 01 AUDIO
    TITLE "I. Allegro con brio"
    INDEX 01 00:00:00
  TRACK 02 AUDIO
    TITLE "II. Andante con moto"
    INDEX 01 07:30:15
  TRACK 03 AUDIO
    TITLE "III. Scherzo: Allegro"
    INDEX 01 17:45:33
  TRACK 04 AUDIO
    TITLE "IV. Allegro"
    INDEX 01 23:12:47
```

---

## Quick Start Command

If you have FFmpeg installed, run this one-liner:

```bash
cd /Users/mbehringer/Projects2/ng-md2html/test-files && \
ffmpeg -f lavfi -i "sine=frequency=440:duration=1200" -c:a flac sample-album.flac -y
```

Then test:
1. Go to `http://localhost:5001/tools/flac-player`
2. Drag `sample-album.cue` and `sample-album.flac` together
3. Should see 5 tracks!

---

## Troubleshooting

### "No audio files selected"
- Make sure the FLAC filename matches the CUE file's FILE command
- Currently expected: `sample-album.flac`
- Edit the CUE file's FILE line if your audio has a different name

### "Invalid CUE file"
- Check console for specific validation errors
- Common issues:
  - Missing FILE command
  - Missing track titles
  - Timestamps out of order

### Tracks don't auto-advance
- Make sure audio file is longer than the track timestamps
- Check browser console for errors
- Verify timestamps are in correct format (MM:SS:FF)

---

## Using Your Own CUE Files

If you have existing CUE + FLAC files:

1. **Just drag them both** onto the FLAC Player
2. The player auto-detects CUE files
3. No need to modify filenames

**Supported formats:**
- FLAC (best quality)
- MP3 (widely supported)
- WAV (uncompressed)

---

## Real-World CUE Examples

### Where to Find CUE + FLAC Albums

**1. RuTracker / What.CD Archive**
- Many albums distributed as single FLAC + CUE
- Search: "FLAC CUE" + album name

**2. Redacted / Orpheus**
- Private trackers often have perfect CUE rips
- Download "Log + CUE" versions

**3. Your Own CD Rips**
- Use Exact Audio Copy (EAC) or dBpoweramp
- Rip to single FLAC file with CUE sheet
- Perfect for testing!

---

## File Locations

Place test files here:
```
/Users/mbehringer/Projects2/ng-md2html/test-files/
├── sample-album.cue        (✅ Provided)
├── sample-album.flac       (❌ You provide)
├── short-test.cue          (Optional)
├── short-test.flac         (Optional)
└── README-TEST-FILES.md    (This file)
```

---

## Success Criteria

After loading CUE + FLAC, you should see:

**Console Output:**
```
Loaded 5 tracks from CUE sheet
Album: Sample Album - Test Recording - Sample Artist
```

**Playlist Display:**
```
01. Opening Track        (3:24)
02. Second Movement      (4:18)
03. Interlude           (2:33)
04. Main Theme          (6:12)
05. Finale              (??:??)
```

**Playback:**
- ✅ Each track starts at correct time
- ✅ Auto-advances between tracks
- ✅ Next/Previous buttons work
- ✅ Progress bar shows track duration

---

Happy Testing! 🎵
