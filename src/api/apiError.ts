
// La structure exacte renvoyée par ton Backend
export interface ApiErrorData {
  message?: string;    // Message global (ex: "Validation échouée")
  error?: string;      // Erreur serveur (ex: "Erreur lors de la mise à jour")
  erreurs?: string[];  // Tableau Joi (ex: ["name est requis", "slug unique"])
  details?: unknown;   // L'objet technique d'erreur (Prisma, etc.)
}

// Classe personnalisée pour transporter les données sans 'any'
export class ApiError extends Error {
  public readonly data: ApiErrorData;
  public readonly status: number;

  constructor(message: string, data: ApiErrorData, status: number) {
    super(message);
    this.name = "ApiError";
    this.data = data;
    this.status = status;

    // Nécessaire pour le bon fonctionnement de instanceof en TS
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
