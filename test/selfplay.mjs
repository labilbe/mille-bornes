// Vérification du moteur : règles unitaires, puis auto-parties jouées par l'IA.
import assert from 'node:assert/strict';
import { Game, MAIN_MAX } from '../src/game.js';
import { accepteCoupFourre, choisirCoup } from '../src/ai.js';
import {
  LIMITE_VITESSE, MAX_200, OBJECTIF_MANCHE, POINTS, aBotte, attaqueActive,
  nouveauTableau, peutJouer, plafond, poserBotte, roule, scoreManche,
} from '../src/rules.js';
import {
  ACCIDENT, BORNE, CARTES, CREVAISON, FEU_ROUGE, FEU_VERT, FIN_LIMITATION, LIMITATION,
  PRIORITAIRE, REPARATIONS, ROUE, newDeck,
} from '../src/cards.js';

const carte = (nom) => ({ type: CARTES[nom].type, nom, id: nom });
const borne = (valeur) => ({ type: BORNE, nom: `borne-${valeur}`, valeur, id: `b${valeur}` });

// ------------------------------------------------------------- Le paquet

const paquet = newDeck();
assert.equal(paquet.length, 106, 'le paquet compte 106 cartes');
assert.equal(paquet.filter((c) => c.type === BORNE).length, 46);
assert.equal(
  paquet.filter((c) => c.type === BORNE).reduce((s, c) => s + c.valeur, 0),
  250 + 500 + 750 + 1200 + 800,
  'les bornes totalisent 3500 km',
);
assert.equal(paquet.filter((c) => c.nom === FEU_VERT).length, 14);
assert.equal(paquet.filter((c) => c.type === 'botte').length, 4);

// --------------------------------------------------------- Coups légaux

let t = nouveauTableau();
const adverse = nouveauTableau();

// On ne roule pas sans feu vert.
assert.equal(peutJouer(borne(25), t, adverse), false, 'pas de borne sans feu vert');
assert.equal(peutJouer(carte(FEU_VERT), t, adverse), true);
t.batterie = FEU_VERT;
assert.equal(roule(t), true);
assert.equal(peutJouer(borne(200), t, adverse), true);
assert.equal(peutJouer(carte(FEU_VERT), t, adverse), false, 'un feu vert suffit');

// Une attaque bloque, et seule sa parade la lève.
t.batterie = ACCIDENT;
assert.equal(roule(t), false);
assert.equal(attaqueActive(t), ACCIDENT);
assert.equal(peutJouer(carte(ROUE), t, adverse), false, 'la roue ne répare pas un accident');
assert.equal(peutJouer(carte(FEU_VERT), t, adverse), false, 'il faut réparer avant de repartir');
assert.equal(peutJouer(carte(REPARATIONS), t, adverse), true);
t.batterie = REPARATIONS;
assert.equal(roule(t), false, 'réparé mais arrêté : il faut un nouveau feu vert');
assert.equal(peutJouer(carte(FEU_VERT), t, adverse), true);

// Limitation de vitesse : elle bride sans arrêter.
t = nouveauTableau();
t.batterie = FEU_VERT;
t.limitation = true;
assert.equal(roule(t), true);
assert.equal(plafond(t), LIMITE_VITESSE);
assert.equal(peutJouer(borne(75), t, adverse), false);
assert.equal(peutJouer(borne(50), t, adverse), true);
assert.equal(peutJouer(carte(FIN_LIMITATION), t, adverse), true);

// Les 1000 bornes se font au kilomètre près, et avec deux cartes 200 au plus.
t = nouveauTableau();
t.batterie = FEU_VERT;
t.bornes = 950;
assert.equal(peutJouer(borne(75), t, adverse), false, 'on ne dépasse pas les 1000');
assert.equal(peutJouer(borne(50), t, adverse), true);
t.bornes = 0;
t.deuxCents = MAX_200;
assert.equal(peutJouer(borne(200), t, adverse), false, 'deux cartes 200 par manche');

// Attaques : il faut une cible qui roule, et qui ne soit pas immunisée.
const cible = nouveauTableau();
assert.equal(peutJouer(carte(FEU_ROUGE), t, cible), false, 'on n\'attaque pas une équipe arrêtée');
assert.equal(peutJouer(carte(LIMITATION), t, cible), true, 'la limitation frappe même à l\'arrêt');
cible.batterie = FEU_VERT;
assert.equal(peutJouer(carte(CREVAISON), t, cible), true);
poserBotte(cible, PRIORITAIRE);
assert.equal(peutJouer(carte(FEU_ROUGE), t, cible), false, 'le prioritaire couvre le feu rouge');
assert.equal(peutJouer(carte(LIMITATION), t, cible), false);
assert.equal(peutJouer(carte(CREVAISON), t, cible), true, 'mais pas la crevaison');

// Le véhicule prioritaire tient lieu de feu vert permanent et lève la limitation.
const prio = nouveauTableau();
prio.limitation = true;
poserBotte(prio, PRIORITAIRE);
assert.equal(prio.limitation, false);
assert.equal(roule(prio), true, 'le prioritaire roule sans feu vert');
assert.equal(peutJouer(carte(FEU_VERT), prio, adverse), false);

// Une botte posée sur l'attaque correspondante l'annule, sans dispenser du feu vert.
const touche = nouveauTableau();
touche.batterie = CREVAISON;
poserBotte(touche, 'increvable');
assert.equal(touche.batterie, null);
assert.equal(roule(touche), false);
assert.equal(aBotte(touche, 'increvable'), true);

// ---------------------------------------------------------- Feuille de marque

const vainqueur = nouveauTableau();
vainqueur.bornes = OBJECTIF_MANCHE;
vainqueur.cartesBornes = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
vainqueur.bottes = ['as-du-volant', 'citerne', 'increvable', PRIORITAIRE];
vainqueur.coupsFourres = 1;
const perdant = nouveauTableau();

const marque = scoreManche({ tableaux: [vainqueur, perdant], gagnant: 0, piocheVide: true });
assert.equal(
  marque[0].total,
  1000 + 4 * POINTS.botte + POINTS.toutesBottes + POINTS.coupFourre
    + POINTS.manche + POINTS.sansLes200 + POINTS.capot + POINTS.couronnement,
  'la manche idéale : 1000 km, les quatre bottes, un coup fourré et toutes les primes',
);
assert.equal(marque[0].total, 3500);
assert.equal(marque[1].total, 0);

// Les primes de fin ne vont qu'au gagnant ; les bornes et les bottes restent acquises.
const nulle = scoreManche({ tableaux: [vainqueur, perdant], gagnant: null, piocheVide: true });
assert.equal(nulle[0].total, 1000 + 400 + 300 + 300);
assert.equal(nulle[0].lignes.manche, undefined);

// Avec une carte 200, pas de prime « sans les 200 ».
const avec200 = nouveauTableau();
avec200.bornes = OBJECTIF_MANCHE;
avec200.cartesBornes = [200, 200, 200, 200, 200];
const m200 = scoreManche({ tableaux: [avec200, perdant], gagnant: 0, piocheVide: false });
assert.equal(m200[0].lignes.sansLes200, undefined);
assert.equal(m200[0].total, 1000 + POINTS.manche + POINTS.capot);

// ------------------------------------------------------------ Auto-parties

let graine = 20251023;
const rng = () => {
  graine = (graine * 1103515245 + 12345) % 2147483648;
  return graine / 2147483648;
};

const g = new Game({ objectif: Number.POSITIVE_INFINITY, rng });
const MANCHES = 500;
let manches = 0;
let coups = 0;
let coupsFourres = 0;
let nulles = 0;
let bottes = 0;
const gagnantes = [0, 0];

for (let i = 0; i < 500000 && manches < MANCHES; i++) {
  if (g.phase === 'jeu') {
    const joueur = g.tour;
    assert.ok(g.mains[joueur].length > 0, 'on ne joue pas sans carte');
    assert.ok(g.mains[joueur].length <= MAIN_MAX + 1, 'main de sept cartes au plus');
    const coup = choisirCoup(g, joueur);
    const ok = coup.type === 'jouer'
      ? g.jouer(joueur, coup.carte)
      : g.defausser(joueur, coup.carte);
    assert.ok(ok, `coup refusé : ${JSON.stringify(coup)}`);
    coups += 1;
  } else if (g.phase === 'coupFourre') {
    const { repondant, botte } = g.coupFourre;
    assert.ok(g.mains[repondant].some((c) => c.nom === botte), 'coup fourré sans la botte');
    g.repondreCoupFourre(repondant, accepteCoupFourre());
    coupsFourres += 1;
  } else if (g.phase === 'finManche') {
    for (const t of g.tableaux) {
      assert.ok(t.bornes <= OBJECTIF_MANCHE, `${t.bornes} bornes : on a dépassé les 1000`);
      assert.equal(t.bornes, t.cartesBornes.reduce((s, v) => s + v, 0), 'bornes incohérentes');
      assert.ok(t.deuxCents <= MAX_200, 'plus de deux cartes 200 dans la manche');
      assert.ok(t.bottes.length <= 4);
      bottes += t.bottes.length;
    }
    if (g.gagnant === null) {
      nulles += 1;
      assert.ok(g.tableaux.every((t) => t.bornes < OBJECTIF_MANCHE));
    } else {
      gagnantes[g.gagnant] += 1;
      assert.equal(g.tableaux[g.gagnant].bornes, OBJECTIF_MANCHE);
      assert.ok(g.resultat[g.gagnant].lignes.manche.points === POINTS.manche);
    }
    // Les cartes ne se perdent pas en route : mains + pioche + tableaux + défausse = 106.
    const enMain = g.mains.reduce((s, m) => s + m.length, 0);
    const surTable = g.tableaux.reduce(
      (s, t) => s + t.cartesBornes.length + t.bottes.length,
      0,
    );
    assert.equal(enMain + g.pioche.length + surTable + g.defausse.length, 106, 'cartes égarées');
    manches += 1;
    g.nouvelleManche();
  } else {
    throw new Error(`phase inattendue : ${g.phase}`);
  }
}

assert.equal(manches, MANCHES, 'toutes les manches doivent aboutir');
const abouties = MANCHES - nulles;
assert.ok(abouties >= MANCHES * 0.6, `trop de manches nulles : ${nulles}/${MANCHES}`);
const ecart = Math.abs(gagnantes[0] - gagnantes[1]) / abouties;
assert.ok(ecart < 0.2, `les deux camps doivent se valoir : ${gagnantes.join(' / ')}`);
assert.ok(coupsFourres > MANCHES * 0.5, `coups fourrés trop rares : ${coupsFourres}`);

console.log(`OK — ${manches} manches jouées, ${coups} coups, ${coupsFourres} coups fourrés.`);
console.log(`Manches gagnées : ${gagnantes[0]} / ${gagnantes[1]}, ${nulles} nulles.`);
console.log(`Bottes posées : ${(bottes / manches).toFixed(2)} par manche.`);
console.log(`Scores cumulés : ${g.scores[0]} — ${g.scores[1]}`);
