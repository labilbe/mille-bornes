// Règles du Mille Bornes : état d'un tableau, coups légaux, décompte d'une manche.
// Référence : règles officielles Dujardin, partie en 5000 points par équipes de deux.

import {
  ATTAQUE, BORNE, BOTTE, CARTES, FEU_ROUGE, FEU_VERT,
  LIMITATION, PARADE, PRIORITAIRE, botteDe,
} from './cards.js';

export const TEAM_OF = [0, 1, 0, 1]; // Sud/Nord contre Ouest/Est
export const PARTNER_OF = [2, 3, 0, 1];

export const OBJECTIF_MANCHE = 1000;
export const LIMITE_VITESSE = 50;
export const MAX_200 = 2; // Deux cartes 200 bornes au plus par équipe et par manche.

export const POINTS = {
  borne: 1,            // 1 point par kilomètre parcouru
  botte: 100,
  toutesBottes: 300,   // les quatre bottes : 400 + 300
  coupFourre: 300,
  manche: 400,
  capot: 500,          // adversaires restés à zéro borne
  sansLes200: 300,     // 1000 bornes sans jouer une seule carte 200
  couronnement: 300,   // manche achevée après épuisement de la pioche
};

/** Tableau d'une équipe : sa route, sa batterie, sa pile de vitesse et ses bottes. */
export function nouveauTableau() {
  return {
    bornes: 0,
    cartesBornes: [],   // valeurs posées, dans l'ordre
    batterie: null,     // null, FEU_VERT, une attaque ou la parade qui vient de la lever
    limitation: false,
    bottes: [],
    coupsFourres: 0,
    deuxCents: 0,
  };
}

export const aBotte = (t, nom) => t.bottes.includes(nom);

/** Attaque qui bloque le tableau, le cas échéant (la limitation ne bloque pas : elle bride). */
export function attaqueActive(t) {
  return t.batterie && CARTES[t.batterie].type === ATTAQUE ? t.batterie : null;
}

/** L'équipe roule-t-elle ? Le véhicule prioritaire tient lieu de feu vert permanent. */
export function roule(t) {
  if (attaqueActive(t)) return false;
  return t.batterie === FEU_VERT || aBotte(t, PRIORITAIRE);
}

/** Valeur maximale d'une borne jouable : 50 sous limitation, 200 sinon. */
export function plafond(t) {
  return t.limitation && !aBotte(t, PRIORITAIRE) ? LIMITE_VITESSE : 200;
}

export const restant = (t) => OBJECTIF_MANCHE - t.bornes;

/**
 * La carte est-elle jouable ? `mien` est le tableau de celui qui joue,
 * `adverse` celui de l'équipe visée par les attaques.
 */
export function peutJouer(carte, mien, adverse) {
  if (carte.type === BORNE) {
    if (!roule(mien)) return false;
    if (carte.valeur > plafond(mien)) return false;
    if (carte.valeur > restant(mien)) return false;
    return carte.valeur !== 200 || mien.deuxCents < MAX_200;
  }

  const def = CARTES[carte.nom];

  if (carte.type === BOTTE) return !aBotte(mien, carte.nom);

  if (carte.type === PARADE) {
    if (carte.nom === FEU_VERT) {
      // On démarre, ou l'on repart après un feu rouge ou une panne réparée.
      // Le véhicule prioritaire dispense du feu vert : la carte n'a plus d'emploi.
      if (aBotte(mien, PRIORITAIRE)) return false;
      if (mien.batterie === FEU_VERT) return false;
      return mien.batterie === null || mien.batterie === FEU_ROUGE
        || CARTES[mien.batterie].type === PARADE;
    }
    if (def.vitesse) return mien.limitation;
    return attaqueActive(mien) === def.attaque;
  }

  // Attaque : il faut une cible non immunisée.
  if (aBotte(adverse, botteDe(carte.nom))) return false;
  if (def.vitesse) return !adverse.limitation;
  return roule(adverse);
}

/** Cartes jouables de la main, dans l'ordre de la main. */
export function coupsPossibles(main, mien, adverse) {
  return main.filter((c) => peutJouer(c, mien, adverse));
}

/** Pose une botte : elle annule l'attaque correspondante, sans dispenser du feu vert. */
export function poserBotte(t, nom) {
  if (!aBotte(t, nom)) t.bottes.push(nom);
  const def = CARTES[nom];
  if (def.attaques.includes(attaqueActive(t))) t.batterie = null;
  if (def.attaques.includes(LIMITATION)) t.limitation = false;
}

/** Lignes de la feuille de marque, dans l'ordre où elles s'affichent. */
export const LIGNES_SCORE = [
  { cle: 'bornes', libelle: 'Bornes parcourues' },
  { cle: 'bottes', libelle: 'Bottes' },
  { cle: 'toutesBottes', libelle: 'Toutes les bottes' },
  { cle: 'coupsFourres', libelle: 'Coups fourrés' },
  { cle: 'manche', libelle: 'Manche gagnée' },
  { cle: 'sansLes200', libelle: 'Sans les 200' },
  { cle: 'capot', libelle: 'Capot' },
  { cle: 'couronnement', libelle: 'Couronnement' },
];

/**
 * Décompte d'une manche, équipe par équipe.
 * @param {{tableaux: object[], gagnant: ?number, piocheVide: boolean}} fin
 * @returns {{lignes: Object<string, {points: number, detail: string}>, total: number}[]}
 */
export function scoreManche({ tableaux, gagnant, piocheVide }) {
  return tableaux.map((t, equipe) => {
    const adverse = tableaux[1 - equipe];
    const lignes = {};
    const ajouter = (cle, points, detail = '') => { if (points) lignes[cle] = { points, detail }; };

    ajouter('bornes', t.bornes * POINTS.borne, `${t.bornes} km`);
    ajouter('bottes', t.bottes.length * POINTS.botte, `×${t.bottes.length}`);
    if (t.bottes.length === 4) ajouter('toutesBottes', POINTS.toutesBottes);
    ajouter('coupsFourres', t.coupsFourres * POINTS.coupFourre, `×${t.coupsFourres}`);

    if (equipe === gagnant) {
      ajouter('manche', POINTS.manche);
      if (!t.cartesBornes.includes(200)) ajouter('sansLes200', POINTS.sansLes200);
      if (adverse.bornes === 0) ajouter('capot', POINTS.capot);
      if (piocheVide) ajouter('couronnement', POINTS.couronnement);
    }

    const total = Object.values(lignes).reduce((s, l) => s + l.points, 0);
    return { lignes, total };
  });
}

