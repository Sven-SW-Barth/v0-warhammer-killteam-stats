import os
from datetime import datetime, timedelta
import random

# Import Supabase client
from supabase import create_client

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)

print("[v0] Starting mock data insertion...")

# First, let's check what reference data exists
print("[v0] Checking reference data...")

countries = supabase.table("countries").select("*").execute()
print(f"[v0] Found {len(countries.data)} countries")

killzones = supabase.table("killzones").select("*").execute()
print(f"[v0] Found {len(killzones.data)} killzones")

critops = supabase.table("critops").select("*").execute()
print(f"[v0] Found {len(critops.data)} critops")

tacops = supabase.table("tacops").select("*").execute()
print(f"[v0] Found {len(tacops.data)} tacops")

killteams = supabase.table("killteams").select("*").execute()
print(f"[v0] Found {len(killteams.data)} killteams")

if not all([countries.data, killzones.data, critops.data, tacops.data, killteams.data]):
    print("[v0] WARNING: Some reference data is missing, but continuing anyway")

# Select specific killteams to use (only 5 to ensure each appears 3+ times)
target_killteams = ["Phobos Strike Team", "Kommandos", "Pathfinders", "Legionary", "Kasrkin"]
selected_killteams = [kt for kt in killteams.data if kt["name"] in target_killteams]

if len(selected_killteams) < 5:
    print(f"[v0] WARNING: Only found {len(selected_killteams)} of the target killteams")
    # Use any available killteams if targets not found
    selected_killteams = killteams.data[:5]

print(f"[v0] Using killteams: {[kt['name'] for kt in selected_killteams]}")

# Create players
player_names = [
    "ShadowHunter", "IronFist", "StormBringer", "NightStalker",
    "BloodRaven", "SteelWolf", "ThunderStrike", "DarkReaper"
]

print("[v0] Creating players...")
players = []
for name in player_names:
    # Check if player exists
    existing = supabase.table("players").select("*").eq("playertag", name).execute()
    if existing.data:
        players.append(existing.data[0])
        print(f"[v0] Player {name} already exists")
    else:
        result = supabase.table("players").insert({"playertag": name}).execute()
        players.append(result.data[0])
        print(f"[v0] Created player {name}")

print(f"[v0] Total players: {len(players)}")

# Helper function to calculate primary op score
def calc_primary_score(primary_op, tacop_score, critop_score, killop_score):
    if primary_op == "TacOp":
        return (tacop_score + 1) // 2  # Round up
    elif primary_op == "CritOp":
        return (critop_score + 1) // 2
    elif primary_op == "KillOp":
        return (killop_score + 1) // 2
    return 0

# Create games
print("[v0] Creating games...")
games_created = 0
primary_ops = ["TacOp", "CritOp", "KillOp"]

# Create 20 games to ensure each killteam appears at least 3 times
for i in range(20):
    try:
        # Select random data
        country = random.choice(countries.data)
        killzone = random.choice(killzones.data)
        critop = random.choice(critops.data)
        
        # Map layout - 50% chance of being null (optional)
        map_layout = random.choice(["1", "2", "3", "4", "5", "6", None, None])
        
        # Select two different players
        player1, player2 = random.sample(players, 2)
        
        # Select killteams - cycle through to ensure even distribution
        killteam1 = selected_killteams[i % len(selected_killteams)]
        killteam2 = selected_killteams[(i + 1) % len(selected_killteams)]
        
        # Select tacops
        tacop1 = random.choice(tacops.data)
        tacop2 = random.choice(tacops.data)
        
        # Generate scores (0-6)
        p1_tacop = random.randint(0, 6)
        p1_critop = random.randint(0, 6)
        p1_killop = random.randint(0, 6)
        
        p2_tacop = random.randint(0, 6)
        p2_critop = random.randint(0, 6)
        p2_killop = random.randint(0, 6)
        
        # Select primary ops
        p1_primary = random.choice(primary_ops)
        p2_primary = random.choice(primary_ops)
        
        # Calculate primary op scores
        p1_primary_score = calc_primary_score(p1_primary, p1_tacop, p1_critop, p1_killop)
        p2_primary_score = calc_primary_score(p2_primary, p2_tacop, p2_critop, p2_killop)
        
        # Create game with date in the past (last 2 weeks)
        days_ago = random.randint(0, 14)
        created_at = (datetime.now() - timedelta(days=days_ago)).isoformat()
        
        game_data = {
            "country_id": country["id"],
            "killzone_id": killzone["id"],
            "map_layout": map_layout,
            "critop_id": critop["id"],
            "player1_id": player1["id"],
            "player1_killteam_id": killteam1["id"],
            "player1_tacop_id": tacop1["id"],
            "player1_tacop_score": p1_tacop,
            "player1_critop_score": p1_critop,
            "player1_killop_score": p1_killop,
            "player1_primary_op": p1_primary,
            "player1_primary_op_score": p1_primary_score,
            "player2_id": player2["id"],
            "player2_killteam_id": killteam2["id"],
            "player2_tacop_id": tacop2["id"],
            "player2_tacop_score": p2_tacop,
            "player2_critop_score": p2_critop,
            "player2_killop_score": p2_killop,
            "player2_primary_op": p2_primary,
            "player2_primary_op_score": p2_primary_score,
            "created_at": created_at
        }
        
        result = supabase.table("games").insert(game_data).execute()
        games_created += 1
        
        p1_total = p1_tacop + p1_critop + p1_killop + p1_primary_score
        p2_total = p2_tacop + p2_critop + p2_killop + p2_primary_score
        
        print(f"[v0] Game {games_created}: {player1['playertag']} ({killteam1['name']}) {p1_total} vs {p2_total} {player2['playertag']} ({killteam2['name']})")
        
    except Exception as e:
        print(f"[v0] ERROR creating game {i+1}: {str(e)}")

print(f"[v0] Successfully created {games_created} games!")
print("[v0] Mock data insertion complete!")
