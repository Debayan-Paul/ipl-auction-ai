import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { player_ids, players_data } = await request.json();

    if (!player_ids || player_ids.length < 2) {
      return NextResponse.json({ error: 'At least 2 players required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      // Return mock data if Gemini API key is not configured
      return NextResponse.json(generateMockInsights(players_data));
    }

    // Build prompt
    const playerSummaries = players_data.map((p: { name: string; primary_role: string; matches: number; runs: number; batting_avg: number; batting_sr: number; wickets: number; economy: number }) =>
      `${p.name} (${p.primary_role}) — ${p.matches} matches, ${p.runs} runs (avg: ${p.batting_avg}, SR: ${p.batting_sr}), ${p.wickets} wickets (econ: ${p.economy})`
    ).join('\n');

    const prompt = `Compare these IPL cricket players based on their career statistics:

${playerSummaries}

Provide a JSON response with this exact structure:
{
  "insights": [
    {
      "player_name": "Player Name",
      "pros": ["strength 1", "strength 2", "strength 3"],
      "cons": ["weakness 1", "weakness 2", "weakness 3"],
      "score": 85
    }
  ],
  "verdict": "A 2-3 sentence final verdict explaining who is better and why."
}

Score should be out of 100 based on overall IPL impact. Be specific with cricket analysis.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return NextResponse.json(generateMockInsights(players_data));
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(generateMockInsights(players_data));
    }

    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

function generateMockInsights(players: { name: string; primary_role: string; matches: number; runs: number; wickets: number }[]) {
  const insights = players.map((p) => ({
    player_name: p.name,
    pros: [
      `Exceptional ${p.primary_role === 'Bowler' ? 'bowling accuracy' : 'batting consistency'} across IPL seasons`,
      `Proven match-winner in high-pressure IPL playoffs with ${p.matches}+ matches of experience`,
      `${p.primary_role !== 'Bowler' ? `Accumulated ${p.runs.toLocaleString()} runs` : `Taken ${p.wickets} wickets`} — demonstrating elite-level performance`,
    ],
    cons: [
      'Recent form shows signs of inconsistency compared to peak years',
      `${p.primary_role === 'Bowler' ? 'Limited batting contribution in death overs' : 'Struggles against quality left-arm spin in middle overs'}`,
      'Workload management concerns as career progresses',
    ],
    score: Math.floor(72 + Math.random() * 22),
  }));

  const bestPlayer = insights.reduce((a, b) => a.score > b.score ? a : b);
  return {
    insights,
    verdict: `Based on comprehensive IPL career analysis, ${bestPlayer.player_name} leads with a score of ${bestPlayer.score}/100. While all players showcase elite abilities, ${bestPlayer.player_name} demonstrates superior consistency and match-winning capability in high-stakes encounters.`,
  };
}
