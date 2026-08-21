# Google Sheets / Apps Script — Full Impact

Ce dossier n'est pas exécuté par Netlify. Il contient le script à copier dans Google Apps Script pour recevoir les formulaires du site.

## Mise en place

1. Créez un Google Sheet appartenant au compte Full Impact.
2. Dans l'URL du Sheet, copiez l'identifiant situé entre `/d/` et `/edit`.
3. Ouvrez `Code.gs` et remplacez `PASTE_SPREADSHEET_ID_HERE` par cet identifiant.
4. Dans Google Drive / Apps Script, créez un projet et collez le contenu de `Code.gs`.
5. Dans Apps Script : **Deploy > New deployment > Web app**.
6. Exécutez l'application en tant que propriétaire du script et autorisez l'accès nécessaire au formulaire public.
7. Copiez l'URL de déploiement se terminant par `/exec`.
8. Dans le repository, ouvrez `site/assets/js/config.js` et collez cette URL dans `APPS_SCRIPT_URL`.
9. Committez et poussez la modification sur GitHub. Netlify redéploiera le site automatiquement.

Le script crée automatiquement un onglet `Contacts` et sa ligne d'en-têtes s'il n'existe pas.

## Colonnes

Les inscriptions et demandes de démonstration sont enregistrées dans le même onglet et différenciées par `type_de_demande` (`liste_attente` ou `demonstration`).

## Test conseillé

Après déploiement du Web App, ouvrez son URL `/exec` dans le navigateur. Une réponse JSON indiquant que le service Full Impact est actif doit apparaître. Ensuite, envoyez une inscription test depuis le site et vérifiez qu'une nouvelle ligne apparaît dans l'onglet `Contacts`.
