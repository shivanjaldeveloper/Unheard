export const COLORS = {
  primary: '#a78bfa',
  primaryDeep: '#7c3aed',
  primaryGradient: ['#a78bfa', '#7c3aed'],
  backgroundGradient: ['#0f0c29', '#302b63', '#24243e'],
  darkBackgroundGradient: ['#13111c', '#1e1b2e', '#13111c'],

  white: '#FFFFFF',
  textPrimary: '#f5f3ff',
  textSecondary: 'rgba(221,214,254,0.8)',
  textMuted: 'rgba(196,181,253,0.55)',
  textDim: 'rgba(167,139,250,0.5)',

  surface: 'rgba(255,255,255,0.05)',
  surfaceMid: 'rgba(255,255,255,0.08)',
  border: 'rgba(167,139,250,0.18)',
  borderLight: 'rgba(167,139,250,0.1)',

  bubbleUser: 'rgba(124,58,237,0.55)',
  bubbleBot: 'rgba(255,255,255,0.07)',

  success: '#059669',
  error: '#DC2626',
};

export const FONTS = {
  heading: { fontFamily: 'Georgia', fontWeight: '700' },
  semiBold: { fontWeight: '600' },
  regular: { fontWeight: '400' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const SHADOWS = {
  primary: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
};
