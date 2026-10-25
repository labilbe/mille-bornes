// Faces des cartes, composées en SVG, dans l'esprit des vraies cartes du
// Mille Bornes : fond ivoire, large cadre de couleur, vignette illustrée au
// centre et titre en capitales dessous. Les illustrations d'origine sont sous
// droits : tout est redessiné ici, seule la mise en page leur fait écho.
//
// La couleur du cadre range la carte : bleu pour les bornes, rouge pour les
// attaques, vert pour les parades, or pour les bottes.

import { ATTAQUE, BORNE, BOTTE, CARTES, PARADE } from './cards.js';
import { PICTOS } from './pictos.js';

const LARGEUR = 120;
const HAUTEUR = 174;

// Géométrie de la vignette centrale, commune à toutes les cartes.
const VIGNETTE = { x: 11, y: 14, l: 98, h: 94, r: 5 };
const SOL = 96; // hauteur où le ciel cède la place au sol, dans la vignette

export const COULEURS = {
  [BORNE]: { cadre: '#1f4e79', fond: '#f6f2e6', ciel: '#dfe9f1', sol: '#cfc5ad', nature: 'Borne' },
  [ATTAQUE]: { cadre: '#b4311f', fond: '#f7efe8', ciel: '#f2ded6', sol: '#dcc8bb', nature: 'Attaque' },
  [PARADE]: { cadre: '#1e7a4b', fond: '#f1f4ea', ciel: '#dcebdf', sol: '#c9cdb2', nature: 'Parade' },
  [BOTTE]: { cadre: '#a8822c', fond: '#fbf3dc', ciel: '#f7e8bd', sol: '#e2cd97', nature: 'Botte' },
};

// Libellés coupés à la main : deux lignes au plus sous la vignette.
const TITRES = {
  'feu-rouge': ['Feu rouge'],
  limitation: ['Limitation', 'de vitesse'],
  panne: ['Panne', "d'essence"],
  crevaison: ['Crevaison'],
  accident: ['Accident'],
  'feu-vert': ['Feu vert'],
  'fin-limitation': ['Fin de', 'limitation'],
  essence: ['Essence'],
  roue: ['Roue', 'de secours'],
  reparations: ['Réparations'],
  'as-du-volant': ['As du volant'],
  citerne: ['Citerne', "d'essence"],
  increvable: ['Increvable'],
  prioritaire: ['Véhicule', 'prioritaire'],
};

const SANS = 'Arial, Helvetica, sans-serif';

/** Pictogramme centré en (cx, cy), à la taille demandée. */
function picto(nom, cx, cy, taille) {
  const e = taille / 64;
  return `<g transform="translate(${cx - taille / 2} ${cy - taille / 2}) scale(${e})">${PICTOS[nom]()}</g>`;
}

/**
 * Vignette illustrée : un fond ciel, un sol, le dessin, et un filet autour.
 * Les coins du sol épousent ceux de la vignette, sans masque — deux faces de
 * cartes affichées côte à côte ne peuvent alors pas se disputer un même `id`.
 */
function vignette(dessin, { cadre, ciel, sol }) {
  const { x, y, l, h, r } = VIGNETTE;
  const bas = y + h;
  return `
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${r}" fill="${ciel}"/>
    <path d="M${x} ${SOL}h${l}v${bas - SOL - r}a${r} ${r} 0 0 1-${r} ${r}H${x + r}a${r} ${r} 0 0 1-${r}-${r}z"
          fill="${sol}"/>
    ${dessin}
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${r}" fill="none"
          stroke="${cadre}" stroke-width="1.6"/>`;
}

/** Titre en capitales serrées, sur une ou deux lignes. */
function titre(lignes, { cadre }) {
  const textes = lignes.length === 1
    ? `<text x="60" y="130" font-size="12.5">${lignes[0].toUpperCase()}</text>`
    : `<text x="60" y="125" font-size="11.5">${lignes[0].toUpperCase()}</text>
       <text x="60" y="138" font-size="11.5">${lignes[1].toUpperCase()}</text>`;
  return `<g fill="${cadre}" text-anchor="middle" font-family="${SANS}"
             font-weight="700" letter-spacing="0.6">${textes}</g>`;
}

/** Mention de nature, en bas de carte : elle dit à quoi sert la carte. */
function pied(nature, { cadre }) {
  return `
    <line x1="34" y1="150" x2="86" y2="150" stroke="${cadre}" stroke-width="0.8" opacity="0.4"/>
    <text x="60" y="163" text-anchor="middle" fill="${cadre}" font-family="${SANS}"
          font-size="8" font-weight="700" letter-spacing="2.2"
          opacity="0.75">${nature.toUpperCase()}</text>`;
}

/** Vignette des bornes : la route file à l'horizon, le nombre par-dessus. */
function routeEtNombre(valeur, { cadre }) {
  return `
    ${picto('route', 60, 62, 86)}
    <text x="60" y="76" text-anchor="middle" fill="${cadre}" font-family="${SANS}"
          font-size="40" font-weight="700" stroke="#f6f2e6" stroke-width="4"
          paint-order="stroke">${valeur}</text>`;
}

/**
 * Face complète d'une carte, en HTML prêt à insérer.
 * @param {{type: string, nom: string, valeur?: number}} carte
 */
export function faceCarte(carte) {
  const def = carte.type === BORNE ? null : CARTES[carte.nom];
  const couleurs = COULEURS[def ? def.type : BORNE];

  const cadre = `
    <rect x="0.5" y="0.5" width="${LARGEUR - 1}" height="${HAUTEUR - 1}" rx="9"
          fill="${couleurs.fond}" stroke="${couleurs.cadre}" stroke-width="5"/>
    <rect x="5" y="5" width="${LARGEUR - 10}" height="${HAUTEUR - 10}" rx="6" fill="none"
          stroke="${couleurs.cadre}" stroke-width="0.8" opacity="0.5"/>`;

  const dessin = carte.type === BORNE
    ? routeEtNombre(carte.valeur, couleurs)
    : picto(carte.nom, 60, 58, 80);
  const lignes = carte.type === BORNE ? ['Bornes'] : TITRES[carte.nom];

  return `<svg class="face" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" aria-hidden="true">
    ${cadre}${vignette(dessin, couleurs)}${titre(lignes, couleurs)}${pied(couleurs.nature, couleurs)}
  </svg>`;
}
