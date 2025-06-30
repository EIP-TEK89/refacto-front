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
