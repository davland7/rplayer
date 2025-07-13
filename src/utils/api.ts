// Fichier centralisé pour les appels API
// Permet de partager les appels entre les différentes routes

// Fonction pour récupérer les tags
export async function fetchTags() {
  // Remplacer par ton vrai appel API quand tu seras prêt
  // Par exemple: const response = await fetch('https://api.radio-browser.info/json/tags');

  // Pour l'instant, on retourne des données de test
  return [
    { id: 1, name: 'rock', slug: 'rock', count: 250 },
    { id: 2, name: 'pop', slug: 'pop', count: 200 },
    { id: 3, name: 'jazz', slug: 'jazz', count: 150 },
    { id: 4, name: 'classical', slug: 'classical', count: 100 }
  ];
}

// Fonction pour récupérer les stations par tag
export async function fetchStationsByTag(tag: string) {
  // Remplacer par ton vrai appel API
  // Par exemple: const response = await fetch(`https://api.radio-browser.info/json/stations/bytagexact/${tag}`);

  // Pour l'instant, des données de test
  return [
    { id: '101', name: `${tag} Station 1`, url: 'https://example.com/stream1' },
    { id: '102', name: `${tag} Station 2`, url: 'https://example.com/stream2' }
  ];
}

// Fonction pour récupérer une station par ID
export async function fetchStationById(id: string) {
  // Remplacer par ton vrai appel API
  // Par exemple: const response = await fetch(`https://api.radio-browser.info/json/stations/byid/${id}`);

  return {
    id,
    name: `Station ${id}`,
    url: 'https://example.com/stream'
  };
}
