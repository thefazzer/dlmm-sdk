def combine_audio_video(audio_path, video_path, output_path=None, title=None, byline=None, commentary=None):
    """Combine audio and video files with title, byline, and commentary."""
    if output_path is None:
        # Create output in parent directory if not specified
        parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_path = os.path.join(parent_dir, f"madonna_war_{int(time.time())}.mp4")
    
    logger.debug(f"Combining {audio_path} and {video_path} to {output_path}")
    
    # Verify input files exist
    if not os.path.exists(audio_path):
        logger.error(f"Audio file {audio_path} does not exist")
        return None
        
    if not os.path.exists(video_path):
        logger.error(f"Video file {video_path} does not exist")
        return None
        
    # Verify input files have content
    if os.path.getsize(audio_path) == 0:
        logger.error(f"Audio file {audio_path} is empty")
        return None
        
    if os.path.getsize(video_path) == 0:
        logger.error(f"Video file {video_path} is empty")
        return None
    
    # Log file details for debugging
    logger.debug(f"Audio file: {audio_path}, size: {os.path.getsize(audio_path)} bytes")
    logger.debug(f"Video file: {video_path}, size: {os.path.getsize(video_path)} bytes")
    
    # Create temporary files for text overlays
    marquee_text_file = tempfile.mktemp(suffix=".txt")
    with open(marquee_text_file, "w") as f:
        f.write(commentary if commentary else "")
    
    byline_text_file = tempfile.mktemp(suffix=".txt")
    with open(byline_text_file, "w") as f:
        f.write(byline if byline else "")
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Use a simpler FFmpeg command first to test if the audio and video can be combined
    try:
        # First test if we can read the audio file with FFmpeg
        test_cmd = ["ffmpeg", "-y", "-i", audio_path, "-c", "copy", "-t", "1", "-f", "null", "-"]
        subprocess.run(test_cmd, check=True, capture_output=True, text=True)
        logger.debug(f"Audio file {audio_path} is readable by FFmpeg")
    except subprocess.CalledProcessError as e:
        logger.error(f"Audio file {audio_path} is not readable by FFmpeg: {e.stderr}")
        # Try to convert the audio file to a format FFmpeg can read
        try:
            temp_audio = tempfile.mktemp(suffix=".aac")
            convert_cmd = ["ffmpeg", "-y", "-i", audio_path, "-c:a", "aac", "-b:a", "128k", temp_audio]
            subprocess.run(convert_cmd, check=True, capture_output=True, text=True)
            logger.debug(f"Converted audio file to {temp_audio}")
            audio_path = temp_audio
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to convert audio file: {e.stderr}")
            return None
    
    # Construct FFmpeg command
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-f", "lavfi", "-i", f"color=c=black:s=1280x100:d=86400,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf:textfile={marquee_text_file}:fontsize=16:fontcolor=white:y=10:x='1280 - mod(t*40, 1280+text_w)':enable=1",
        "-i", "fztv-logo.png",
        "-filter_complex",
        f"[0:v]scale=640:360,setsar=1[v0];[v0]drawtext=text='{title if title else ''}':fontfile=/usr/share/fonts/truetype/unifont/unifont.ttf:fontsize=24:fontcolor=cyan:bordercolor=green:borderw=2:x=(w-text_w)/2:y=15:enable=1[titled];[titled]drawtext=textfile={byline_text_file}:fontfile=/usr/share/fonts/truetype/unifont/unifont.ttf:fontsize=10:fontcolor=black:bordercolor=green:borderw=1:x=(w-text_w)/2:y=35:enable=1[titledbylined];[2:v]scale=640:100[marq];[titledbylined][marq]overlay=0:360-100[temp];[3:v]scale=100:-1[logosize];[temp][logosize]overlay=10:10[outv]",
        "-map", "[outv]", "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac", "-b:a", "128k",
        "-shortest", "-r", "30", "-vsync", "2",
        "-movflags", "+faststart",
        output_path
    ]
    
    # Run FFmpeg
    logger.debug(f"Running FFmpeg command: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        logger.debug("FFmpeg command completed successfully")
        return output_path
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr}")
        return None
    finally:
        # Clean up temporary files
        for file in [marquee_text_file, byline_text_file]:
            if os.path.exists(file):
                os.remove(file)