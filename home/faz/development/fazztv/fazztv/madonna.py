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
    
    # Create temporary files for text overlays
    marquee_text_file = tempfile.mktemp(suffix=".txt")
    with open(marquee_text_file, "w") as f:
        f.write(commentary if commentary else "")
    
    byline_text_file = tempfile.mktemp(suffix=".txt")
    with open(byline_text_file, "w") as f:
        f.write(byline if byline else "")
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Rest of the function remains the same