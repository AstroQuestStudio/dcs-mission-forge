export function generateMilsymSVG(coalition: string, category: string, selected: boolean): string {
  const colors: Record<string, { fill: string; stroke: string }> = {
    blue: { fill: '#1e40af', stroke: '#3b82f6' },
    red: { fill: '#991b1b', stroke: '#ef4444' },
    neutrals: { fill: '#374151', stroke: '#9ca3af' },
  };
  const c = colors[coalition] ?? colors.neutrals;
  const halo = selected ? `<circle cx="12" cy="12" r="14" fill="${c.fill}" opacity="0.25"/>` : '';
  const selRing = selected ? `<circle cx="12" cy="12" r="11" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.8"/>` : '';

  let shape: string;
  if (category === 'plane') {
    shape = `<circle cx="12" cy="12" r="9" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <path d="M12,5 L9,19 L12,16 L15,19 Z" fill="white" opacity="0.9"/>`;
  } else if (category === 'helicopter') {
    shape = `<circle cx="12" cy="12" r="9" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <text x="12" y="16" text-anchor="middle" font-size="9" fill="white" font-family="monospace" font-weight="bold">H</text>`;
  } else if (category === 'ship') {
    shape = `<ellipse cx="12" cy="14" rx="8" ry="5" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <path d="M5,11 Q9,8 12,11 Q15,14 19,11" fill="none" stroke="${c.stroke}" stroke-width="1"/>`;
  } else if (category === 'static') {
    shape = `<rect x="4" y="4" width="16" height="16" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
  } else {
    shape = `<rect x="3" y="8" width="18" height="9" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <circle cx="7" cy="17" r="2" fill="${c.stroke}"/><circle cx="17" cy="17" r="2" fill="${c.stroke}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${halo}${shape}${selRing}</svg>`;
}
