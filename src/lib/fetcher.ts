export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error al cargar datos");
  }
  return response.json() as Promise<T>;
}
