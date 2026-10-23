// Pictogrammes des cartes, dessinés dans un carré de 64 × 64 unités.
// Chacun est un fragment SVG autonome, repositionné par `faces.js`.

const GRIS = '#55616e';
const SOMBRE = '#2b2b2b';
const ETEINT = '#5a5a5a';
const ROUGE = '#c0392b';
const VERT = '#1e824c';
const JAUNE = '#f1c40f';
const BLANC = '#fdfbf5';

/** Feu tricolore, une seule lanterne allumée. */
function feu(allumee) {
  const lampe = (cy, couleur) =>
    `<circle cx="32" cy="${cy}" r="7.5" fill="${cy === allumee ? couleur : ETEINT}"/>`;
  return `
    <rect x="28" y="52" width="8" height="12" fill="${SOMBRE}"/>
    <rect x="17" y="2" width="30" height="54" rx="8" fill="${SOMBRE}"/>
    ${lampe(15, ROUGE)}${lampe(30, JAUNE)}${lampe(45, VERT)}`;
}

/** Panneau rond de limitation ; `barre` le raye en gris, comme une fin de limitation. */
function panneau(barre) {
  const anneau = barre ? GRIS : ROUGE;
  const encre = barre ? GRIS : SOMBRE;
  const rayures = barre
    ? `<g stroke="${SOMBRE}" stroke-width="4" stroke-linecap="round">
         <line x1="12" y1="52" x2="52" y2="12"/>
       </g>`
    : '';
  return `
    <circle cx="32" cy="32" r="29" fill="${BLANC}" stroke="${anneau}" stroke-width="7"/>
    <text x="32" y="43" text-anchor="middle" fill="${encre}"
          font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700">50</text>
    ${rayures}`;
}

/** Jerrican ; `vide` le grise et le barre d'un trait rouge. */
function jerrican(vide) {
  const corps = vide ? GRIS : VERT;
  const barre = vide
    ? `<line x1="8" y1="56" x2="56" y2="8" stroke="${ROUGE}" stroke-width="6" stroke-linecap="round"/>`
    : `<path d="M32 22c4 5 7 8 7 12a7 7 0 0 1-14 0c0-4 3-7 7-12z" fill="${BLANC}"/>`;
  return `
    <path d="M38 8h8l6 6v8h-6v-6h-8z" fill="${SOMBRE}"/>
    <rect x="10" y="12" width="34" height="46" rx="5" fill="${corps}"/>
    <path d="M16 12h22v7a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" fill="${SOMBRE}" opacity="0.35"/>
    ${barre}`;
}

/** Pneu ; `creve` l'affaisse et le fend. */
function pneu(creve) {
  const forme = creve
    ? `<ellipse cx="32" cy="38" rx="29" ry="20" fill="${SOMBRE}"/>
       <ellipse cx="32" cy="38" rx="15" ry="10" fill="${BLANC}"/>`
    : `<circle cx="32" cy="32" r="28" fill="${SOMBRE}"/>
       <circle cx="32" cy="32" r="14" fill="${BLANC}"/>
       <circle cx="32" cy="32" r="4" fill="${GRIS}"/>`;
  const eclat = creve
    ? `<path d="M48 22l5-9 3 8 8-2-6 7 6 5-9 1z" fill="${ROUGE}"/>`
    : '';
  return `${forme}${eclat}`;
}

/** Voiture de profil ; `choc` ajoute une étoile d'impact à l'avant. */
function voiture(choc) {
  const carrosserie = choc ? ROUGE : '#1f4e79';
  const etoile = choc
    ? `<path d="M50 6l4 9 10-4-4 10 8 6-10 2 1 10-9-6-6 7-2-10-9 1 6-8-6-7 10-1z"
             fill="${JAUNE}" stroke="${ROUGE}" stroke-width="1.5" stroke-linejoin="round"/>`
    : '';
  return `
    <path d="M3 44c0-3 2-5 5-5h1l8-12a7 7 0 0 1 6-3h17a7 7 0 0 1 6 3l8 12h1c3 0 5 2 5 5v6H3z"
          fill="${carrosserie}"/>
    <path d="M21 29h9v10H15z" fill="${BLANC}" opacity="0.8"/>
    <path d="M34 29h7l6 10H34z" fill="${BLANC}" opacity="0.8"/>
    <circle cx="18" cy="50" r="7" fill="${SOMBRE}"/><circle cx="18" cy="50" r="3" fill="${BLANC}"/>
    <circle cx="46" cy="50" r="7" fill="${SOMBRE}"/><circle cx="46" cy="50" r="3" fill="${BLANC}"/>
    ${etoile}`;
}

/** Clé plate et tournevis croisés. */
function outils() {
  return `
    <g transform="rotate(-38 32 32)">
      <rect x="27" y="8" width="10" height="48" rx="4" fill="${GRIS}"/>
      <path d="M22 4h8v8h4V4h8v11l-6 5h-8l-6-5z" fill="${GRIS}"/>
      <circle cx="32" cy="52" r="5" fill="${SOMBRE}"/>
    </g>
    <g transform="rotate(42 32 32)">
      <rect x="29" y="30" width="6" height="28" rx="2" fill="${SOMBRE}"/>
      <rect x="26" y="8" width="12" height="24" rx="5" fill="${ROUGE}"/>
    </g>`;
}

/** Volant à trois branches. */
function volant() {
  return `
    <circle cx="32" cy="32" r="28" fill="none" stroke="${SOMBRE}" stroke-width="8"/>
    <circle cx="32" cy="32" r="7" fill="${SOMBRE}"/>
    <g stroke="${SOMBRE}" stroke-width="6" stroke-linecap="round">
      <line x1="32" y1="32" x2="32" y2="60"/>
      <line x1="32" y1="32" x2="7" y2="18"/>
      <line x1="32" y1="32" x2="57" y2="18"/>
    </g>`;
}

/** Camion-citerne. */
function citerne() {
  return `
    <rect x="22" y="20" width="40" height="22" rx="11" fill="${GRIS}"/>
    <path d="M2 42V28a4 4 0 0 1 4-4h8l6 8v10z" fill="#1f4e79"/>
    <path d="M7 27h6l4 5H7z" fill="${BLANC}" opacity="0.8"/>
    <rect x="2" y="42" width="60" height="4" rx="2" fill="${SOMBRE}"/>
    <circle cx="12" cy="50" r="7" fill="${SOMBRE}"/><circle cx="12" cy="50" r="3" fill="${BLANC}"/>
    <circle cx="40" cy="50" r="7" fill="${SOMBRE}"/><circle cx="40" cy="50" r="3" fill="${BLANC}"/>
    <circle cx="54" cy="50" r="7" fill="${SOMBRE}"/><circle cx="54" cy="50" r="3" fill="${BLANC}"/>`;
}

/** Pneu protégé d'un écusson : rien ne le crève. */
function increvable() {
  return `
    <circle cx="32" cy="32" r="28" fill="${SOMBRE}"/>
    <circle cx="32" cy="32" r="14" fill="${BLANC}"/>
    <path d="M32 10l16 6v12c0 10-7 17-16 20-9-3-16-10-16-20V16z" fill="${VERT}"/>
    <path d="M24 31l6 7 12-13" fill="none" stroke="${BLANC}" stroke-width="5"
          stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** Losange de route prioritaire. */
function prioritaire() {
  return `
    <path d="M32 2l30 30-30 30L2 32z" fill="${BLANC}"/>
    <path d="M32 12l20 20-20 20-20-20z" fill="${JAUNE}"/>`;
}

/** Borne kilométrique : la route et son jalon. */
function borne() {
  return `
    <path d="M6 58L22 10h20l16 48z" fill="${SOMBRE}"/>
    <g fill="${BLANC}">
      <rect x="29" y="14" width="6" height="9"/>
      <rect x="29" y="29" width="6" height="9"/>
      <rect x="29" y="44" width="6" height="12"/>
    </g>`;
}

export const PICTOS = {
  'feu-rouge': () => feu(15),
  'feu-vert': () => feu(45),
  limitation: () => panneau(false),
  'fin-limitation': () => panneau(true),
  panne: () => jerrican(true),
  essence: () => jerrican(false),
  crevaison: () => pneu(true),
  roue: () => pneu(false),
  accident: () => voiture(true),
  reparations: () => outils(),
  'as-du-volant': () => volant(),
  citerne: () => citerne(),
  increvable: () => increvable(),
  prioritaire: () => prioritaire(),
  route: () => borne(),
};
