import { describe, expect, it } from 'vitest'
import { findBestPlayerNameMatch, getPlayerMatchScore } from '../shared/player-name-match'
import { computeLeaderboard } from '../server/scoring/leaderboard.js'
import { scorePositionDistance } from '../server/scoring/rules.js'
import type { NormalizedPrediction, NormalizedStanding, NormalizedTopScorer } from '../server/types.js'

describe('scorePositionDistance', () => {
  it('scores exact and near hits', () => {
    expect(scorePositionDistance(0)).toBe(3)
    expect(scorePositionDistance(1)).toBe(1)
    expect(scorePositionDistance(4)).toBe(0)
  })

  it('does not apply negative penalties for large misses', () => {
    expect(scorePositionDistance(5)).toBe(0)
    expect(scorePositionDistance(6)).toBe(0)
    expect(scorePositionDistance(8)).toBe(0)
  })
})

describe('top scorer matching', () => {
  const scorers = [
    { rank: 1, playerName: 'P. Abraham', teamName: 'Djurgården', goals: 7 },
    { rank: 2, playerName: 'Nahir Besara', teamName: 'Hammarby', goals: 6 },
    { rank: 3, playerName: 'A. Lien', teamName: 'Mjällby', goals: 5 },
  ]

  it('matches surname-only predictions when unambiguous', () => {
    expect(findBestPlayerNameMatch('Abraham', scorers)?.playerName).toBe('P. Abraham')
    expect(findBestPlayerNameMatch('Besara', scorers)?.playerName).toBe('Nahir Besara')
  })

  it('returns rank-based tiebreak scores for matched players', () => {
    expect(getPlayerMatchScore('Abraham', scorers).score).toBe(0)
    expect(getPlayerMatchScore('Besara', scorers).score).toBe(-2)
  })
})

describe('computeLeaderboard', () => {
  const standings: NormalizedStanding[] = [
    { teamName: 'Hammarby', position: 1, played: 10, won: 7, drawn: 2, lost: 1, goalsFor: 20, goalsAgainst: 8, goalDifference: 12, points: 23 },
    { teamName: 'Djurgården', position: 2, played: 10, won: 6, drawn: 2, lost: 2, goalsFor: 18, goalsAgainst: 11, goalDifference: 7, points: 20 },
    { teamName: 'Mjällby', position: 3, played: 10, won: 6, drawn: 1, lost: 3, goalsFor: 16, goalsAgainst: 10, goalDifference: 6, points: 19 },
    { teamName: 'Malmö FF', position: 4, played: 10, won: 5, drawn: 3, lost: 2, goalsFor: 15, goalsAgainst: 9, goalDifference: 6, points: 18 },
    { teamName: 'IFK Göteborg', position: 5, played: 10, won: 5, drawn: 2, lost: 3, goalsFor: 14, goalsAgainst: 10, goalDifference: 4, points: 17 },
    { teamName: 'AIK', position: 6, played: 10, won: 4, drawn: 4, lost: 2, goalsFor: 12, goalsAgainst: 9, goalDifference: 3, points: 16 },
    { teamName: 'Elfsborg', position: 7, played: 10, won: 4, drawn: 3, lost: 3, goalsFor: 13, goalsAgainst: 11, goalDifference: 2, points: 15 },
    { teamName: 'GAIS', position: 8, played: 10, won: 4, drawn: 2, lost: 4, goalsFor: 11, goalsAgainst: 11, goalDifference: 0, points: 14 },
    { teamName: 'Sirius', position: 9, played: 10, won: 3, drawn: 4, lost: 3, goalsFor: 12, goalsAgainst: 13, goalDifference: -1, points: 13 },
    { teamName: 'Häcken', position: 10, played: 10, won: 3, drawn: 3, lost: 4, goalsFor: 11, goalsAgainst: 13, goalDifference: -2, points: 12 },
    { teamName: 'Västerås', position: 11, played: 10, won: 3, drawn: 2, lost: 5, goalsFor: 10, goalsAgainst: 14, goalDifference: -4, points: 11 },
    { teamName: 'Brommapojkarna', position: 12, played: 10, won: 2, drawn: 4, lost: 4, goalsFor: 10, goalsAgainst: 15, goalDifference: -5, points: 10 },
    { teamName: 'Halmstad', position: 13, played: 10, won: 2, drawn: 3, lost: 5, goalsFor: 9, goalsAgainst: 16, goalDifference: -7, points: 9 },
    { teamName: 'Kalmar FF', position: 14, played: 10, won: 2, drawn: 2, lost: 6, goalsFor: 8, goalsAgainst: 17, goalDifference: -9, points: 8 },
    { teamName: 'Örgryte', position: 15, played: 10, won: 1, drawn: 3, lost: 6, goalsFor: 7, goalsAgainst: 18, goalDifference: -11, points: 6 },
    { teamName: 'Degerfors', position: 16, played: 10, won: 1, drawn: 2, lost: 7, goalsFor: 6, goalsAgainst: 20, goalDifference: -14, points: 5 },
  ]

  const scorers: NormalizedTopScorer[] = [
    { rank: 1, playerName: 'Besara', teamName: 'Hammarby', goals: 8 },
    { rank: 2, playerName: 'Abraham', teamName: 'Djurgården', goals: 7 },
    { rank: 3, playerName: 'Lien', teamName: 'Mjällby', goals: 6 },
    { rank: 4, playerName: 'Fenger', teamName: 'Malmö FF', goals: 5 },
  ]

  const makePrediction = (participantId: string, participantName: string, predictedTopScorer: string, positions: NormalizedPrediction['rows']): NormalizedPrediction => ({
    predictionId: participantId,
    participantId,
    participantName,
    predictedTopScorer,
    rows: positions,
  })

  it('ranks participants using points first and top scorer tiebreak second', () => {
    const perfectRows = standings.map((row) => ({ teamName: row.teamName, predictedPosition: row.position }))
    const tiedRows = perfectRows.slice()

    const leaderboard = computeLeaderboard(
      [
        makePrediction('1', 'Simon', 'Besara', perfectRows),
        makePrediction('2', 'Fredrik', 'Abraham', tiedRows),
      ],
      standings,
      scorers,
    )

    expect(leaderboard[0]?.participantName).toBe('Simon')
    expect(leaderboard[0]?.tiebreakScore).toBe(0)
    expect(leaderboard[1]?.tiebreakScore).toBe(-2)
  })
})
