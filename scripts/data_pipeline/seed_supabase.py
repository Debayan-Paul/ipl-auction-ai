import os
import uuid
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# Robustly find .env.local
script_dir = os.path.dirname(os.path.abspath(__file__))
env_candidates = [
    os.path.join(script_dir, '..', '..', '.env.local'),
    os.path.join(os.getcwd(), 'ipl-auction', '.env.local'),
    os.path.join(os.getcwd(), '.env.local')
]

loaded = False
for env_path in env_candidates:
    if os.path.exists(env_path):
        load_dotenv(os.path.abspath(env_path))
        print(f"[INFO] Loaded environment from: {os.path.abspath(env_path)}")
        loaded = True
        break

if not loaded:
    load_dotenv('.env.local')

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("[ERROR] Missing Supabase credentials in .env.local")
    exit(1)

supabase: Client = create_client(url, key)

DATA_DIR = r"a:\AI AUTOMATED IPL AUCTION\data\IPL data"
OTHERS_DIR = r"a:\AI AUTOMATED IPL AUCTION\data\Others"

def parse_dob(dob_val):
    if pd.isna(dob_val):
        return None
    dob_str = str(dob_val).strip()
    try:
        dt = pd.to_datetime(dob_str, format='%d-%b-%y')
        if dt.year > 2025:
            dt = dt.replace(year=dt.year - 100)
        return dt.strftime('%Y-%m-%d')
    except Exception:
        try:
            dt = pd.to_datetime(dob_str)
            if dt.year > 2025:
                dt = dt.replace(year=dt.year - 100)
            return dt.strftime('%Y-%m-%d')
        except Exception:
            return None

def seed_database():
    print("[INFO] Loading player datasets and historical statistics...")
    player_path = os.path.join(DATA_DIR, "Player.csv")
    auction_path = os.path.join(DATA_DIR, "IPLPlayerAuctionData.csv")
    stats_path = os.path.join(OTHERS_DIR, "IPL Player Stat.csv")
    
    if not os.path.exists(player_path):
        print(f"[ERROR] Could not find {player_path}")
        return
        
    df_players = pd.read_csv(player_path)
    if 'Is_Umpire' in df_players.columns:
        df_players = df_players[df_players['Is_Umpire'] != 1]
    
    # Load detailed player statistics for role inference and season stats
    stats_lookup = {}
    if os.path.exists(stats_path):
        try:
            df_stats = pd.read_csv(stats_path)
            for _, srow in df_stats.iterrows():
                pname = str(srow.get('player', '')).strip().lower()
                if pname:
                    stats_lookup[pname] = srow
            print(f"[INFO] Loaded {len(stats_lookup)} player performance profiles.")
        except Exception as e:
            print(f"[WARNING] Could not parse statistics file: {e}")

    # Load auction metadata
    auction_role_map = {}
    auction_price_map = {}
    if os.path.exists(auction_path):
        try:
            df_auc = pd.read_csv(auction_path)
            role_norm = {
                'batsman': 'Batsman',
                'bowler': 'Bowler',
                'all-rounder': 'All-Rounder',
                'all rounder': 'All-Rounder',
                'wicket keeper': 'Wicket-Keeper',
                'wicket-keeper': 'Wicket-Keeper'
            }
            for _, arow in df_auc.iterrows():
                pname = str(arow.get('Player', '')).strip().lower()
                arole = str(arow.get('Role', '')).strip().lower()
                aamt = arow.get('Amount', 0)
                if pname and arole in role_norm:
                    auction_role_map[pname] = role_norm[arole]
                if pname and pd.notna(aamt) and aamt > 0:
                    auction_price_map[pname] = round(float(aamt) / 10000000.0, 2)
        except Exception as e:
            print(f"[WARNING] Could not parse auction metadata: {e}")

    player_records = []
    season_stat_records = []
    seen_slugs = set()
    
    for _, row in df_players.iterrows():
        try:
            raw_id = row.get('Player_Id')
            name = str(row.get('Player_Name', '')).strip()
            if not name or pd.isna(raw_id):
                continue
            
            player_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"ipl-player-{raw_id}"))
            
            # Slug
            base_slug = name.lower().replace(' ', '-').replace('.', '').replace("'", "")
            slug = base_slug
            counter = 1
            while slug in seen_slugs:
                slug = f"{base_slug}-{counter}"
                counter += 1
            seen_slugs.add(slug)
            
            country = str(row.get('Country', 'India')).strip()
            origin = 'Indian' if country.lower() == 'india' else 'Overseas'
            
            batting_raw = str(row.get('Batting_Hand', 'Right_Hand')).strip()
            batting_hand = 'Left' if 'left' in batting_raw.lower() else 'Right'
            
            bowling_skill = None
            if pd.notna(row.get('Bowling_Skill')):
                bowling_skill = str(row.get('Bowling_Skill')).strip()
            
            # Intelligent Role Determination
            name_lower = name.lower()
            pstat = stats_lookup.get(name_lower)
            
            if name_lower in auction_role_map:
                primary_role = auction_role_map[name_lower]
            elif pstat is not None:
                p_runs = float(pstat.get('runs', 0)) if pd.notna(pstat.get('runs')) else 0
                p_wkts = float(pstat.get('wickets', 0)) if pd.notna(pstat.get('wickets')) else 0
                p_stump = float(pstat.get('stumpings', 0)) if pd.notna(pstat.get('stumpings')) else 0
                
                if p_stump > 0:
                    primary_role = 'Wicket-Keeper'
                elif p_runs >= 250 and p_wkts < 8:
                    primary_role = 'Batsman'
                elif p_wkts >= 15 and p_runs < 150:
                    primary_role = 'Bowler'
                elif p_runs >= 150 and p_wkts >= 8:
                    primary_role = 'All-Rounder'
                elif p_runs > p_wkts * 20:
                    primary_role = 'Batsman'
                else:
                    primary_role = 'Bowler'
            else:
                if bowling_skill and bowling_skill.lower() not in ('none', 'nan', ''):
                    primary_role = 'All-Rounder'
                else:
                    primary_role = 'Batsman'
                
            base_price = auction_price_map.get(name_lower, 0.50)
            dob = parse_dob(row.get('DOB'))
            
            player_records.append({
                "id": player_uuid,
                "name": name,
                "slug": slug,
                "country": country,
                "date_of_birth": dob,
                "batting_hand": batting_hand,
                "bowling_skill": bowling_skill,
                "primary_role": primary_role,
                "origin": origin,
                "base_price": base_price,
                "is_active": True,
                "data_source": "scraped"
            })
            
            # Build season stats record if available
            if pstat is not None:
                runs = int(pstat.get('runs', 0)) if pd.notna(pstat.get('runs')) else 0
                balls = int(pstat.get('balls_faced', 0)) if pd.notna(pstat.get('balls_faced')) else 0
                wkts = int(pstat.get('wickets', 0)) if pd.notna(pstat.get('wickets')) else 0
                matches = int(pstat.get('matches', 0)) if pd.notna(pstat.get('matches')) else 0
                b_avg = round(float(pstat.get('batting_avg', 0)), 2) if pd.notna(pstat.get('batting_avg')) else None
                b_sr = round(float(pstat.get('batting_strike_rate', 0)), 2) if pd.notna(pstat.get('batting_strike_rate')) else None
                bow_avg = round(float(pstat.get('bowling_avg', 0)), 2) if pd.notna(pstat.get('bowling_avg')) else None
                bow_eco = round(float(pstat.get('economy', 0)), 2) if pd.notna(pstat.get('economy')) else None
                bow_sr = round(float(pstat.get('bowling_strike_rate', 0)), 2) if pd.notna(pstat.get('bowling_strike_rate')) else None
                catches = int(pstat.get('catches', 0)) if pd.notna(pstat.get('catches')) else 0
                stumpings = int(pstat.get('stumpings', 0)) if pd.notna(pstat.get('stumpings')) else 0
                
                # Balls bowled to overs
                balls_bowled = int(pstat.get('balls_bowled', 0)) if pd.notna(pstat.get('balls_bowled')) else 0
                overs = float(balls_bowled // 6) + float(balls_bowled % 6) / 10.0
                
                stat_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"stat-{player_uuid}-2024"))
                
                season_stat_records.append({
                    "id": stat_uuid,
                    "player_id": player_uuid,
                    "season_year": 2024,
                    "matches": matches,
                    "runs": runs,
                    "balls_faced": balls,
                    "batting_average": b_avg,
                    "batting_strike_rate": b_sr,
                    "overs_bowled": overs,
                    "wickets": wkts,
                    "bowling_average": bow_avg,
                    "economy_rate": bow_eco,
                    "bowling_strike_rate": bow_sr,
                    "catches": catches,
                    "stumpings": stumpings
                })

        except Exception as e:
            print(f"[WARNING] Skipping row: {e}")
            continue

    print(f"[INFO] Prepared {len(player_records)} players and {len(season_stat_records)} season stat records.")
    
    # 1. Upsert players in batches of 50
    batch_size = 50
    success_players = 0
    for i in range(0, len(player_records), batch_size):
        batch = player_records[i:i+batch_size]
        try:
            supabase.table('players').upsert(batch).execute()
            success_players += len(batch)
            print(f"[SUCCESS] Upserted player batch {i//batch_size + 1} ({len(batch)} players)")
        except Exception as e:
            print(f"[ERROR] Player batch {i//batch_size + 1} failed: {e}")

    # 2. Upsert season stats in batches of 50
    success_stats = 0
    for i in range(0, len(season_stat_records), batch_size):
        batch = season_stat_records[i:i+batch_size]
        try:
            supabase.table('player_season_stats').upsert(batch).execute()
            success_stats += len(batch)
            print(f"[SUCCESS] Upserted stats batch {i//batch_size + 1} ({len(batch)} stats)")
        except Exception as e:
            print(f"[ERROR] Stats batch {i//batch_size + 1} failed: {e}")

    print(f"[SUCCESS] Finished seeding. Ingested {success_players} players and {success_stats} season stats.")

if __name__ == "__main__":
    seed_database()
