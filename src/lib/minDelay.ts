// Garantit qu'une opération asynchrone dure au moins `ms` millisecondes,
// afin que l'indicateur de chargement (avion) reste visible assez longtemps
// et ne « clignote » pas quand la réponse arrive très vite.
export async function withMinDelay<T>(promise: Promise<T>, ms = 900): Promise<T> {
  const [result] = await Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
  return result;
}
