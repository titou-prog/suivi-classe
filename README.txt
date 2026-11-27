© 2026 Tristan Zanchi — tous droits réservés (voir LICENCE.txt).

Suivi de classe — PWA iPad V33

V33 : Progression › QCM › onglet « 📄 Fiche (PDF / Word) » — créer un QCM à partir d'une fiche de cours.
- Choisir une fiche PDF ou Word (.docx) enregistrée dans Fichiers (par ex. téléchargée depuis une capsule Digipad).
- Ou l'export complet d'un pad Digipad (.zip) : l'appli liste toutes les fiches PDF/Word du pad (avec le titre de la capsule).
- Le PDF est envoyé tel quel à l'IA (Gemini ou Claude) qui le lit entièrement ; le texte des fiches Word est extrait sur l'iPad.
- Type (vérification rapide / évaluation), nombre de questions, consigne facultative, puis « ▶ Lancer en direct (scan) ».
- Digipad n'autorise pas la lecture directe des pads par une autre appli : on passe par le fichier téléchargé ou l'export du pad.

Suivi de classe — PWA iPad V32

V32 : QCM en direct — les cartes QCMCam déjà imprimées (n° 1 à 30) sont reconnues.
- Réglages › Jeu de cartes : « Cartes QCMCam » (par défaut) ou « Cartes QCMScan » (1 à 100).
- Les mêmes cartes servent pour toutes les classes (l'élève n° 5 de chaque classe prend la carte 5, numéros de Progression).
- Onglet Cartes : réimpression à l'identique d'une carte QCMCam perdue.
- Avertissement si un élève a un numéro de carte supérieur à 30.

Suivi de classe — PWA iPad V31

V31 : « QCM en direct » (qcm.html) — les QCM se font maintenant directement sur l’iPad, sans QCMCam.
- Menu ☰ › « QCM en direct » : la caméra de l’iPad lit les cartes des élèves (numéro + lettre A/B/C/D selon le sens de la carte).
- Les classes de Suivi de classe sont reprises automatiquement, avec les numéros de carte de Progression (inchangés).
- Progression › QCM et Trace écrite : bouton « ▶ Lancer en direct (scan) » : le QCM généré s’ouvre prêt à démarrer, classe présélectionnée.
- Onglet Cartes : impression des cartes de vote nominatives ou numérotées (1 à 20 par page A4). Les cartes QCMCam ne sont pas reconnues : imprimer les nouvelles.
- Séance : question projetée, scan, vignettes des élèves, correction avec répartition, saisie manuelle d’un vote, résultats et note sur 20, export CSV.
- Import : sauvegarde intégrale QCMCam (.json), Markdown, Aiken. Même mot de passe que le reste de l’appli.
- Nouveau fichier à déposer : qcm.html (avec index.html, app.js, sw.js, progression.html, trace.html, version.json, README.txt).

Suivi de classe — PWA iPad V29

V29 : QCM pour QCMCam (menu ☰ › QCM, ou onglet 🎯 QCM de Progression) : fichiers de classes avec numéros de cartes stables, QCM express depuis la dictée d’une séance, évaluation de fin de séquence (séances + fiches Trace écrite). Bouton « 🎯 QCM express » dans la fiche de fin de cours.

V28

V28 : fin de cours — bouton « 🎙️ Enregistrer » : l’audio est enregistré puis Gemini l’écoute, le transcrit et remplit titre, contenu et devoirs (la reconnaissance vocale de Safari ne fonctionne pas dans l’appli écran d’accueil).

V27

Nouveautés V27 :
- Page Élèves allégée : sélecteur de classe, 🔎, 🎲 Hasard, 👥 Toute la classe, ↩️ Annuler (seulement après une action). Tout le reste passe dans le menu ☰.
- Menu ☰ (en haut à droite) : En classe, Cours, Suivi des élèves, Classe, Affichage (taille, tri, compteurs, thème), Application.
- Bandeau du cours sur une ligne ; « séance précédente » et devoirs au toucher.
- Module « Trace écrite » intégré (trace.html) : enregistrement, photos du tableau, fiche IA, synthèse, QCM.
  Même mot de passe, classes reprises de Suivi de classe, clé Gemini partagée avec Progression.
- Barre de navigation du bas supprimée.

V26

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

Mise à jour : déposer index.html, app.js, verrou.js, sw.js, progression.html, trace.html, version.json et README.txt à la racine du dépôt (remplacer les anciens).
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
