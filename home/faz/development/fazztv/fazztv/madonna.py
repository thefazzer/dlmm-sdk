import json
import os
import tempfile
import subprocess
import logging
from pytube import YouTube
from loguru import logger

# Remove the hardcoded MADONNA_SONGS and WAR_DOCUMENTARIES lists

def load_madonna_war_data():
    """Load Madonna and war documentary data from JSON file."""
    json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'madonna_war_data.json')
    
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
        logger.info(f"Loaded {len(data)} Madonna-War pairs from JSON")
        return data
    except Exception as e:
        logger.error(f"Error loading JSON data: {str(e)}")
        return []

def create_media_item(item):
    """Create a media item combining a Madonna song with war footage."""
    logger.info(f"Creating media item for '{item['song_title']}' with '{item['war_title']}'")
    
    try:
        # Download audio from Madonna song
        audio_path = download_audio_only(item['song_url'])
        if not audio_path:
            logger.error(f"Failed to download audio for {item['song_title']}")
            return None
            
        # Download video for war footage
        if item['war_url']:
            video_path = download_video_only(item['war_url'])
        else:
            # Use a default video if war_url is None
            video_path = download_video_only("https://www.youtube.com/watch?v=8a8fqGpHgsk")
            
        if not video_path:
            logger.error(f"Failed to download video for {item['war_title']}")
            return None
        
        # Create title and byline
        title = f"{item['song_title']} ({item['song_year']}) - {item['war_date']}"
        byline = item['war_title']
        commentary = item['commentary']
        
        # Create output path in parent directory
        parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_filename = f"{item['song_title'].replace(' ', '_')}_{item['war_title'].replace(' ', '_')[:30]}.mp4"
        output_path = os.path.join(parent_dir, output_filename)
        
        # Combine audio and video
        result_path = combine_audio_video(
            audio_path, 
            video_path, 
            output_path=output_path,
            title=title,
            byline=byline,
            commentary=commentary
        )
        
        if result_path:
            logger.info(f"Successfully created media item: {result_path}")
            return result_path
        else:
            logger.error(f"Failed to combine audio and video for {item['song_title']} + {item['war_title']}")
            return None
    except Exception as e:
        logger.error(f"Error in create_media_item: {str(e)}")
        return None

def main():
    """Main function to create Madonna Military History FazzTV broadcast."""
    logger.info("=== Starting Madonna Military History FazzTV broadcast ===")
    
    # Load data from JSON
    madonna_war_data = load_madonna_war_data()
    
    if not madonna_war_data:
        logger.error("No data loaded. Exiting.")
        return
    
    # Create a list to store all created media items
    created_items = []
    
    # Process each item
    for item in madonna_war_data:
        media_item = create_media_item(item)
        if media_item:
            created_items.append(media_item)
    
    # Report results
    logger.info(f"=== Completed Madonna Military History FazzTV broadcast ===")
    logger.info(f"Created {len(created_items)} media items:")
    for item in created_items:
        logger.info(f"  - {item}")
    
    return created_items

# The rest of your functions (download_audio_only, download_video_only, combine_audio_video) remain unchanged