// Moteur de partie : distribution, tours de jeu, attaques, coups fourrés et scores.

import {
  ATTAQUE, BORNE, BOTTE, CARTES, PRIORITAIRE,
  botteDe, libelle, newDeck, shuffle, sortHand,
} from './cards.js';
import {
  OBJECTIF_MANCHE, PARTNER_OF, TEAM_OF, aBotte, attaqueActive, nouveauTableau,
  peutJouer, poserBotte, roule, scoreManche,
} from './rules.js';

export const PLAYER_NAMES = ['Vous', 'Ouest', 'Nord', 'Est'];
export const TEAM_NAMES = ['Vous & Nord', 'Ouest & Est'];
export const MAIN_MAX = 6;

const accorde = (j, sing, vous) => `${PLAYER_NAMES[j]} ${j === 0 ? vous : sing}`;

export class Game {
  constructor({ objectif = 5000, rng = Math.random } = {}) {
    this.objectif = objectif;
    this.rng = rng;
    this.scores = [0, 0];
    this.donneur = Math.floor(rng() * 4);
    this.manche = 0;
    this.journal = [];
    this.nouvelleManche();
  }

  log(texte) {
    this.journal.push(texte);
    if (this.journal.length > 60) this.journal.shift();
  }

  nouvelleManche() {
    this.manche += 1;
    this.donneur = (this.donneur + 1) % 4;
    const paquet = shuffle(newDeck(), this.rng);
    this.mains = [[], [], [], []];
    for (let i = 1; i <= 4; i++) {
      const p = (this.donneur + i) % 4;
      this.mains[p] = sortHand(paquet.splice(0, MAIN_MAX));
    }
    this.pioche = paquet;
    // La défausse recueille toutes les cartes sorties de la main : jetées, parades
    // et attaques consommées. Les tableaux ne gardent que les bornes et les bottes,
    // la batterie et la limitation n'en retenant que le nom.
    this.defausse = [];
    this.tableaux = [nouveauTableau(), nouveauTableau()];
    this.dernierCoup = null;   // {joueur, carte, defaussee}, pour l'affichage
    this.coupFourre = null;    // {attaquant, carte, repondant, botte} en attente de réponse
    this.gagnant = null;
    this.resultat = null;
    this.phase = 'jeu';
    this.tour = (this.donneur + 1) % 4;
    this.log(`— Manche ${this.manche} — donneur : ${PLAYER_NAMES[this.donneur]}`);
    this.piocher(this.tour);
  }

  // ------------------------------------------------------------- Accès

  tableauDe(joueur) {
    return this.tableaux[TEAM_OF[joueur]];
  }

  tableauAdverse(joueur) {
    return this.tableaux[1 - TEAM_OF[joueur]];
  }

  /** Cartes jouables par le joueur dont c'est le tour. */
  cartesJouables(joueur) {
    if (this.phase !== 'jeu' || joueur !== this.tour) return [];
    const mien = this.tableauDe(joueur);
    const adverse = this.tableauAdverse(joueur);
    return this.mains[joueur].filter((c) => peutJouer(c, mien, adverse));
  }

  piocher(joueur) {
    if (!this.pioche.length) return null;
    const carte = this.pioche.pop();
    this.mains[joueur] = sortHand([...this.mains[joueur], carte]);
    return carte;
  }

  // -------------------------------------------------------------- Coups

  /** Pose une carte de la main de `joueur`. */
  jouer(joueur, carte) {
    if (this.phase !== 'jeu' || joueur !== this.tour) return false;
    const enMain = this.mains[joueur].find((c) => c.id === carte.id);
    if (!enMain) return false;
    const mien = this.tableauDe(joueur);
    const adverse = this.tableauAdverse(joueur);
    if (!peutJouer(enMain, mien, adverse)) return false;

    this.retirer(joueur, enMain);
    this.dernierCoup = { joueur, carte: enMain, defaussee: false };

    if (enMain.type === ATTAQUE) {
      const riposte = this.chercherCoupFourre(joueur, enMain);
      if (riposte !== null) {
        // L'attaque reste en suspens le temps que la défense annonce son coup fourré.
        this.coupFourre = {
          attaquant: joueur, carte: enMain, repondant: riposte, botte: botteDe(enMain.nom),
        };
        this.phase = 'coupFourre';
        return true;
      }
      this.appliquerAttaque(joueur, enMain);
    } else {
      this.appliquerCarte(joueur, enMain);
    }

    this.finirTour();
    return true;
  }

  /** Se défausser : la carte part sur la pile, le tour s'achève. */
  defausser(joueur, carte) {
    if (this.phase !== 'jeu' || joueur !== this.tour) return false;
    const enMain = this.mains[joueur].find((c) => c.id === carte.id);
    if (!enMain) return false;
    this.retirer(joueur, enMain);
    this.defausse.push(enMain);
    this.dernierCoup = { joueur, carte: enMain, defaussee: true };
    this.log(`${accorde(joueur, 'se défausse', 'vous défaussez')} de ${libelle(enMain)}.`);
    this.finirTour();
    return true;
  }

  retirer(joueur, carte) {
    this.mains[joueur] = this.mains[joueur].filter((c) => c !== carte);
  }

  /** Carte posée sur son propre tableau : borne, parade ou botte. */
  appliquerCarte(joueur, carte) {
    const t = this.tableauDe(joueur);
    if (carte.type === BORNE) {
      t.bornes += carte.valeur;
      t.cartesBornes.push(carte.valeur);
      if (carte.valeur === 200) t.deuxCents += 1;
      this.log(`${accorde(joueur, 'avance', 'avancez')} de ${carte.valeur} bornes (${t.bornes}).`);
      return;
    }
    if (carte.type === BOTTE) {
      poserBotte(t, carte.nom);
      this.log(`${accorde(joueur, 'pose', 'posez')} ${libelle(carte)} !`);
      return;
    }
    if (CARTES[carte.nom].vitesse) t.limitation = false;
    else t.batterie = carte.nom;
    this.defausse.push(carte);
    this.log(`${accorde(joueur, 'joue', 'jouez')} ${libelle(carte)}.`);
  }

  appliquerAttaque(joueur, carte) {
    const t = this.tableauAdverse(joueur);
    if (CARTES[carte.nom].vitesse) t.limitation = true;
    else t.batterie = carte.nom;
    this.defausse.push(carte);
    this.log(
      `${accorde(joueur, 'attaque', 'attaquez')} ${TEAM_NAMES[1 - TEAM_OF[joueur]]}` +
      ` : ${libelle(carte)}.`,
    );
  }

  /**
   * Un défenseur tient-il la botte de l'attaque ? Le joueur humain est servi en
   * premier quand les deux coéquipiers la détiennent — le cas est rarissime.
   */
  chercherCoupFourre(attaquant, carte) {
    const botte = botteDe(carte.nom);
    const cible = 1 - TEAM_OF[attaquant];
    const candidats = [0, 1, 2, 3].filter(
      (p) => TEAM_OF[p] === cible && this.mains[p].some((c) => c.type === BOTTE && c.nom === botte),
    );
    return candidats.length ? candidats[0] : null;
  }

  /**
   * Réponse à une attaque parable par une botte.
   * Le coup fourré annule l'attaque, vaut 300 points et rend la main à son auteur.
   */
  repondreCoupFourre(joueur, accepte) {
    if (this.phase !== 'coupFourre' || joueur !== this.coupFourre.repondant) return false;
    const { attaquant, carte, botte } = this.coupFourre;
    this.coupFourre = null;

    if (!accepte) {
      this.phase = 'jeu';
      this.appliquerAttaque(attaquant, carte);
      this.finirTour();
      return true;
    }

    const laBotte = this.mains[joueur].find((c) => c.type === BOTTE && c.nom === botte);
    this.retirer(joueur, laBotte);
    const t = this.tableauDe(joueur);
    poserBotte(t, botte);
    t.coupsFourres += 1;
    this.defausse.push(carte);
    this.dernierCoup = { joueur, carte: laBotte, defaussee: false };
    this.log(
      `${accorde(joueur, 'contre', 'contrez')} ${libelle(carte)}` +
      ` : coup fourré, ${libelle(laBotte)} !`,
    );

    // L'auteur du coup fourré reprend la main sur-le-champ.
    this.phase = 'jeu';
    this.tour = joueur;
    this.piocher(joueur);
    this.verifierFin();
    return true;
  }

  // -------------------------------------------------------------- Tours

  finirTour() {
    if (this.verifierFin()) return;
    let suivant = this.tour;
    for (let i = 0; i < 4; i++) {
      suivant = (suivant + 1) % 4;
      this.piocher(suivant);
      if (this.mains[suivant].length) {
        this.tour = suivant;
        return;
      }
    }
    // Plus personne ne tient de carte : la manche s'arrête faute de combattants.
    this.terminerManche(null);
  }

  /** Fin de manche par les 1000 bornes, ou par épuisement de la pioche et des mains. */
  verifierFin() {
    const atteint = this.tableaux.findIndex((t) => t.bornes >= OBJECTIF_MANCHE);
    if (atteint !== -1) {
      this.terminerManche(atteint);
      return true;
    }
    if (!this.pioche.length && this.mains.every((m) => m.length === 0)) {
      this.terminerManche(null);
      return true;
    }
    return false;
  }

  terminerManche(gagnant) {
    this.gagnant = gagnant;
    const scores = scoreManche({
      tableaux: this.tableaux,
      gagnant,
      piocheVide: this.pioche.length === 0,
    });
    this.resultat = scores;
    this.scores[0] += scores[0].total;
    this.scores[1] += scores[1].total;
    this.phase = 'finManche';

    this.log(
      gagnant === null
        ? 'Manche nulle : la pioche et les mains sont épuisées.'
        : `${TEAM_NAMES[gagnant]} atteint les 1000 bornes !`,
    );
    this.log(`Score : ${TEAM_NAMES[0]} ${this.scores[0]} — ${TEAM_NAMES[1]} ${this.scores[1]}`);

    if (Math.max(...this.scores) >= this.objectif && this.scores[0] !== this.scores[1]) {
      this.phase = 'finPartie';
      this.vainqueur = this.scores[0] > this.scores[1] ? 0 : 1;
      this.log(`Partie terminée : ${TEAM_NAMES[this.vainqueur]} l'emporte.`);
    }
  }

  partenaire(joueur) {
    return PARTNER_OF[joueur];
  }

  /** Résumé d'un tableau pour l'affichage. */
  etatTableau(equipe) {
    const t = this.tableaux[equipe];
    const attaque = attaqueActive(t);
    if (attaque) return CARTES[attaque].libelle;
    if (!roule(t)) return "À l'arrêt";
    if (t.limitation && !aBotte(t, PRIORITAIRE)) return 'Bridé à 50';
    return 'Roule';
  }
}
