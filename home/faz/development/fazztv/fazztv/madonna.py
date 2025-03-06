def download_audio_only(url, output_path=None):
    """Download audio only from a YouTube video."""
    if output_path is None:
        output_path = tempfile.mktemp(suffix=".m4a")  # Use .m4a instead of .aac
    
    logger.debug(f"Downloading audio from {url} to {output_path}")
    
    try:
        yt = YouTube(url)
        audio_stream = yt.streams.filter(only_audio=True).first()
        
        if not audio_stream:
            logger.error(f"No audio stream found for {url}")
            return None
            
        # Download the file
        audio_stream.download(filename=output_path)
        
        # Verify the file exists and has content
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            logger.error(f"Downloaded audio file {output_path} doesn't exist or is empty")
            return None
            
        return output_path
    except Exception as e:
        logger.error(f"Error downloading audio: {str(e)}")
        return None

def download_video_only(url, output_path=None):
    """Download video only from a YouTube video."""
    if output_path is None:
        output_path = tempfile.mktemp(suffix=".mp4")
    
    logger.debug(f"Downloading video from {url} to {output_path}")
    
    try:
        yt = YouTube(url)
        video_stream = yt.streams.filter(only_video=True).first()
        
        if not video_stream:
            logger.error(f"No video stream found for {url}")
            return None
            
        # Download the file
        video_stream.download(filename=output_path)
        
        # Verify the file exists and has content
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            logger.error(f"Downloaded video file {output_path} doesn't exist or is empty")
            return None
            
        return output_path
    except Exception as e:
        logger.error(f"Error downloading video: {str(e)}")
        return None