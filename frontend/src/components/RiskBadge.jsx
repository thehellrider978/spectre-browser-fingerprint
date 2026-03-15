/*
 * Spectre – RiskBadge component
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 */
const COLOR = {
  HIGH:     { bg: 'rgba(226,75,74,0.15)',   text: '#E24B4A', border: 'rgba(226,75,74,0.4)'   },
  MEDIUM:   { bg: 'rgba(239,159,39,0.15)',  text: '#EF9F27', border: 'rgba(239,159,39,0.4)'  },
  LOW:      { bg: 'rgba(29,158,117,0.15)',  text: '#1D9E75', border: 'rgba(29,158,117,0.4)'  },
  CRITICAL: { bg: 'rgba(226,75,74,0.2)',    text: '#E24B4A', border: 'rgba(226,75,74,0.5)'   },
  BLOCKED:  { bg: 'rgba(29,158,117,0.15)',  text: '#1D9E75', border: 'rgba(29,158,117,0.4)'  },
  LEAKED:   { bg: 'rgba(226,75,74,0.15)',   text: '#E24B4A', border: 'rgba(226,75,74,0.4)'   },
  SECURE:   { bg: 'rgba(29,158,117,0.15)',  text: '#1D9E75', border: 'rgba(29,158,117,0.4)'  },
  INFO:     { bg: 'rgba(78,158,232,0.12)',  text: '#4E9EE8', border: 'rgba(78,158,232,0.3)'  },
  UNIQUE:   { bg: 'rgba(226,75,74,0.15)',   text: '#E24B4A', border: 'rgba(226,75,74,0.4)'   },
  COMMON:   { bg: 'rgba(107,105,102,0.15)', text: '#8a8784', border: 'rgba(107,105,102,0.3)' },
  BOT:      { bg: 'rgba(226,75,74,0.2)',    text: '#E24B4A', border: 'rgba(226,75,74,0.5)'   },
  OK:       { bg: 'rgba(29,158,117,0.15)',  text: '#1D9E75', border: 'rgba(29,158,117,0.4)'  },
};

export default function RiskBadge({ level, size = 'sm' }) {
  const c    = COLOR[level?.toUpperCase()] || COLOR.INFO;
  const font = size === 'lg' ? '13px' : '10px';
  const pad  = size === 'lg' ? '4px 12px' : '2px 7px';

  return (
    <span style={{
      display:         'inline-block',
      fontFamily:      'var(--mono)',
      fontSize:        font,
      fontWeight:      400,
      letterSpacing:   '0.8px',
      padding:         pad,
      borderRadius:    '3px',
      background:      c.bg,
      color:           c.text,
      border:          `1px solid ${c.border}`,
      whiteSpace:      'nowrap',
      lineHeight:      '1.4',
    }}>
      {level?.toUpperCase()}
    </span>
  );
}
