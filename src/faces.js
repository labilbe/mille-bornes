// Faces des cartes, composées en SVG, dans l'esprit des vraies cartes du
// Mille Bornes : carton blanc sans cadre, dessin à plat au centre, titre
// manuscrit en couleur, et surtout la symétrie — tout est repris à l'envers,
// de sorte que la carte se lise dans les deux sens, comme sur le jeu d'origine.
// Les bornes y répètent leur nombre tête-bêche de part et d'autre du paysage.
//
// Les illustrations d'origine sont sous droits : rien n'en est repris ici,
// seule leur mise en page fait écho.

import { ATTAQUE, BORNE, BOTTE, CARTES, PARADE } from './cards.js';
import { PICTOS } from './pictos.js';

const LARGEUR = 120;
const HAUTEUR = 174;
const CX = LARGEUR / 2;
const CY = HAUTEUR / 2;

// Couleur d'encre du titre, qui range la carte comme sur le jeu d'origine :
// rouge pour ce qui arrête, vert pour ce qui repart, or pour les bottes.
const ENCRES = {
  [BORNE]: '#1b4f8a',
  [ATTAQUE]: '#cf2020',
  [PARADE]: '#17813f',
  [BOTTE]: '#b07d12',
};

// Titres courts, ceux des vraies cartes : « Stop » plutôt que « feu rouge ».
const TITRES = {
  'feu-rouge': 'Stop',
  limitation: 'Limitation',
  panne: "Panne d'essence",
  crevaison: 'Crevé !',
  accident: 'Accident',
  'feu-vert': 'Roulez !',
  'fin-limitation': 'Fin de limitation',
  essence: 'Essence',
  roue: 'Roue de secours',
  reparations: 'Réparations',
  'as-du-volant': 'As du volant',
  citerne: "Citerne d'essence",
  increvable: 'Increvable',
  prioritaire: 'Prioritaire',
};

// Écriture manuscrite du titre : les polices cursives installées d'un système à
// l'autre, puis la cursive générique. Le chiffre reste en bâton, bien lisible.
const PLUME = "'Segoe Script','Bradley Hand','Snell Roundhand','Brush Script MT',cursive";
const BATON = 'Arial, Helvetica, sans-serif';

/** Le même contenu, repris tête-bêche : c'est ce qui fait la carte à jouer. */
const retourne = (contenu) => `<g transform="rotate(180 ${CX} ${CY})">${contenu}</g>`;

/** Pictogramme centré en (cx, cy), à la taille demandée. */
function picto(nom, cx, cy, taille) {
  const e = taille / 64;
  return `<g transform="translate(${cx - taille / 2} ${cy - taille / 2}) scale(${e})">${PICTOS[nom]()}</g>`;
}

/** Corps de caractère du titre : les noms longs se resserrent. */
function corps(titre) {
  if (titre.length <= 8) return 17;
  if (titre.length <= 12) return 14.5;
  return 11.8;
}

/**
 * Paysage traversé par la route, au milieu de la carte des bornes : un ciel,
 * un coteau, un champ et une borne plantée au bord. Il est posé une seule fois,
 * entre les deux nombres tête-bêche.
 */
function paysage() {
  return `
    <rect x="9" y="72" width="102" height="30" rx="4" fill="#cfe4f3"/>
    <circle cx="24" cy="80" r="5" fill="#f0b03e"/>
    <path d="M9 88c10-7 19-6 29-2s18 3 28-1 20-6 30-2 12 4 15 3v18H9z" fill="#7cb86a"/>
    <path d="M62 93c14-4 28-5 40-2v5c-12-2-26-1-40 2z" fill="#e3d471"/>
    <path d="M9 96c16-5 28 1 42-1s30-5 44-2 10 2 16 1v4a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4z"
          fill="#4a9440"/>
    <rect x="88" y="82" width="4.5" height="16" rx="1" fill="#fdfcf8"
          stroke="#6b6b6b" stroke-width="0.5"/>
    <path d="M88 82h4.5v4.5H88z" fill="#cf2020"/>
    <rect x="9" y="72" width="102" height="30" rx="4" fill="none"
          stroke="#1b4f8a" stroke-width="0.9" opacity="0.45"/>`;
}

/** Carte de bornes : l'index au coin, le nombre en gros, le tout tête-bêche. */
function faceBorne(valeur, encre) {
  const demi = `
    <text x="13" y="21" font-family="${BATON}" font-size="12" font-weight="700"
          fill="${encre}">${valeur}</text>
    <text x="${CX}" y="70" font-family="${BATON}" font-size="34" font-weight="700"
          fill="${encre}" text-anchor="middle">${valeur}</text>`;
  return `${paysage()}${demi}${retourne(demi)}`;
}

/** Carte d'attaque, de parade ou de botte : le dessin au centre, le titre deux fois. */
function faceDessin(nom, encre) {
  const titre = TITRES[nom];
  const demi = `
    <text x="${CX}" y="27" font-family="${PLUME}" font-size="${corps(titre)}"
          fill="${encre}" text-anchor="middle">${titre}</text>`;
  return `
    <circle cx="${CX}" cy="${CY}" r="38" fill="${encre}" opacity="0.1"/>
    ${picto(nom, CX, CY, 76)}
    ${demi}${retourne(demi)}`;
}

/**
 * Face complète d'une carte, en HTML prêt à insérer.
 * @param {{type: string, nom: string, valeur?: number}} carte
 */
export function faceCarte(carte) {
  const type = carte.type === BORNE ? BORNE : CARTES[carte.nom].type;
  const encre = ENCRES[type];
  // Les bottes se repèrent de loin à leur filet doré.
  const filet = type === BOTTE
    ? `<rect x="5.5" y="5.5" width="${LARGEUR - 11}" height="${HAUTEUR - 11}" rx="6"
             fill="none" stroke="${encre}" stroke-width="1.4"/>`
    : '';

  const carton = `
    <rect x="1" y="1" width="${LARGEUR - 2}" height="${HAUTEUR - 2}" rx="8"
          fill="#fdfcf8" stroke="#cdc6b6" stroke-width="1.4"/>${filet}`;

  const corpsCarte = carte.type === BORNE
    ? faceBorne(carte.valeur, encre)
    : faceDessin(carte.nom, encre);

  return `<svg class="face" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" aria-hidden="true">
    ${carton}${corpsCarte}
  </svg>`;
}
