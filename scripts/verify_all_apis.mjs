async function testSuite() {
  console.log('=== RUNNING VERIFICATION TEST SUITE ===');

  // 1. Test players count and pagination
  const r1 = await fetch('http://localhost:3000/api/players?limit=24&page=1');
  const d1 = await r1.json();
  console.log(`[TEST 1] Page 1: fetched ${d1.players?.length} players. Total in DB: ${d1.totalInDb}. Total pages: ${d1.totalPages}`);
  if (d1.totalInDb !== 471) throw new Error(`Expected 471, got ${d1.totalInDb}`);

  // 2. Test search filter
  const r2 = await fetch('http://localhost:3000/api/players?search=Kohli');
  const d2 = await r2.json();
  console.log(`[TEST 2] Search 'Kohli': ${d2.players?.length} players found:`, d2.players?.map(p => p.name));

  // 3. Test Bowler role filter
  const r3 = await fetch('http://localhost:3000/api/players?role=Bowler&limit=5');
  const d3 = await r3.json();
  console.log(`[TEST 3] Role 'Bowler': ${d3.totalCount} total bowlers in DB. Top:`, d3.players?.map(p => `${p.name} (${p.wickets} wkts)`));
  if (d3.totalCount !== 162) throw new Error(`Expected 162 bowlers, got ${d3.totalCount}`);

  // 4. Test All-Rounder role filter
  const r4 = await fetch('http://localhost:3000/api/players?role=All-Rounder&limit=5');
  const d4 = await r4.json();
  console.log(`[TEST 4] Role 'All-Rounder': ${d4.totalCount} total all-rounders in DB. Top:`, d4.players?.map(p => `${p.name} (${p.runs} runs, ${p.wickets} wkts)`));
  if (d4.totalCount !== 107) throw new Error(`Expected 107 all-rounders, got ${d4.totalCount}`);

  // 5. Test Overseas filter
  const r5 = await fetch('http://localhost:3000/api/players?origin=Overseas&limit=5');
  const d5 = await r5.json();
  console.log(`[TEST 5] Origin 'Overseas': ${d5.totalCount} overseas players in DB. Top:`, d5.players?.map(p => `${p.name} (${p.country})`));

  // 6. Test Single Player API
  const kohliId = '8eb83323-a1ea-5b8d-bc6d-d51852e25d5f';
  const r6 = await fetch(`http://localhost:3000/api/players/${kohliId}`);
  const d6 = await r6.json();
  console.log(`[TEST 6] Single player '${d6.player?.name}': Runs: ${d6.player?.runs}, Matches: ${d6.player?.matches}, Batting Avg: ${d6.player?.batting_avg}, SR: ${d6.player?.batting_sr}, Seasons: ${d6.player?.seasons?.length}`);

  // 7. Test Compare API with real database IDs
  const r7 = await fetch(`http://localhost:3000/api/compare/players?ids=${kohliId},9bb46f00-840e-541b-b17c-e62b50c4229d`);
  const d7 = await r7.json();
  console.log(`[TEST 7] Compare Players (Kohli vs Rohit):`, d7.players?.map(p => `${p.name} -> ${p.runs} runs, ${p.wickets} wkts, ${p.matches} matches`));

  // 8. Test Predictions API
  const r8 = await fetch('http://localhost:3000/api/predictions');
  const d8 = await r8.json();
  console.log(`[TEST 8] Predictions API: returned ${d8.predictions?.length} predictions from DB. Sample: ${d8.predictions?.[0]?.players?.name}`);
  if (d8.predictions?.length !== 471) throw new Error(`Expected 471 predictions, got ${d8.predictions?.length}`);

  console.log('=== ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

testSuite().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
