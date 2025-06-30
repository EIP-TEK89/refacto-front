# Internationalisation (i18n) du projet TrioSigno

Ce document décrit l'implémentation de l'internationalisation (i18n) dans le projet TrioSigno, permettant de proposer l'application en plusieurs langues.

## Technologies utilisées

- [i18next](https://www.i18next.com/) : Framework d'internationalisation pour JavaScript
- [react-i18next](https://react.i18next.com/) : Intégration de i18next pour React
- [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) : Détection automatique de la langue du navigateur

## Structure des fichiers

```
src/
  i18n/
    i18n.ts                 # Configuration principale de i18n
    locales/
      en.ts                 # Traductions en anglais
      fr.ts                 # Traductions en français
  components/
    LanguageSwitcher.tsx    # Composant pour changer de langue
    LanguageDropdown.tsx    # Composant dropdown pour changer de langue
```

## Comment utiliser l'internationalisation

### Dans un composant React

Pour utiliser les traductions dans un composant React, importez le hook `useTranslation` et utilisez la fonction `t` :

```tsx
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("my.translation.key")}</h1>
      <p>{t("another.key")}</p>
    </div>
  );
};
```

### Changer de langue

Le composant `LanguageSwitcher` permet à l'utilisateur de basculer entre les langues disponibles. Il peut être placé n'importe où dans l'application.

```tsx
import LanguageSwitcher from "./components/LanguageSwitcher";

const MyComponent = () => {
  return (
    <div>
      {/* Autres éléments */}
      <LanguageSwitcher />
    </div>
  );
};
```

## Sélecteur de langue dropdown

Un sélecteur de langue en dropdown a été implémenté spécifiquement pour la page Profile. Ce dropdown est une alternative plus esthétique au sélecteur de langue basique présent dans la barre de navigation.

### Comment utiliser le dropdown

Le composant `LanguageDropdown` peut être utilisé ainsi :

```tsx
import LanguageDropdown from "./components/LanguageDropdown";

const MyComponent = () => {
  return (
    <div className="w-1/2">
      <LanguageDropdown />
    </div>
  );
};
```

Le composant s'adaptera automatiquement à la largeur de son conteneur. Dans la page Profil, il est utilisé dans l'onglet "Settings".

### Caractéristiques du dropdown

- Affiche la langue actuellement sélectionnée
- Menu déroulant avec la liste des langues disponibles
- Indique visuellement la langue actuellement active
- Se ferme automatiquement quand on clique à l'extérieur
- Styles adaptés au thème de l'application
- Entièrement accessible

### Variantes du sélecteur de langue

Plusieurs variantes de sélecteurs de langue sont disponibles dans l'application :

1. **LanguageSwitcher** : Composant simple avec des boutons (actuellement désactivé dans la barre de navigation)

   - Utilisation : `<LanguageSwitcher />`
   - Emplacement : peut être utilisé dans la barre de navigation ou d'autres zones compactes

2. **LanguageDropdown** : Dropdown simple pour les paramètres

   - Utilisation : `<LanguageDropdown />`
   - Emplacement : utilisé dans la page de profil sous l'onglet paramètres

3. **HomeLanguageDropdown** : Dropdown amélioré avec drapeaux pour la page d'accueil
   - Utilisation : `<HomeLanguageDropdown />`
   - Emplacement : positionné en haut à droite de la page d'accueil

Chaque variante est adaptée à un contexte d'utilisation spécifique et offre différentes caractéristiques visuelles.

## Ajouter une nouvelle langue

Pour ajouter une nouvelle langue :

1. Créez un nouveau fichier dans le dossier `src/i18n/locales/`, par exemple `de.ts` pour l'allemand.
2. Copiez la structure du fichier `en.ts` et traduisez les valeurs.
3. Mettez à jour le fichier `src/i18n/i18n.ts` pour inclure la nouvelle langue :

```typescript
// Dans i18n.ts
import deTranslation from "./locales/de";

i18n.init({
  resources: {
    en: { translation: enTranslation },
    fr: { translation: frTranslation },
    de: { translation: deTranslation }, // Ajoutez cette ligne
  },
  // ...
});
```

4. Mettez à jour le composant `LanguageSwitcher` pour inclure la nouvelle langue.

## Bonnes pratiques

- Utilisez des clés hiérarchiques pour organiser les traductions (ex: `nav.home`, `auth.login`).
- Évitez de concaténer des chaînes de caractères qui nécessitent une traduction.
- Utilisez des paramètres pour les valeurs variables : `t('welcome', { name: 'John' })`.
- Gardez les fichiers de traduction organisés par sections (navigation, auth, etc.).

## Ressources

- [Documentation officielle de i18next](https://www.i18next.com/overview/introduction)
- [Documentation de react-i18next](https://react.i18next.com/)
