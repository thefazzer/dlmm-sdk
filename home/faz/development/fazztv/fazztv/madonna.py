def main():
    """Main function to create Madonna Military History FazzTV broadcast."""
    logger.info("=== Starting Madonna Military History FazzTV broadcast ===")
    
    # Define Madonna songs and war documentaries
    MADONNA_SONGS = [
        "Like a Prayer", 
        "Hung Up", 
        "Justify My Love", 
        "Into the Groove", 
        "Express Yourself", 
        "Vogue"
    ]
    
    WAR_DOCUMENTARIES = [
        "The North African Campaign: Desert Warfare",
        "Pearl Harbor: Day of Infamy",
        "The Battle of the Bulge: Hitler's Last Blood-Soaked Gamble",
        "Battle of Stalingrad: The Turning Point",
        "The Battle of Midway: Turning Point in the Pacific",
        "D-Day: The Allied Invasion of Normandy"
    ]
    
    # Create a list to store all created media items
    created_items = []
    
    # Process each pair
    for i in range(len(MADONNA_SONGS)):
        media_item = create_media_item(MADONNA_SONGS[i], WAR_DOCUMENTARIES[i % len(WAR_DOCUMENTARIES)])
        if media_item:
            created_items.append(media_item)
    
    # Report results
    logger.info(f"=== Completed Madonna Military History FazzTV broadcast ===")
    logger.info(f"Created {len(created_items)} media items:")
    for item in created_items:
        logger.info(f"  - {item}")
    
    return created_items