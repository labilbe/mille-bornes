// Faces des cartes, composées en SVG : un bandeau titre, un pictogramme, une
// mention de nature. Les cartes du Mille Bornes n'ont pas d'enseigne ; c'est la
// couleur du bandeau qui les range — bleu pour les bornes, rouge pour les
// attaques, vert pour les parades, or pour les bottes.

import { ATTAQUE, BORNE, BOTTE, CARTES, PARADE } from './cards.js';
import { PICTOS } from './pictos.js';

const LARGEUR = 120;
const HAUTEUR = 174;

export const COULEURS = {
  [BORNE]: { fond: '#1f4e79', encre: '#fdfbf5', nature: 'Borne' },
  [ATTAQUE]: { fond: '#c0392b', encre: '#fdfbf5', nature: 'Attaque' },
  [PARADE]: { fond: '#1e824c', encre: '#fdfbf5', nature: 'Parade' },
  [BOTTE]: { fond: '#d9b45b', encre: '#231a06', nature: 'Botte' },
};

// Libellés coupés à la main : le bandeau tient deux lignes au plus.
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

function bandeau(lignes, { fond, encre }) {
  const textes = lignes.length === 1
    ? `<text x="60" y="25" font-size="13">${lignes[0]}</text>`
    : `<text x="60" y="18" font-size="12">${lignes[0]}</text>
       <text x="60" y="31" font-size="12">${lignes[1]}</text>`;
  return `
    <path d="M2 12a10 10 0 0 1 10-10h96a10 10 0 0 1 10 10v24H2z" fill="${fond}"/>
    <g fill="${encre}" text-anchor="middle" font-family="${SANS}" font-weight="700">${textes}</g>`;
}

function pied(nature, { fond, encre }) {
  return `
    <path d="M2 150h116v12a10 10 0 0 1-10 10H12a10 10 0 0 1-10-10z" fill="${fond}"/>
    <text x="60" y="166" text-anchor="middle" fill="${encre}" font-family="${SANS}"
          font-size="9.5" font-weight="700" letter-spacing="1.6">${nature.toUpperCase()}</text>`;
}

/**
 * Face complète d'une carte, en HTML prêt à insérer.
 * @param {{type: string, nom: string, valeur?: number}} carte
 */
export function faceCarte(carte) {
  const def = carte.type === BORNE ? null : CARTES[carte.nom];
  const couleurs = COULEURS[def && def.type === PARADE ? PARADE : carte.type];
  const cadre = `
    <rect x="1" y="1" width="${LARGEUR - 2}" height="${HAUTEUR - 2}" rx="10"
          fill="#fdfbf5" stroke="${couleurs.fond}" stroke-width="2"/>`;

  const corps = carte.type === BORNE
    ? `${bandeau(['Bornes'], couleurs)}
       <text x="60" y="108" text-anchor="middle" fill="${couleurs.fond}" font-family="${SANS}"
             font-size="46" font-weight="700">${carte.valeur}</text>
       ${picto('route', 60, 133, 34)}`
    : `${bandeau(TITRES[carte.nom], couleurs)}
       ${picto(carte.nom, 60, 95, 76)}`;

  return `<svg class="face" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" aria-hidden="true">
    ${cadre}${corps}${pied(couleurs.nature, couleurs)}
  </svg>`;
}
