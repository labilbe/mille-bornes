# Mille Bornes

Jeu du **Mille Bornes** à quatre joueurs (deux équipes), jouable directement dans le navigateur
contre trois adversaires gérés par l'ordinateur. Aucun serveur, aucune dépendance : du HTML, du CSS
et des modules JavaScript natifs.

▶️ **Jouer : https://labilbe.github.io/mille-bornes/**

## Règles appliquées

Les règles suivies sont celles du jeu édité par Dujardin : partie en 5000 points, par équipes de
deux, chaque équipe tenant un seul tableau.

- Paquet de **106 cartes** : 46 bornes (25, 50, 75 ×10, 100 ×12, 200 ×4), 18 attaques,
  38 parades et 4 bottes.
- Six cartes en main. À son tour, on pioche une carte puis on en joue une — ou on s'en défausse.
- **Démarrer** : un *feu vert* doit être posé sur la batterie avant la moindre borne.
- **Attaques** : feu rouge, panne d'essence, crevaison et accident ne se jouent que sur une équipe
  qui roule ; la limitation de vitesse se pose à tout moment, sur sa propre pile. Chacune se lève
  par sa parade — feu vert, essence, roue de secours, réparations, fin de limitation — après quoi
  il faut un **nouveau feu vert** pour repartir.
- **Limitation de vitesse** : tant qu'elle tient, l'équipe ne pose que des bornes de 25 ou 50.
- **Bottes** : as du volant, citerne d'essence, increvable et véhicule prioritaire protègent
  définitivement de l'attaque correspondante et annulent celle qui est en cours. Le véhicule
  prioritaire tient lieu de feu vert permanent et couvre feu rouge comme limitation.
- **Coup fourré** : la botte abattue au moment même où l'attaque tombe l'annule, rapporte
  300 points et rend la main à son auteur, qui pioche et rejoue aussitôt.
- Deux cartes 200 bornes au plus par équipe et par manche ; les 1000 bornes se font au kilomètre
  près.
- La manche s'arrête aux 1000 bornes, ou quand la pioche et les mains sont vides — personne ne
  marque alors de prime de fin.
- **Décompte** : 1 point par borne parcourue ; 100 points par botte, 700 pour les quatre ;
  300 par coup fourré. Pour l'équipe qui boucle la manche : 400 points, plus 300 *sans les 200*,
  500 de *capot* si l'adversaire est resté à zéro borne, et 300 de *couronnement* si la pioche
  était épuisée.
- La partie s'arrête à 5000 points.

## Jouer en local

Les modules ES imposent de servir les fichiers par HTTP (un simple `file://` ne suffit pas) :

```bash
npx serve .          # ou : python -m http.server 8000
```

puis ouvrir `http://localhost:3000`.

## Tests

Le moteur est vérifié par des tests unitaires (composition du paquet, coups légaux, immunités des
bottes, plafond de vitesse, décompte d'une manche) puis par auto-parties : 500 manches jouées par
l'IA, en contrôlant la légalité de chaque coup, la conservation des 106 cartes, le respect des
1000 bornes exactes et des deux cartes 200, et l'équilibre entre les deux camps.

```bash
npm test
```

## Organisation du code

| Fichier | Rôle |
| --- | --- |
| `src/cards.js` | Paquet de 106 cartes, familles attaque / parade / botte, tri des mains. |
| `src/rules.js` | État d'un tableau, coups légaux, immunités, feuille de marque. |
| `src/game.js` | Machine à états : distribution, tours, attaques, coups fourrés, scores. |
| `src/ai.js` | Priorités de jeu des adversaires et choix de la défausse. |
| `src/faces.js` | Faces des cartes : bandeau titre, pictogramme, nature. |
| `src/pictos.js` | Pictogrammes (feux, panneaux, pneus, outils, bottes). |
| `src/ui.js` | Rendu des tableaux, interactions du joueur et rythme des adversaires. |

L'IA joue par priorités : se dégager d'une attaque (la parade d'abord, la botte seulement à
défaut — gardée en main, elle vaut peut-être un coup fourré), démarrer, se débrider quand la
limitation coûte des bornes, puis avancer ou attaquer selon que l'adversaire mène ou non. Les
bottes restantes sont posées quand la pioche s'épuise, pour en encaisser les 100 points. La
défausse part de la carte la moins utile : attaque dont l'adversaire est immunisé, parade rendue
inutile par sa propre botte, borne trop grosse pour la distance restante, feu vert en double.

## Cartes

Les faces sont dessinées en SVG dans ce dépôt : un bandeau coloré qui range la carte — bleu pour
les bornes, rouge pour les attaques, vert pour les parades, or pour les bottes —, un pictogramme
géométrique et la nature de la carte en pied. Aucune image n'est chargée.

Publié via GitHub Pages depuis la branche `main` (fichier `.nojekyll` pour servir le dossier tel quel).
