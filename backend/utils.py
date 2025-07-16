import json
import calendar
from datetime import datetime, timedelta

from backend.local_festivals import IndianFestivals


def _get_raw_upcoming_festivals():
    """
    Fetches raw festival data from the library, handling the year-end case.
    Returns a list of festival dictionaries.
    """
    today = datetime.now()
    all_festivals = []

    # Fetch for the current year and the next to handle the year-end boundary smoothly
    for year_offset in range(2):
        year_to_fetch = today.year + year_offset
        try:
            fest_finder = IndianFestivals(str(year_to_fetch))
            # The library can return a string or a dict, so handle both cases
            festivals_str = fest_finder.get_festivals_in_a_year()
            festivals_by_month = json.loads(festivals_str) if isinstance(festivals_str, str) else festivals_str
            
            month_map = {name: num for num, name in enumerate(calendar.month_name) if num}

            for month_name, festivals in festivals_by_month.items():
                month_number = month_map.get(month_name)
                if not month_number:
                    continue

                for festival in festivals:
                    try:
                        festival_date = datetime(year_to_fetch, month_number, int(festival['date']))
                        all_festivals.append({"name": festival.get('name', 'Unknown Festival'), "date": festival_date})
                    except (ValueError, KeyError, TypeError):
                        continue # Ignore malformed festival entries
        except Exception as e:
            print(f"Warning: Could not fetch or parse festival data for year {year_to_fetch}. Error: {e}")
            continue
    
    # Filter for festivals in the next 90 days and sort them
    upcoming = [f for f in all_festivals if today <= f["date"] <= today + timedelta(days=90)]
    upcoming.sort(key=lambda x: x['date'])
    return upcoming

def get_upcoming_festivals_for_prompt():
    """Formats upcoming festivals as a comma-separated string for the planner's AI prompt."""
    upcoming_festivals = _get_raw_upcoming_festivals()
    if not upcoming_festivals:
        return "No major festivals in the next few months."
    
    # Return up to 15 festivals for the prompt
    return ", ".join([f"{f['name']} ({f['date'].strftime('%Y-%m-%d')})" for f in upcoming_festivals[:15]])

def get_upcoming_festivals_for_chat():
    """Formats upcoming festivals as a newline-separated string for the chat's context."""
    upcoming_festivals = _get_raw_upcoming_festivals()
    if not upcoming_festivals:
        return "No major festivals in the next 90 days."

    return "\n".join([f"- {f['name']} on {f['date'].strftime('%B %d, %Y')}" for f in upcoming_festivals]) 
