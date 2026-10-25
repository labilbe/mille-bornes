// Pictogrammes des cartes, dessinés dans un carré de 64 × 64 unités.
// Chacun est un fragment SVG autonome, repositionné par `faces.js`.

const GRIS = '#4a5663';
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
  const corps = vide ? '#9aa3ad' : VERT;
  // Plein, une goutte le marque ; vide, une barre le raye — posée en dernier.
  const marque = vide
    ? `<line x1="10" y1="54" x2="54" y2="10" stroke="${ROUGE}" stroke-width="5.5"
             stroke-linecap="round"/>`
    : `<path d="M32 22c4 5 7 8 7 12a7 7 0 0 1-14 0c0-4 3-7 7-12z" fill="${BLANC}"/>`;
  return `
    <rect x="14" y="7" width="24" height="6" rx="3" fill="${SOMBRE}"/>
    <path d="M45 20h5a4 4 0 0 1 4 4v7h-5v-6h-4z" fill="${SOMBRE}"/>
    <rect x="9" y="13" width="37" height="47" rx="5" fill="${corps}"
          stroke="${SOMBRE}" stroke-width="1.8"/>
    <g stroke="${SOMBRE}" stroke-width="1.6" opacity="0.4" fill="none">
      <path d="M16 21l23 31M39 21L16 52"/>
    </g>
    ${marque}`;
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
    <g transform="rotate(-32 32 32)">
      <rect x="28" y="12" width="8" height="44" rx="4" fill="${GRIS}"/>
      <path d="M23 6h7v9h4V6h7v12l-6 5h-6l-6-5z" fill="${GRIS}"/>
      <circle cx="32" cy="54" r="4.5" fill="${GRIS}"/>
    </g>
    <g transform="rotate(38 32 32)">
      <path d="M29 28h6v26l-3 5-3-5z" fill="#8a9099"/>
      <rect x="25" y="8" width="14" height="22" rx="5" fill="${ROUGE}"/>
      <rect x="25" y="26" width="14" height="4" fill="${SOMBRE}" opacity="0.3"/>
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

/** Pneu frappé d'un écusson, posé en coin pour que la roue reste visible. */
function increvable() {
  return `
    <circle cx="29" cy="30" r="27" fill="${SOMBRE}"/>
    <circle cx="29" cy="30" r="13" fill="${BLANC}"/>
    <circle cx="29" cy="30" r="4" fill="${GRIS}"/>
    <g transform="translate(36 32)">
      <path d="M14 0L26 4.5v9c0 7.5-5 12.5-12 15-7-2.5-12-7.5-12-15v-9z" fill="${VERT}"
            stroke="${BLANC}" stroke-width="2"/>
      <path d="M8 15l4 4.5 9-9.5" fill="none" stroke="${BLANC}" stroke-width="3.4"
            stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

/** Losange de route prioritaire. */
function prioritaire() {
  return `
    <path d="M32 2l30 30-30 30L2 32z" fill="${BLANC}"/>
    <path d="M32 12l20 20-20 20-20-20z" fill="${JAUNE}"/>`;
}

/** La route qui file à l'horizon, bande médiane comprise. */
function route() {
  return `
    <path d="M27 6h10l25 58H2z" fill="#3c4650"/>
    <path d="M27 6h10l1.8 10h-13.6z" fill="#4a5560"/>
    <g fill="${BLANC}">
      <rect x="30.2" y="9" width="3.6" height="6" rx="1"/>
      <rect x="29.8" y="21" width="4.4" height="8" rx="1.2"/>
      <rect x="29.2" y="36" width="5.6" height="10" rx="1.5"/>
      <rect x="28.4" y="53" width="7.2" height="11" rx="2"/>
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
  route: () => route(),
};
