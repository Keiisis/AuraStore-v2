const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3666; // Port "Diabolique" pour le bridge >:)

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Racine du projet (2 niveaux au-dessus de tools/aura-link/server)
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

console.log(`🔌 Aura Link Server actif sur le port ${PORT}`);
console.log(`📂 Cible projet : ${PROJECT_ROOT}`);

// 1. LIRE UN FICHIER (Pour donner du contexte à l'IA)
app.post('/read', async (req, res) => {
    try {
        const { filePath } = req.body;
        const fullPath = path.join(PROJECT_ROOT, filePath);

        const content = await fs.readFile(fullPath, 'utf-8');
        res.json({ success: true, content });
        console.log(`📖 Lu : ${filePath}`);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 2. ÉCRIRE UN FICHIER (L'IA modifie le code)
app.post('/write', async (req, res) => {
    try {
        const { filePath, content } = req.body;
        const fullPath = path.join(PROJECT_ROOT, filePath);

        // Assurer que le dossier existe
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        await fs.writeFile(fullPath, content, 'utf-8');
        res.json({ success: true });
        console.log(`✍️ Écrit : ${filePath}`);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 3. LISTER LES FICHIERS (Pour explorer le projet)
app.get('/tree', async (req, res) => {
    // Implémentation simplifiée pour lister src/app/components
    // À améliorer pour scanner récursivement
    res.json({ message: "Tree scanning not fully implemented yet" });
});

app.listen(PORT, () => {
    console.log(`🚀 Prêt à recevoir l'intelligence de l'Arena.`);
});
