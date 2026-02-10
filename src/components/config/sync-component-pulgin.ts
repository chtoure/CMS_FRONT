import { type Plugin, type HmrContext } from 'vite';
import { pathToFileURL } from 'node:url'; // Import indispensable pour Windows

const syncComponentsPlugin = (): Plugin => {
  return {
    name: 'vite-plugin-sync-components',
    async handleHotUpdate({ file }: HmrContext) {
      // On cible uniquement le fichier de config
      if (file.endsWith('src/components/config/config-component.ts')) {

        // On transforme le chemin en URL valide (gère les espaces et Windows)
        // On ajoute un timestamp (?t=...) pour forcer Node à recharger le fichier
        //    sinon il garde l'ancienne version en cache.
        const fileUrl = `${pathToFileURL(file).href}?t=${Date.now()}`;

        // Import direct (Node.js s'occupe du TS si tu es en ts-node ou via le runtime de Vite)
        const module = await import(fileUrl);
        const componentsConfig = module.componentsConfig;

        if (!componentsConfig) {
          console.error("componentsConfig introuvable.");
          return;
        }

        // console.log(componentsConfig);
        console.log("Synchronisation des composants...");

        try {
            const response = await fetch('http://localhost:3000/components', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                // On s'assure que le JSON est bien formé
                body: JSON.stringify(componentsConfig)
            });

            if (response.ok) {
                console.log("Synchronisation reussie ! Statut:", response.status);
            } else {
                const errorText = await response.text();
                console.error(`Erreur Backend (${response.status}):`, errorText);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (fetchError: any) {
            // C'EST ICI que tu vas voir si c'est un problème de connexion
            console.error("Erreur CRITIQUE lors du fetch :");
            console.error("- Message:", fetchError.message);
            console.error("- Code:", fetchError.code); // Ex: ECONNREFUSED
        }
      }
    }

  }
}

export default syncComponentsPlugin;
