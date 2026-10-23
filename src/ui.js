// Interface : rendu des tableaux, interactions du joueur humain, rythme des adversaires.

import { BOTTES, CARTES, libelle } from './cards.js';
import { faceCarte } from './faces.js';
import { PICTOS } from './pictos.js';
import { Game, PLAYER_NAMES, TEAM_NAMES } from './game.js';
import { accepteCoupFourre, choisirCoup } from './ai.js';
import {
  LIGNES_SCORE, OBJECTIF_MANCHE, aBotte, attaqueActive, plafond,
} from './rules.js';

const DELAIS = { coup: 900, coupFourre: 1000 };
const SIEGES = ['sud', 'ouest', 'nord', 'est'];

const $ = (id) => document.getElementById(id);
let game = new Game();
let attenteJoueur = false;
let modeDefausse = false;

/** Carte factice reconstruite à partir d'un nom, pour l'affichage des piles. */
const carteDe = (nom) => ({ type: CARTES[nom].type, nom });

// ------------------------------------------------------------ Fabrication

function elCarte(carte, { dos = false, mini = false } = {}) {
  const el = document.createElement('div');
  el.className = 'carte';
  if (mini) el.classList.add('mini');
  if (dos) {
    el.classList.add('dos');
    return el;
  }
  el.innerHTML = faceCarte(carte);
  el.setAttribute('aria-label', libelle(carte));
  return el;
}

function bouton(texte, onClick, classe = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `bouton ${classe}`.trim();
  b.innerHTML = texte;
  b.addEventListener('click', onClick);
  return b;
}

const emplacement = (contenu) => `<div class="emplacement">${contenu}</div>`;

// ----------------------------------------------------------------- Rendu

function rendreEntetes() {
  $('nom-equipe-0').textContent = TEAM_NAMES[0];
  $('nom-equipe-1').textContent = TEAM_NAMES[1];
  $('score-0').textContent = game.scores[0];
  $('score-1').textContent = game.scores[1];
  $('info-manche').textContent = `Manche ${game.manche}`;
  $('info-pioche').textContent = `Pioche ${game.pioche.length}`;
  $('info-objectif').textContent = `Partie en ${game.objectif} points`;

  for (let p = 0; p < 4; p++) {
    const etiq = $(`etiq-${p}`);
    etiq.textContent = PLAYER_NAMES[p];
    etiq.classList.toggle('actif', game.phase === 'jeu' && game.tour === p);
    etiq.classList.toggle('donneur', p === game.donneur);
    etiq.classList.toggle('partenaire', p === 2);
  }
}

/** Une botte : pictogramme éteint tant que l'équipe ne la détient pas. */
function vignetteBotte(t, nom) {
  const acquise = aBotte(t, nom);
  return `
    <span class="botte ${acquise ? 'acquise' : ''}" title="${CARTES[nom].libelle}">
      <svg viewBox="0 0 64 64" aria-hidden="true">${PICTOS[nom]()}</svg>
    </span>`;
}

function rendreTableau(equipe) {
  const t = game.tableaux[equipe];
  const el = $(`tableau-${equipe}`);
  const etat = game.etatTableau(equipe);
  const bloque = attaqueActive(t) !== null;

  const compte = {};
  for (const v of t.cartesBornes) compte[v] = (compte[v] || 0) + 1;
  const jetons = Object.keys(compte)
    .sort((a, b) => b - a)
    .map((v) => `<span class="jeton">${v}<small>×${compte[v]}</small></span>`)
    .join('');

  const batterie = t.batterie
    ? faceCarte(carteDe(t.batterie))
    : '<span class="vide">Batterie</span>';
  const vitesse = t.limitation
    ? faceCarte(carteDe('limitation'))
    : `<span class="vide">${plafond(t)} max</span>`;

  el.className = `tableau ${equipe === 0 ? 'mien' : 'adverse'}`;
  el.innerHTML = `
    <div class="tableau-tete">
      <span class="tableau-nom">${TEAM_NAMES[equipe]}</span>
      <span class="tableau-etat ${bloque ? 'bloque' : etat === 'Roule' ? 'roule' : ''}">${etat}</span>
    </div>
    <div class="compteur"><strong>${t.bornes}</strong><span>/ ${OBJECTIF_MANCHE}</span></div>
    <div class="route"><i style="width:${(t.bornes / OBJECTIF_MANCHE) * 100}%"></i></div>
    <div class="piles">
      ${emplacement(batterie)}
      ${emplacement(vitesse)}
    </div>
    <div class="bottes">${BOTTES.map((b) => vignetteBotte(t, b)).join('')}</div>
    <div class="jetons">${jetons || '<span class="vide">Aucune borne posée</span>'}</div>
    ${t.coupsFourres ? `<p class="coups-fourres">${t.coupsFourres} coup${t.coupsFourres > 1 ? 's' : ''} fourré${t.coupsFourres > 1 ? 's' : ''}</p>` : ''}`;
}

function rendreTalon() {
  $('pioche-nombre').textContent = game.pioche.length;
  $('pioche-dos').classList.toggle('epuisee', game.pioche.length === 0);

  const zone = $('dernier-coup');
  const coup = game.dernierCoup;
  zone.innerHTML = '';
  if (!coup) {
    zone.innerHTML = '<span class="vide">Dernier coup</span>';
    $('dernier-coup-nom').textContent = 'Dernier coup';
    return;
  }
  zone.appendChild(elCarte(coup.carte, { mini: true }));
  $('dernier-coup-nom').textContent =
    `${PLAYER_NAMES[coup.joueur]}${coup.defaussee ? ' · défausse' : ''}`;
}

function rendreMainJoueur() {
  const zone = $('main-0');
  zone.innerHTML = '';
  const jouables = attenteJoueur ? game.cartesJouables(0) : [];
  const estJouable = (c) => jouables.some((j) => j.id === c.id);

  for (const carte of game.mains[0]) {
    const el = elCarte(carte);
    const active = attenteJoueur && (modeDefausse || estJouable(carte));
    if (active) {
      el.classList.add(modeDefausse ? 'jetable' : 'jouable');
      el.tabIndex = 0;
      const agir = () => (modeDefausse ? tenterDefausser(carte) : tenterJouer(carte));
      el.addEventListener('click', agir);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          agir();
        }
      });
    } else if (attenteJoueur) {
      el.classList.add('interdite');
    }
    zone.appendChild(el);
  }
}

function rendreMainsAdverses() {
  for (const p of [1, 2, 3]) {
    const zone = $(`main-${p}`);
    zone.className = `main-adverse main-${SIEGES[p]}`;
    zone.innerHTML = '';
    for (let i = 0; i < game.mains[p].length; i++) {
      zone.appendChild(elCarte(null, { dos: true, mini: true }));
    }
  }
}

/** Barre sous la main : à qui de jouer, et le bouton de défausse. */
function rendreActions() {
  const zone = $('actions');
  zone.innerHTML = '';
  if (game.phase !== 'jeu') return;

  if (!attenteJoueur) {
    zone.innerHTML = `<span class="consigne">Au tour de ${PLAYER_NAMES[game.tour]}…</span>`;
    return;
  }

  const jouables = game.cartesJouables(0);
  const consigne = document.createElement('span');
  consigne.className = 'consigne';
  consigne.textContent = jouables.length
    ? 'À vous : posez une carte, ou défaussez-vous.'
    : 'Aucun coup possible : défaussez-vous.';
  zone.appendChild(consigne);
  zone.appendChild(bouton(
    modeDefausse ? 'Annuler la défausse' : 'Se défausser',
    () => {
      modeDefausse = !modeDefausse;
      rendre();
    },
    modeDefausse ? 'principal' : '',
  ));
}

function rendreJournal() {
  const zone = $('journal');
  zone.innerHTML = game.journal.slice(-9).map((l) => `<p>${l}</p>`).join('');
  zone.scrollTop = zone.scrollHeight;
}

function rendre() {
  rendreEntetes();
  rendreTableau(0);
  rendreTableau(1);
  rendreTalon();
  rendreMainJoueur();
  rendreMainsAdverses();
  rendreActions();
  rendreJournal();
}

// ------------------------------------------------------------- Panneaux

function cacherPanneaux() {
  for (const id of ['panneau-coup-fourre', 'panneau-manche', 'panneau-fin']) $(id).hidden = true;
}

function panneauCoupFourre() {
  const { attaquant, carte, botte } = game.coupFourre;
  $('coup-fourre-titre').innerHTML =
    `${PLAYER_NAMES[attaquant]} vous attaque : <strong>${libelle(carte)}</strong>.` +
    ` Vous tenez ${CARTES[botte].libelle} !`;
  const actions = $('coup-fourre-actions');
  actions.innerHTML = '';
  actions.appendChild(bouton('Coup fourré !', () => repondreCoupFourre(true), 'principal'));
  actions.appendChild(bouton('Garder la botte', () => repondreCoupFourre(false)));
  $('panneau-coup-fourre').hidden = false;
}

function panneauManche() {
  const r = game.resultat;
  $('manche-titre').textContent = game.gagnant === null
    ? 'Manche nulle : pioche et mains épuisées.'
    : `${TEAM_NAMES[game.gagnant]} boucle les 1000 bornes !`;

  const lignes = LIGNES_SCORE
    .filter(({ cle }) => r[0].lignes[cle] || r[1].lignes[cle])
    .map(({ cle, libelle: nom }) => {
      const cellule = (e) => {
        const l = r[e].lignes[cle];
        return l ? `${l.points}${l.detail ? ` <small>${l.detail}</small>` : ''}` : '—';
      };
      return `<tr><td>${nom}</td><td>${cellule(0)}</td><td>${cellule(1)}</td></tr>`;
    })
    .join('');

  $('feuille').innerHTML = `
    <tr><th></th><th>${TEAM_NAMES[0]}</th><th>${TEAM_NAMES[1]}</th></tr>
    ${lignes}
    <tr class="ligne-forte"><td>Marqué</td><td>${r[0].total}</td><td>${r[1].total}</td></tr>
    <tr><td>Total</td><td>${game.scores[0]}</td><td>${game.scores[1]}</td></tr>`;
  $('panneau-manche').hidden = false;
}

function panneauFin() {
  $('fin-titre').textContent = `${TEAM_NAMES[game.vainqueur]} remporte la partie !`;
  $('fin-detail').textContent =
    `Score final : ${game.scores[0]} — ${game.scores[1]} en ${game.manche} manches.`;
  $('panneau-fin').hidden = false;
}

// --------------------------------------------------------------- Boucle

function tenterJouer(carte) {
  if (!attenteJoueur || !game.jouer(0, carte)) return;
  attenteJoueur = false;
  boucle();
}

function tenterDefausser(carte) {
  if (!attenteJoueur || !game.defausser(0, carte)) return;
  attenteJoueur = false;
  modeDefausse = false;
  boucle();
}

function repondreCoupFourre(accepte) {
  cacherPanneaux();
  game.repondreCoupFourre(0, accepte);
  boucle();
}

function plusTard(fn, delai) {
  setTimeout(() => {
    fn();
    boucle();
  }, delai);
}

function jouerAdversaire() {
  const joueur = game.tour;
  const coup = choisirCoup(game, joueur);
  if (coup.type === 'jouer') game.jouer(joueur, coup.carte);
  else game.defausser(joueur, coup.carte);
}

function boucle() {
  attenteJoueur = game.phase === 'jeu' && game.tour === 0;
  if (!attenteJoueur) modeDefausse = false;
  cacherPanneaux();
  rendre();

  switch (game.phase) {
    case 'jeu':
      if (!attenteJoueur) plusTard(jouerAdversaire, DELAIS.coup);
      break;
    case 'coupFourre':
      if (game.coupFourre.repondant === 0) panneauCoupFourre();
      else {
        const p = game.coupFourre.repondant;
        plusTard(() => game.repondreCoupFourre(p, accepteCoupFourre()), DELAIS.coupFourre);
      }
      break;
    case 'finManche':
      panneauManche();
      break;
    case 'finPartie':
      panneauFin();
      break;
  }
}

$('btn-suivante').addEventListener('click', () => {
  game.nouvelleManche();
  boucle();
});
$('btn-rejouer').addEventListener('click', () => {
  game = new Game();
  boucle();
});
$('btn-regles').addEventListener('click', () => $('dlg-regles').showModal());
$('btn-fermer-regles').addEventListener('click', () => $('dlg-regles').close());

boucle();
