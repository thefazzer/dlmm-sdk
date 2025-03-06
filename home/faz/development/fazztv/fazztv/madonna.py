def get_war_info(war_topic):
    """Get information about a war or military history topic."""
    logger.debug(f"Requesting war info for {war_topic}...")
    
    # Check if API key is available
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("No OpenRouter API key found. Using placeholder war info.")
        return {
            "title": war_topic,
            "year": "Unknown year",
            "description": f"Historical military event: {war_topic}."
        }