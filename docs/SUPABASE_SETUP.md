# 🚀 Guide de Configuration Supabase pour AuraStore

## Étape 1 : Créer un compte Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"**
3. Connectez-vous avec GitHub (recommandé) ou créez un compte email

## Étape 2 : Créer un nouveau projet

1. Cliquez sur **"New Project"**
2. Remplissez les informations :
   - **Name**: `aurastore` (ou le nom de votre choix)
   - **Database Password**: Choisissez un mot de passe fort (notez-le !)
   - **Region**: Choisissez la région la plus proche de vos utilisateurs
3. Cliquez sur **"Create new project"**
4. Attendez que le projet soit prêt (environ 2 minutes)

## Étape 3 : Configurer l'authentification

1. Dans le menu de gauche, allez dans **Authentication** > **Providers**
2. Activez **Email** provider (déjà activé par défaut)
3. Configurez les options :
   - ✅ Enable Email confirmations
   - ✅ Enable Email signup
   - ✅ Double confirm email changes

## Étape 4 : Exécuter le schéma de base de données

1. Dans le menu de gauche, allez dans **SQL Editor**
2. Cliquez sur **"New query"**
3. Copiez le contenu du fichier [`supabase/schema.sql`](../supabase/schema.sql)
4. Collez-le dans l'éditeur
5. Cliquez sur **"Run"** (ou `Ctrl+Enter`)
6. Attendez que toutes les tables soient créées

## Étape 5 : Récupérer les clés API

1. Dans le menu de gauche, allez dans **Settings** > **API**
2. Copiez ces deux valeurs :
   - **Project URL** (ex: `https://xxx.supabase.co`)
   - **anon public** key (commence par `eyJ...`)

## Étape 6 : Configurer les variables d'environnement

1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez les variables suivantes :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DOMAIN=localhost
```

## Étape 7 : Tester la connexion

1. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Ouvrez [http://localhost:3000](http://localhost:3000)

3. Testez l'authentification :
   - Allez sur `/login`
   - Entrez votre email
   - Vous recevrez un magic link par email
   - Cliquez sur le lien pour vous connecter

## 🎉 Félicitations !

Votre projet AuraStore est maintenant connecté à Supabase !

## 📚 Ressources Utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Dashboard Supabase](https://supabase.com/dashboard)
- [Guide Auth Supabase](https://supabase.com/docs/guides/auth)

## 🔧 Dépannage

### Problème : "Invalid API key"
- Vérifiez que vous avez copié la bonne clé (anon public, pas service_role)
- Vérifiez que l'URL du projet est correcte

### Problème : "Email not sent"
- Vérifiez que le provider Email est activé
- Vérifiez les logs dans le dashboard Supabase

### Problème : "RLS policy violation"
- Vérifiez que vous avez exécuté le schéma SQL complet
- Vérifiez que vous êtes connecté avec le bon utilisateur
