# Guide d'optimisation des données

## Problème identifié
Le fichier `prospects-data.json` fait 179MB, ce qui est trop volumineux pour un chargement web optimal.

## Solutions recommandées

### 1. Utiliser les données de test
Pour tester rapidement l'application, utilisez l'URL avec paramètre test :
```
http://localhost:3000/excel-explorer?test=true
```

### 2. Optimiser le fichier JSON principal
Créez une version allégée de vos données :

```bash
# Garder seulement les 1000 premiers enregistrements
head -n 1000 prospects-data.json > prospects-data-light.json
```

### 3. Structure attendue du JSON
```json
[
  {
    "[Company Name]": "Nom de l'entreprise",
    "[Street]": "Adresse",
    "[City]": "Ville",
    "[Zip]": "75001",
    "[Tel]": "0123456789",
    "[Email]": "contact@example.com",
    "[Website]": "www.example.com",
    "[CATEGORY]": "Restaurant"
  }
]
```

### 4. Réduire la taille du fichier
- Supprimez les colonnes inutiles
- Limitez aux 5000 premiers enregistrements
- Utilisez des noms de colonnes courts

### 5. Alternatives
- Charger les données par lots (pagination côté serveur)
- Utiliser une base de données locale
- Implémenter une recherche serveur
