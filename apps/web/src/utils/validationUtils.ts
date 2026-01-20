/**
 * Utilitaires de validation côté client pour OneEats
 * Validation des formulaires avant soumission à l'API
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// ============================================================================
// VALIDATION DES PRIX
// ============================================================================

/**
 * Valide un prix (doit être positif ou zéro)
 */
export const validatePrice = (price: number | string | undefined): ValidationResult => {
  if (price === undefined || price === null || price === '') {
    return { isValid: false, error: 'Le prix est requis' };
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return { isValid: false, error: 'Le prix doit être un nombre valide' };
  }

  if (numPrice < 0) {
    return { isValid: false, error: 'Le prix ne peut pas être négatif' };
  }

  if (numPrice > 9999.99) {
    return { isValid: false, error: 'Le prix ne peut pas dépasser 9999.99€' };
  }

  return { isValid: true };
};

/**
 * Formate un prix pour l'affichage (2 décimales)
 */
export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
};

// ============================================================================
// VALIDATION EMAIL
// ============================================================================

/**
 * Expression régulière pour validation email (RFC 5322 simplifiée)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Valide une adresse email
 */
export const validateEmail = (email: string | undefined): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'L\'email est requis' };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'L\'email est trop long' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }

  return { isValid: true };
};

// ============================================================================
// VALIDATION TÉLÉPHONE
// ============================================================================

/**
 * Expression régulière pour téléphone français
 * Accepte: 0612345678, 06 12 34 56 78, 06.12.34.56.78, +33612345678
 */
const PHONE_REGEX_FR = /^(?:(?:\+|00)33[\s.-]?(?:\(0\)[\s.-]?)?|0)[1-9](?:(?:[\s.-]?\d{2}){4})$/;

/**
 * Valide un numéro de téléphone français
 */
export const validatePhone = (phone: string | undefined): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Le téléphone est requis' };
  }

  const trimmedPhone = phone.trim();

  // Supprimer les espaces et caractères de formatage pour la validation
  const cleanPhone = trimmedPhone.replace(/[\s.-]/g, '');

  if (cleanPhone.length < 10) {
    return { isValid: false, error: 'Le numéro de téléphone est trop court' };
  }

  if (!PHONE_REGEX_FR.test(trimmedPhone)) {
    return { isValid: false, error: 'Format de téléphone invalide (ex: 06 12 34 56 78)' };
  }

  return { isValid: true };
};

/**
 * Valide un téléphone de manière optionnelle (accepte vide)
 */
export const validatePhoneOptional = (phone: string | undefined): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: true };
  }
  return validatePhone(phone);
};

/**
 * Formate un numéro de téléphone français
 */
export const formatPhone = (phone: string): string => {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
};

// ============================================================================
// VALIDATION MOT DE PASSE
// ============================================================================

/**
 * Valide la force d'un mot de passe
 * Minimum: 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
 */
export const validatePassword = (password: string | undefined): ValidationResult => {
  if (!password || password === '') {
    return { isValid: false, error: 'Le mot de passe est requis' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins une majuscule' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins une minuscule' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins un chiffre' };
  }

  return { isValid: true };
};

/**
 * Valide un mot de passe optionnel (pour édition)
 */
export const validatePasswordOptional = (password: string | undefined): ValidationResult => {
  if (!password || password === '') {
    return { isValid: true };
  }
  return validatePassword(password);
};

// ============================================================================
// VALIDATION TEXTE
// ============================================================================

/**
 * Valide un champ texte requis
 */
export const validateRequired = (value: string | undefined, fieldName: string = 'Ce champ'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} est requis` };
  }
  return { isValid: true };
};

/**
 * Valide la longueur d'un texte
 */
export const validateLength = (
  value: string | undefined,
  min: number,
  max: number,
  fieldName: string = 'Ce champ'
): ValidationResult => {
  if (!value) {
    if (min > 0) {
      return { isValid: false, error: `${fieldName} est requis` };
    }
    return { isValid: true };
  }

  if (value.length < min) {
    return { isValid: false, error: `${fieldName} doit contenir au moins ${min} caractères` };
  }

  if (value.length > max) {
    return { isValid: false, error: `${fieldName} ne peut pas dépasser ${max} caractères` };
  }

  return { isValid: true };
};

// ============================================================================
// VALIDATION URL
// ============================================================================

/**
 * Valide une URL
 */
export const validateUrl = (url: string | undefined): ValidationResult => {
  if (!url || url.trim() === '') {
    return { isValid: true }; // URL optionnelle par défaut
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'URL invalide' };
  }
};

// ============================================================================
// HELPERS DE FORMULAIRE
// ============================================================================

/**
 * Nettoie une chaîne de caractères (trim + suppression espaces multiples)
 */
export const sanitizeString = (value: string | undefined): string => {
  if (!value) return '';
  return value.trim().replace(/\s+/g, ' ');
};

/**
 * Vérifie si un objet d'erreurs contient des erreurs
 */
export const hasErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some(error => error !== undefined && error !== '');
};

/**
 * Crée un validateur de formulaire réutilisable
 */
export const createFormValidator = <T extends Record<string, unknown>>(
  validators: { [K in keyof T]?: (value: T[K]) => ValidationResult }
) => {
  return (data: T): FormErrors => {
    const errors: FormErrors = {};

    for (const key in validators) {
      const validator = validators[key];
      if (validator) {
        const result = validator(data[key]);
        if (!result.isValid) {
          errors[key] = result.error;
        }
      }
    }

    return errors;
  };
};
