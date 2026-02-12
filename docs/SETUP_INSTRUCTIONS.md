# 🚀 Instructions de Configuration Rapide

## ✅ Étape 1 : Variables d'environnement

Le fichier `.env.local` a été créé avec vos clés Supabase.

## 📋 Étape 2 : Exécuter le schéma SQL

1. Allez sur [https://supabase.com/dashboard/project/etzunbqflskvjpnathqa/sql](https://supabase.com/dashboard/project/etzunbqflskvjpnathqa/sql)
2. Cliquez sur **"New query"**
3. Copiez le contenu du fichier [`supabase/schema.sql`](../supabase/schema.sql)
4. Collez-le dans l'éditeur
5. Cliquez sur **"Run"** (ou `Ctrl+Enter`)

## 🔧 Étape 3 : Configurer l'authentification email

1. Allez sur [https://supabase.com/dashboard/project/etzunbqflskvjpnathqa/auth/templates](https://supabase.com/dashboard/project/etzunbqflskvjpnathqa/auth/templates)
2. Cliquez sur **"Email"**
3. Vérifiez que **"Enable Email confirmations"** est activé
4. Vérifiez que **"Enable Email signup"** est activé

## 🚀 Étape 4 : Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🧪 Étape 5 : Tester l'authentification

1. Allez sur [http://localhost:3000/login](http://localhost:3000/login)
2. Entrez votre email
3. Vous recevrez un magic link par email
4. Cliquez sur le lien pour vous connecter

## 🎉 Félicitations !

Votre projet AuraStore est maintenant connecté à Supabase et prêt à être utilisé !

## 📚 Documentation supplémentaire

- [Guide complet Supabase](SUPABASE_SETUP.md)
- [Architecture du projet](../docs/architecture.md)
- [PRD](../docs/prd.md)
