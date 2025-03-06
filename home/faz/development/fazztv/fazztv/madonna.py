def create_media_item(song_name, war_topic):
    """Create a media item combining a Madonna song with war footage."""
    logger.info(f"Creating media item for '{song_name}' with '{war_topic}'")
    
    # Find the matching data in our hardcoded dataset
    madonna_war_data = get_madonna_war_data()
    item = None
    
    for data_item in madonna_war_data:
        if data_item['song_title'].lower() == song_name.lower():
            item = data_item
            break
    
    if not item:
        # If no exact match, use the first item as fallback
        item = madonna_war_data[0]
        logger.warning(f"No data found for '{song_name}', using '{item['song_title']}' instead")
    
    # Download audio from Madonna song
    audio_path = download_audio_only(item['song_url'])
    if not audio_path:
        logger.error(f"Failed to download audio for {song_name}")
        return None
        
    # Download video for war footage
    if item['war_url']:
        video_path = download_video_only(item['war_url'])
        if not video_path:
            logger.error(f"Failed to download video for {war_topic}")
            return None
    else:
        # Use a default video if war_url is None
        video_path = download_video_only("https://www.youtube.com/watch?v=8a8fqGpHgsk")
        if not video_path:
            logger.error(f"Failed to download default video for {war_topic}")
            return None
    
    # Create title and byline
    title = f"{item['song_title']} ({item['song_year']}) - {item['war_date']}"
    byline = item['war_title']
    
    # Combine audio and video
    output_path = combine_audio_video(
        audio_path, 
        video_path, 
        title=title,
        byline=byline,
        commentary=item['commentary']
    )
    
    if output_path:
        logger.info(f"Successfully created media item: {output_path}")
        return output_path
    else:
        logger.error(f"Failed to combine audio and video for {song_name} + {war_topic}")
        return None