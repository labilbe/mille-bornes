// Intelligence artificielle des trois joueurs non humains.
//
// Une main de Mille Bornes se joue par priorités : se dégager, démarrer, avancer,
// gêner l'adversaire, et ne lâcher que ce qui ne servira plus.

import {
  ACCIDENT, ATTAQUE, BORNE, BOTTE, CARTES, CREVAISON, FEU_ROUGE, FEU_VERT,
  LIMITATION, PANNE, PARADE, PRIORITAIRE, botteDe,
} from './cards.js';
import { OBJECTIF_MANCHE, aBotte, attaqueActive, restant, roule } from './rules.js';

// Ordre de préférence des attaques : d'abord celles dont la parade est rare,
// ensuite le feu rouge, enfin la limitation qui ne fait que brider.
const ORDRE_ATTAQUES = [ACCIDENT, PANNE, CREVAISON, FEU_ROUGE, LIMITATION];

// En deçà de ce nombre de cartes dans la pioche, on cesse d'espérer un coup fourré
// et l'on pose ses bottes pour en encaisser les 100 points.
const PIOCHE_COURTE = 10;

const jouer = (carte) => ({ type: 'jouer', carte });

/**
 * Utilité d'une carte restée en main, pour choisir la défausse.
 * `rang` est son rang parmi les cartes de même nom : les doublons valent moins.
 */
function utilite(carte, rang, mien, adverse) {
  if (carte.type === BOTTE) return 100;

  if (carte.type === BORNE) {
    // Une borne trop grosse pour la distance restante ne servira plus.
    if (carte.valeur > restant(mien)) return 0;
    if (carte.valeur === 200 && mien.deuxCents >= 2) return 0;
    return 10 + carte.valeur / 1000;
  }

  if (carte.type === ATTAQUE) {
    if (aBotte(adverse, botteDe(carte.nom))) return 0; // l'adversaire est immunisé
    return 8 - rang;
  }

  // Parade : inutile si notre botte nous protège déjà de l'attaque correspondante.
  const attaque = CARTES[carte.nom].attaque;
  if (aBotte(mien, botteDe(attaque))) return 1;
  return (carte.nom === FEU_VERT ? 6 : 7) - rang;
}

/** Carte la moins utile de la main. */
export function pireCarte(main, mien, adverse) {
  const vus = {};
  let pire = main[0];
  let min = Infinity;
  for (const carte of main) {
    const rang = vus[carte.nom] = (vus[carte.nom] ?? -1) + 1;
    const note = utilite(carte, rang, mien, adverse);
    if (note < min) {
      min = note;
      pire = carte;
    }
  }
  return pire;
}

/**
 * Coup d'un joueur automatique.
 * @returns {{type:'jouer'|'defausser', carte: object}}
 */
export function choisirCoup(game, joueur) {
  const main = game.mains[joueur];
  const mien = game.tableauDe(joueur);
  const adverse = game.tableauAdverse(joueur);
  const jouables = game.cartesJouables(joueur);
  if (!jouables.length) return { type: 'defausser', carte: pireCarte(main, mien, adverse) };

  const trouver = (pred) => jouables.find(pred);
  const attaque = attaqueActive(mien);

  // 1. Se dégager : la parade d'abord, la botte seulement à défaut — gardée en main
  //    elle vaut peut-être un coup fourré à 300 points.
  if (attaque) {
    const parade = trouver((c) => c.type === PARADE && c.nom !== FEU_VERT);
    if (parade) return jouer(parade);
    const botte = trouver((c) => c.type === BOTTE && CARTES[c.nom].attaques.includes(attaque));
    if (botte) return jouer(botte);
  }

  // 2. Démarrer, ou repartir après une réparation.
  if (!roule(mien)) {
    const feuVert = trouver((c) => c.nom === FEU_VERT);
    if (feuVert) return jouer(feuVert);
    const prioritaire = trouver((c) => c.nom === PRIORITAIRE);
    if (prioritaire) return jouer(prioritaire);
  }

  // 3. Se débrider quand la limitation coûte vraiment des bornes.
  const finLimitation = trouver((c) => c.type === PARADE && CARTES[c.nom].vitesse);
  const grosses = main.some((c) => c.type === BORNE && c.valeur > 50 && c.valeur <= restant(mien));
  if (finLimitation && grosses) return jouer(finLimitation);

  // 4. Avancer ou gêner. On attaque en priorité quand l'adversaire mène ou touche au but.
  const bornes = jouables.filter((c) => c.type === BORNE);
  const offensive = ORDRE_ATTAQUES.map((n) => trouver((c) => c.nom === n)).find(Boolean);
  const menace = adverse.bornes > mien.bornes || adverse.bornes + 200 >= OBJECTIF_MANCHE;
  if (offensive && menace) return jouer(offensive);
  if (bornes.length) return jouer(bornes.reduce((a, b) => (b.valeur > a.valeur ? b : a)));
  if (offensive) return jouer(offensive);

  // 5. Bottes : encaissées en fin de manche, quand plus personne n'attaquera.
  const botte = trouver((c) => c.type === BOTTE);
  if (botte && game.pioche.length <= PIOCHE_COURTE) return jouer(botte);

  if (finLimitation) return jouer(finLimitation);

  return { type: 'defausser', carte: pireCarte(main, mien, adverse) };
}

/**
 * Un coup fourré rapporte 300 points et rend la main : il se joue toujours.
 * La fonction existe pour que l'interface traite les quatre joueurs de la même façon.
 */
export function accepteCoupFourre() {
  return true;
}
