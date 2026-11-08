Suivi de classe — PWA iPad V26

V26 : correctif des mises à jour sur iPad (le service worker restait bloqué sur l’ancienne version) ; « Mettre à jour » réinstalle proprement l’appli sans toucher aux données ; les requêtes vers d’autres sites ne sont plus mises en cache.

V25

V25 : le mot de passe n’est plus demandé deux fois. Après le mot de passe d’ouverture, les fonctions protégées restent accessibles 2 minutes sans le redemander (Progression comprise).

V24

V24 : numéro de version affiché sous le titre ; bandeau « Nouvelle version disponible » + bouton « Rechercher une mise à jour » dans ⚙️ Réglages.
À chaque nouvelle version, modifier aussi version.json.

V23

V23 : bouton ⚙️ Réglages en haut de l’écran (il n’était visible que sur grand écran) ; « 🔐 Mot de passe » aussi sur la page Données.

V22

Nouveautés V22 : mot de passe et « mode classe »
- Réglages (⚙️) › « 🔐 Mot de passe & mode classe » : créer le mot de passe et noter le code de secours.
- À l'ouverture de l'appli (et au retour après X minutes hors de l'appli) : écran de mot de passe, aucune donnée visible avant.
- Mode classe : sur la page Élèves, bonus, malus, toute la classe, aléatoire et annuler restent libres.
  Tout le reste (réglages, données, récap, rapports, comportements, fiche élève, classe, Progression) demande le mot de passe.
- Bouton 🔓/🔒 en haut : « Accès complet » puis « Verrouiller ». L'accès complet se referme seul après X minutes sans toucher l'écran.
- Mot de passe oublié : code de secours. Le mot de passe n'est jamais stocké en clair.

V21

Nouveautés V21 :
- Progression › Réglages › « Emploi du temps Pronote (iCal) » : import du fichier .ics de Pronote (établissement reconnu automatiquement).
  Sur la période couverte, il remplace l'emploi du temps type : cours déplacés, cours supprimés, cours exceptionnels, vacances, jours fériés.
- Semaine : cours déplacés signalés, cours supprimés barrés, événements exceptionnels (DNB blanc…) affichés.
- Suivi de classe s'ouvre aussi sur la bonne classe quand un cours a été déplacé.
- Champ « lien iCal » avec actualisation automatique, si Pronote autorise la lecture directe.

V20

Corrections V20 :
- Sons bonus/malus : ne s'arrêtent plus après plusieurs attributions (audio réveillé à chaque toucher, nouvelle source à chaque son,
  boucle de silence pour passer outre le commutateur silencieux, secours par éléments audio en rotation).
- Rapport des 5 malus : toujours « 5 malus » (plus le décompte total), dates seules sans l'heure, phrase explicative claire pour les familles.

V19

Nouveautés V19 : module « Progression des classes » (progression.html)
- Emploi du temps Martel (semaines Q1/Q2) et Vayrac pré-rempli, calendrier 2026-2027 (vacances, jours fériés).
- Suivi de classe s'ouvre sur la classe du cours en cours (ou du suivant), avec la séance précédente et le travail à faire.
  Boutons ◀ Cours précédent / Cours suivant ▶ si l'emploi du temps a changé.
- Fin de cours : dictée, reformulation par Claude (clé API dans Progression › Réglages), séquence, travail à faire et date « Pour le » calculée.
- Fenêtre « Reporter dans Pronote » : titre, contenu et travail à copier, case « fait dans Pronote ».
- Semaine, historique par classe, progressions par classe ou par niveau (CSV, impression/PDF), archives annuelles et fil conducteur.
- Export des cours vers le Calendrier (.ics) avec alerte avant chaque cours.

Mise à jour : déposer index.html, app.js, verrou.js, sw.js, progression.html et README.txt à la racine du dépôt (remplacer les anciens).
Sur l'iPad : fermer complètement l'application puis la rouvrir deux fois (la barre latérale doit afficher la dernière version).

— Historique —
Suivi de classe — PWA iPad V18

Nouveautés V18 :
- Bouton « ← Retour à l'accueil » sur les pages Comportements, Récap, Rapports et Données.
- Barre de navigation du bas visible sur iPad (elle disparaissait entre 700 et 1100 px de large : plus aucun moyen de revenir en arrière).
- Sons réparés : fichiers audio générés (ignorent le commutateur silencieux), déverrouillage au premier toucher, Web Audio en secours.
  Réglages : interrupteur des sons + boutons de test (bonus / malus / alarme).
- Nouvel écran « Tableau récap » : noms uniquement, sans photos, bonus / malus / solde, tri par colonne, détail par comportement, période Total / Aujourd'hui, copie CSV, impression.
- Remise à zéro séparée des bonus et des malus (⚙️ de la classe, ou page Récap), en plus de « tout remettre à zéro ».
  Les malus se cumulent : un bonus n'interrompt jamais le décompte vers l'alerte des 5 malus (palier à 5, 10, 15…).
  Remettre les malus à zéro relance le décompte à 0.

V18 : vignettes élèves compactes (petites / moyennes / grandes, bouton 🖼️), en-tête réduit, choix bonus/malus en grille sans défilement,
  recherche qui garde le clavier ouvert.

Pour GitHub Pages : remplacer les fichiers existants à la racine du dépôt par ceux de ce dossier.
Sur l'iPad : fermer complètement l'application puis la rouvrir deux fois pour charger la V18 (la barre latérale doit afficher « V18 »).
