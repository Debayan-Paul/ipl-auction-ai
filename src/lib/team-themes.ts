export type TeamAbbreviation = 'CSK' | 'DC' | 'GT' | 'KKR' | 'LSG' | 'MI' | 'PBKS' | 'RR' | 'RCB' | 'SRH';

export interface TeamTheme {
  abbreviation: TeamAbbreviation;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  description: string;
}

export const TEAM_THEMES: Record<TeamAbbreviation, TeamTheme> = {
  CSK: {
    abbreviation: 'CSK',
    name: 'Chennai Super Kings',
    primary: '#ffc107',
    secondary: '#1a237e',
    accent: '#ff6f00',
    highlight: '#ffffff',
    description: 'Iconic yellow jersey with bold blue text and orange lion',
  },
  DC: {
    abbreviation: 'DC',
    name: 'Delhi Capitals',
    primary: '#004ba0',
    secondary: '#d32f2f',
    accent: '#fdd835',
    highlight: '#ffffff',
    description: 'Royal blue kit with red tiger-stripes and eagle logo',
  },
  GT: {
    abbreviation: 'GT',
    name: 'Gujarat Titans',
    primary: '#0d1b2a',
    secondary: '#00bcd4',
    accent: '#ffd700',
    highlight: '#ffffff',
    description: 'Dark navy blue jersey with aqua blue and gold trim',
  },
  KKR: {
    abbreviation: 'KKR',
    name: 'Kolkata Knight Riders',
    primary: '#3a0078',
    secondary: '#ffd700',
    accent: '#1a1a2e',
    highlight: '#ffffff',
    description: 'Deep purple elegance with striking gold side panels',
  },
  LSG: {
    abbreviation: 'LSG',
    name: 'Lucknow Super Giants',
    primary: '#d32f2f',
    secondary: '#1565c0',
    accent: '#b0bec5',
    highlight: '#388e3c',
    description: 'Bright red jersey with bold vertical blue stripes',
  },
  MI: {
    abbreviation: 'MI',
    name: 'Mumbai Indians',
    primary: '#004ba0',
    secondary: '#ffd700',
    accent: '#ff6f00',
    highlight: '#388e3c',
    description: 'Signature dark blue base with brilliant gold foil',
  },
  PBKS: {
    abbreviation: 'PBKS',
    name: 'Punjab Kings',
    primary: '#8b0000',
    secondary: '#0d1b2a',
    accent: '#ffd700',
    highlight: '#ffffff',
    description: 'Fiery red jersey with navy blue sleeves and gold lion',
  },
  RR: {
    abbreviation: 'RR',
    name: 'Rajasthan Royals',
    primary: '#e91e90',
    secondary: '#0d1b2a',
    accent: '#ffd700',
    highlight: '#ffffff',
    description: 'Vibrant hot pink and navy blue gradient kit',
  },
  RCB: {
    abbreviation: 'RCB',
    name: 'Royal Challengers Bengaluru',
    primary: '#c62828',
    secondary: '#1a1a2e',
    accent: '#ffd700',
    highlight: '#ffffff',
    description: 'Deep red and black gradient with premium gold trim',
  },
  SRH: {
    abbreviation: 'SRH',
    name: 'Sunrisers Hyderabad',
    primary: '#ff6f00',
    secondary: '#1a1a2e',
    accent: '#d32f2f',
    highlight: '#fdd835',
    description: 'Bright flame-like orange jersey with black sleeves',
  },
};

export const TEAM_LIST = Object.values(TEAM_THEMES);

export function getTeamTheme(abbreviation: string): TeamTheme | null {
  return TEAM_THEMES[abbreviation as TeamAbbreviation] ?? null;
}

export function getTeamColors(abbreviation: string) {
  const theme = getTeamTheme(abbreviation);
  if (!theme) return null;
  return {
    primary: theme.primary,
    secondary: theme.secondary,
    accent: theme.accent,
    highlight: theme.highlight,
  };
}
