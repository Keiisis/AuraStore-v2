// Aura Link - Content Script
console.log("⚡ Aura Link activé sur cette page");

const API_URL = "http://localhost:3666";

// Bouton Flottant Principal
const floater = document.createElement("div");
floater.innerHTML = `
  <div style="position:fixed; bottom:20px; right:20px; z-index:99999; display:flex; flex-direction:column; gap:10px;">
    <button id="aura-inject-btn" style="background:#FE7501; color:white; font-weight:bold; border:none; padding:12px 20px; border-radius:30px; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.3); font-family:sans-serif; display:flex; align-items:center; gap:8px;">
      <span>⚡</span> INJECT FILES
    </button>
  </div>
`;
document.body.appendChild(floater);

// Interaction : Injecter un fichier
document.getElementById("aura-inject-btn").addEventListener("click", async () => {
    const filePath = prompt("Chemin du fichier à envoyer à l'IA (depuis la racine du projet)\nEx: app/page.tsx");
    if (!filePath) return;

    try {
        const res = await fetch(`${API_URL}/read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath })
        });
        const data = await res.json();

        if (data.success) {
            // Trouver la zone de texte
            const inputArea = document.querySelector("textarea, [contenteditable='true']");
            if (inputArea) {
                // Pour Claude/ChatGPT qui utilisent des divs contenteditable complexes
                inputArea.focus();

                const codeBlock = `Voici le contenu du fichier \`${filePath}\`:\n\n\`\`\`tsx\n${data.content}\n\`\`\`\n\n`;

                // Méthode compatible React/ProseMirror
                if (document.execCommand) {
                    document.execCommand('insertText', false, codeBlock);
                } else {
                    inputArea.value = (inputArea.value || "") + codeBlock;
                    inputArea.dispatchEvent(new Event('input', { bubbles: true }));
                }

                // Feedback visuel
                const btn = document.getElementById("aura-inject-btn");
                const originalText = btn.innerHTML;
                btn.innerHTML = "✅ INJECTÉ !";
                setTimeout(() => btn.innerHTML = originalText, 2000);
            } else {
                alert("Zone de texte introuvable. Cliquez dans la zone de chat d'abord !");
            }
        } else {
            alert(`Erreur lecture: ${data.error}`);
        }
    } catch (e) {
        alert("Erreur connexion Aura Link (Port 3666). Vérifiez que 'node tools/aura-link/server/index.js' tourne.");
    }
});

// Observer les réponses pour ajouter "SAVE TO PROJECT"
setInterval(() => {
    const codeBlocks = document.querySelectorAll("pre");

    codeBlocks.forEach(block => {
        if (block.getAttribute("data-aura-processed")) return;

        // Bouton de sauvegarde
        const btn = document.createElement("button");
        btn.innerHTML = "💾 SAVE TO PROJECT";
        btn.style.cssText = "position:absolute; top:8px; right:60px; background:#22c55e; color:white; font-size:11px; padding:4px 8px; border-radius:4px; border:none; cursor:pointer; z-index:100; font-weight:bold; font-family:sans-serif; opacity:0.9;";

        btn.onmouseover = () => btn.style.opacity = "1";
        btn.onmouseout = () => btn.style.opacity = "0.9";

        if (getComputedStyle(block).position === 'static') {
            block.style.position = 'relative';
        }

        btn.addEventListener("click", async (e) => {
            e.stopPropagation(); // Empêcher copie standard

            const code = block.querySelector("code")?.innerText || block.innerText;
            const targetPath = prompt("Sauvegarder dans quel fichier ?\n(Laisser vide pour créer un nouveau fichier)");

            if (targetPath) {
                try {
                    await fetch(`${API_URL}/write`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filePath: targetPath, content: code })
                    });
                    btn.innerHTML = "✅ SAUVÉ !";
                    btn.style.background = "#16a34a";
                    setTimeout(() => {
                        btn.innerHTML = "💾 SAVE TO PROJECT";
                        btn.style.background = "#22c55e";
                    }, 2000);
                } catch (e) {
                    alert("Erreur d'écriture : " + e.message);
                }
            }
        });

        block.appendChild(btn);
        block.setAttribute("data-aura-processed", "true");
    });
}, 1000);
