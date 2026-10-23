// Jeu de 106 cartes du Mille Bornes : bornes, attaques, parades et bottes.
//
// Une « famille » réunit une attaque, la parade qui la lève et la botte qui en
// protège définitivement : accident / réparations / as du volant, par exemple.

export const BORNE = 'borne';
export const ATTAQUE = 'attaque';
export const PARADE = 'parade';
export const BOTTE = 'botte';

export const FEU_ROUGE = 'feu-rouge';
export const LIMITATION = 'limitation';
export const PANNE = 'panne';
export const CREVAISON = 'crevaison';
export const ACCIDENT = 'accident';

export const FEU_VERT = 'feu-vert';
export const FIN_LIMITATION = 'fin-limitation';
export const ESSENCE = 'essence';
export const ROUE = 'roue';
export const REPARATIONS = 'reparations';

export const AS_DU_VOLANT = 'as-du-volant';
export const CITERNE = 'citerne';
export const INCREVABLE = 'increvable';
export const PRIORITAIRE = 'prioritaire';

/**
 * Description de chaque carte hors bornes : nature, libellé, nombre d'exemplaires
 * dans le paquet et liens de famille.
 * `vitesse` marque la limitation : elle se pose sur la pile de vitesse, non sur
 * la batterie, et peut donc frapper un adversaire même à l'arrêt.
 */
export const CARTES = {
  [FEU_ROUGE]: { type: ATTAQUE, libelle: 'Feu rouge', nombre: 5, parade: FEU_VERT, botte: PRIORITAIRE },
  [LIMITATION]: { type: ATTAQUE, libelle: 'Limitation de vitesse', nombre: 4, parade: FIN_LIMITATION, botte: PRIORITAIRE, vitesse: true },
  [PANNE]: { type: ATTAQUE, libelle: "Panne d'essence", nombre: 3, parade: ESSENCE, botte: CITERNE },
  [CREVAISON]: { type: ATTAQUE, libelle: 'Crevaison', nombre: 3, parade: ROUE, botte: INCREVABLE },
  [ACCIDENT]: { type: ATTAQUE, libelle: 'Accident', nombre: 3, parade: REPARATIONS, botte: AS_DU_VOLANT },

  [FEU_VERT]: { type: PARADE, libelle: 'Feu vert', nombre: 14, attaque: FEU_ROUGE },
  [FIN_LIMITATION]: { type: PARADE, libelle: 'Fin de limitation', nombre: 6, attaque: LIMITATION, vitesse: true },
  [ESSENCE]: { type: PARADE, libelle: 'Essence', nombre: 6, attaque: PANNE },
  [ROUE]: { type: PARADE, libelle: 'Roue de secours', nombre: 6, attaque: CREVAISON },
  [REPARATIONS]: { type: PARADE, libelle: 'Réparations', nombre: 6, attaque: ACCIDENT },

  [AS_DU_VOLANT]: { type: BOTTE, libelle: 'As du volant', nombre: 1, attaques: [ACCIDENT] },
  [CITERNE]: { type: BOTTE, libelle: "Citerne d'essence", nombre: 1, attaques: [PANNE] },
  [INCREVABLE]: { type: BOTTE, libelle: 'Increvable', nombre: 1, attaques: [CREVAISON] },
  [PRIORITAIRE]: { type: BOTTE, libelle: 'Véhicule prioritaire', nombre: 1, attaques: [FEU_ROUGE, LIMITATION] },
};

/** Bornes : valeur en kilomètres et nombre d'exemplaires. */
export const BORNES = [
  { valeur: 25, nombre: 10 },
  { valeur: 50, nombre: 10 },
  { valeur: 75, nombre: 10 },
  { valeur: 100, nombre: 12 },
  { valeur: 200, nombre: 4 },
];

export const ATTAQUES = Object.keys(CARTES).filter((n) => CARTES[n].type === ATTAQUE);
export const PARADES = Object.keys(CARTES).filter((n) => CARTES[n].type === PARADE);
export const BOTTES = Object.keys(CARTES).filter((n) => CARTES[n].type === BOTTE);

export const estBorne = (carte) => carte.type === BORNE;

/** Parade qui lève l'attaque, botte qui en protège. */
export const paradeDe = (attaque) => CARTES[attaque].parade;
export const botteDe = (attaque) => CARTES[attaque].botte;
/** Attaque levée par cette parade. */
export const attaqueDe = (parade) => CARTES[parade].attaque;

export function libelle(carte) {
  return carte.type === BORNE ? `${carte.valeur} bornes` : CARTES[carte.nom].libelle;
}

export function newDeck() {
  const paquet = [];
  let n = 0;
  for (const { valeur, nombre } of BORNES) {
    for (let i = 0; i < nombre; i++) paquet.push({ type: BORNE, nom: `borne-${valeur}`, valeur, id: `c${n++}` });
  }
  for (const [nom, def] of Object.entries(CARTES)) {
    for (let i = 0; i < def.nombre; i++) paquet.push({ type: def.type, nom, id: `c${n++}` });
  }
  return paquet;
}

export function shuffle(paquet, rng = Math.random) {
  const cartes = paquet.slice();
  for (let i = cartes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cartes[i], cartes[j]] = [cartes[j], cartes[i]];
  }
  return cartes;
}

/** Tri d'une main pour l'affichage : bornes croissantes, parades, attaques, bottes. */
const RANG = { [BORNE]: 0, [PARADE]: 1, [ATTAQUE]: 2, [BOTTE]: 3 };

export function sortHand(main) {
  return main.slice().sort((a, b) => {
    if (RANG[a.type] !== RANG[b.type]) return RANG[a.type] - RANG[b.type];
    if (a.type === BORNE) return a.valeur - b.valeur;
    return a.nom.localeCompare(b.nom);
  });
}
