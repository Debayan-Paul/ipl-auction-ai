'use client';

export default function PredictionsPage() {
  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>🤖 AI Predictions</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          XGBoost-powered performance predictions for the upcoming IPL season.
        </p>
      </div>

      {/* Prediction Controls */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Prediction Year</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-heading)', fontWeight: 'var(--weight-bold)' }}>IPL 2027</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-ghost btn-sm">All Players</button>
            <button className="btn btn-primary btn-sm">Batsmen</button>
            <button className="btn btn-ghost btn-sm">Bowlers</button>
            <button className="btn btn-ghost btn-sm">All-Rounders</button>
          </div>
        </div>
      </div>

      {/* Prediction Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
        {[
          { name: 'Virat Kohli', role: 'Batsman', predRuns: 542, predAvg: 39.2, predSR: 137.8, confidence: 87, trend: 'up' },
          { name: 'Jasprit Bumrah', role: 'Bowler', predWickets: 22, predEconomy: 7.12, predBowlAvg: 20.4, confidence: 91, trend: 'up' },
          { name: 'KL Rahul', role: 'Batsman', predRuns: 478, predAvg: 42.1, predSR: 131.5, confidence: 79, trend: 'stable' },
          { name: 'Rashid Khan', role: 'Bowler', predWickets: 18, predEconomy: 6.38, predBowlAvg: 22.1, confidence: 84, trend: 'up' },
          { name: 'Ravindra Jadeja', role: 'All-Rounder', predRuns: 284, predAvg: 28.4, predSR: 132.7, confidence: 76, trend: 'down' },
          { name: 'Rishabh Pant', role: 'Wicket-Keeper', predRuns: 412, predAvg: 35.6, predSR: 152.3, confidence: 82, trend: 'up' },
        ].map((player) => (
          <div key={player.name} className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-full)',
                  background: 'var(--theme-gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'white',
                }}>
                  {player.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--weight-semibold)' }}>{player.name}</div>
                  <span className={`badge badge-${player.role === 'Bowler' ? 'bowling' : player.role === 'All-Rounder' ? 'allround' : player.role === 'Wicket-Keeper' ? 'keeper' : 'batting'}`}>
                    {player.role}
                  </span>
                </div>
              </div>
              <div style={{
                padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)',
                background: player.trend === 'up' ? 'var(--color-success-surface)' : player.trend === 'down' ? 'var(--color-danger-surface)' : 'var(--color-warning-surface)',
                color: player.trend === 'up' ? 'var(--color-success)' : player.trend === 'down' ? 'var(--color-danger)' : 'var(--color-warning)',
              }}>
                {player.trend === 'up' ? '↑ Rising' : player.trend === 'down' ? '↓ Declining' : '→ Stable'}
              </div>
            </div>

            {/* Predicted Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
              {player.role === 'Bowler' ? (
                <>
                  <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-bowling)' }}>{player.predWickets}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Wickets</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-bowling)' }}>{player.predEconomy}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Economy</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-bowling)' }}>{player.predBowlAvg}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Bowl Avg</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-batting)' }}>{player.predRuns}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Runs</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-batting)' }}>{player.predAvg}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Average</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-batting)' }}>{player.predSR}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Strike Rate</div>
                  </div>
                </>
              )}
            </div>

            {/* Confidence Bar */}
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Confidence</span>
                <span style={{ fontWeight: 'var(--weight-semibold)', color: player.confidence >= 85 ? 'var(--color-success)' : player.confidence >= 70 ? 'var(--color-warning)' : 'var(--color-danger)' }}>{player.confidence}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${player.confidence}%`,
                  background: player.confidence >= 85 ? 'var(--color-success)' : player.confidence >= 70 ? 'var(--color-warning)' : 'var(--color-danger)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 1s ease-out',
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
