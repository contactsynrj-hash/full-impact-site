# Full Impact — site de pré-lancement

Site statique multipage **HTML / CSS / JavaScript**, prévu pour un repository GitHub et un déploiement continu sur **Netlify**. Les formulaires sont préparés pour enregistrer les données dans **Google Sheets via Google Apps Script**.

## Structure

```text
.
├── site/                         # Répertoire publié par Netlify
│   ├── index.html                # Accueil / Hero
│   ├── probleme.html             # Bloc Problème
│   ├── solution.html             # Bloc Solution
│   ├── testeurs.html             # Liste d'attente
│   ├── demonstration.html        # Demande de démonstration
│   ├── confidentialite.html
│   ├── mentions-legales.html
│   ├── 404.html
│   └── assets/
├── google-apps-script/
│   ├── Code.gs
│   └── README.md
├── netlify.toml
└── README.md
```

## 1. Tester localement

Aucun build n'est nécessaire.

### Option simple avec Python

Depuis la racine du repository :

```bash
cd site
python3 -m http.server 8080
```

Puis ouvrez `http://localhost:8080`.

> Les pages fonctionnent localement sans serveur applicatif. Le formulaire nécessite toutefois l'URL Google Apps Script configurée à l'étape 3.

## 2. Déployer avec GitHub + Netlify

1. Décompressez le ZIP.
2. Créez un repository GitHub vide.
3. Placez **tout le contenu extrait** à la racine du repository.
4. Committez et poussez les fichiers.
5. Dans Netlify, créez un nouveau site à partir de Git et choisissez ce repository.
6. Netlify lit automatiquement `netlify.toml` : le dossier publié est `site` et aucune commande de build n'est nécessaire.
7. Lancez le déploiement.

À chaque `git push`, Netlify redéploie automatiquement la version à jour du site.

## 3. Activer les formulaires Google Sheets

Le site est volontairement livré sans identifiant Google privé ni URL de Web App, car ces éléments doivent appartenir à Full Impact.

Suivez `google-apps-script/README.md`, puis :

1. déployez `google-apps-script/Code.gs` comme Web App ;
2. copiez l'URL `/exec` ;
3. ouvrez `site/assets/js/config.js` ;
4. renseignez :

```js
window.FULL_IMPACT_CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/VOTRE_ID/exec',
  FORM_TIMEOUT_MS: 12000
};
```

Les deux formulaires écrivent dans le même onglet `Contacts` et utilisent `type_de_demande` pour distinguer `liste_attente` et `demonstration`.

## 4. Domaine et SEO

Dès que le domaine définitif est connu :

- remplacez `https://full-impact.example` dans `site/sitemap.xml` par l'URL réelle ;
- ajoutez cette URL de sitemap dans Google Search Console si vous l'utilisez ;
- si vous le souhaitez, ajoutez `Sitemap: https://votre-domaine/sitemap.xml` à `site/robots.txt`.

Chaque page possède déjà un `title`, une meta description, un H1 unique, des balises Open Graph, une structure sémantique et des textes alternatifs.

## 5. Informations juridiques à compléter avant collecte réelle

Les informations non fournies n'ont pas été inventées. Complétez les champs marqués `[À COMPLÉTER]` dans :

- `site/mentions-legales.html`
- `site/confidentialite.html`

Il faut notamment renseigner l'identité juridique, l'adresse, le contact RGPD, le directeur de publication et la durée de conservation des données.

## 6. Remplacer les images

Les visuels actuels sont des assets de travail dérivés des maquettes fournies et sont placés dans `site/assets/images/`.

Pour les remplacer, conservez idéalement les mêmes noms de fichiers ou modifiez les chemins dans les pages :

- `hero-impact.webp`
- `problem-impact.webp`
- `solution-product.webp`
- `full-impact-mark.png`
- `og-full-impact.webp`

Le logo actuel étant temporaire, `full-impact-mark.png` a été isolé pour le header et peut être remplacé facilement.

## 7. Ajouter plus tard une vidéo Hero

La V1 utilise une image optimisée pour rester rapide et déployable immédiatement. Si une vidéo définitive devient disponible, placez-la dans `site/assets/video/` et remplacez le bloc `.media-frame` de `site/index.html` par un élément `<video muted autoplay loop playsinline>` avec `hero-impact.webp` comme poster.

## 8. Polices

Anton et Montserrat sont chargées depuis Google Fonts avec des fallbacks locaux. Aucun fichier de police n'est inclus dans le repository.

## 9. Vérifications avant production

- [ ] Configurer `APPS_SCRIPT_URL`.
- [ ] Envoyer un test depuis `testeurs.html` et vérifier le Google Sheet.
- [ ] Envoyer un test depuis `demonstration.html`.
- [ ] Compléter les mentions légales et la politique de confidentialité.
- [ ] Remplacer le domaine dans `sitemap.xml`.
- [ ] Remplacer les visuels temporaires si des assets définitifs sont disponibles.
- [ ] Tester le site sur mobile et desktop après déploiement Netlify.

## Notes de conception

- Aucun framework ni dépendance npm.
- Aucun serveur permanent.
- Aucun CRM payant obligatoire.
- Les formulaires utilisent un honeypot, une validation navigateur, une prévention du double clic et une déduplication côté Apps Script.
- Les valeurs de produit visibles dans les maquettes ne sont pas présentées comme des données scientifiques réelles.
