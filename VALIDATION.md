# Validation technique — Full Impact

Validation effectuée avant création du ZIP.

## Vérifications réussies

- Syntaxe JavaScript : `main.js`, `form.js`, `config.js`.
- Syntaxe du Google Apps Script `Code.gs` (validation JavaScript statique).
- Parsing de `netlify.toml`.
- `publish = "site"` confirmé.
- Toutes les pages HTML possèdent un `title`, une meta description, un viewport et un H1 unique.
- Absence d'identifiants HTML dupliqués.
- Tous les liens, scripts, feuilles de style et images locaux référencés existent.
- Les deux formulaires contiennent tous les champs attendus, le consentement obligatoire, le honeypot et la zone de statut accessible.
- Test via serveur HTTP local : pages, CSS, JS, images, `robots.txt` et `sitemap.xml` répondent en HTTP 200.
- Les formulaires utilisent un POST compatible Apps Script sans préflight CORS, puis vérifient l'enregistrement par un contrôle JSONP ne renvoyant aucune donnée personnelle.
- Le script Apps Script crée l'onglet `Contacts`, vérifie les champs, valide le consentement et déduplique les soumissions par identifiant.

## Étapes impossibles à exécuter sans le compte Full Impact

La connexion réelle au Google Sheet ne peut pas être testée tant que :

1. le Google Sheet Full Impact n'a pas été créé ;
2. son identifiant n'a pas été renseigné dans `google-apps-script/Code.gs` ;
3. le script n'a pas été déployé comme Web App ;
4. l'URL `/exec` n'a pas été renseignée dans `site/assets/js/config.js`.

Après ces quatre étapes, effectuer une inscription et une demande de démonstration de test et vérifier la présence des deux lignes dans l'onglet `Contacts`.

## À compléter avant publication définitive

- Mentions légales.
- Contact RGPD et durée de conservation.
- Domaine réel dans `site/sitemap.xml`.
- Assets définitifs lorsqu'ils seront disponibles.
