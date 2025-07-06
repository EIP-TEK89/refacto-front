/**
 * Définition des signes disponibles pour la reconnaissance par IA
 * 
 * Chaque signe possède:
 * - id: identifiant unique utilisé en interne (minuscule)
 * - label: texte affiché à l'utilisateur (majuscule)
 */

export interface Sign {
  id: string;
  label: string;
}

/**
 * Liste complète des signes de l'alphabet en langue des signes
 */
export const ALPHABET_SIGNS: Sign[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
  { id: "d", label: "D" },
  { id: "e", label: "E" },
  { id: "f", label: "F" },
  { id: "g", label: "G" },
  { id: "h", label: "H" },
  { id: "i", label: "I" },
  { id: "j", label: "J" },
  { id: "k", label: "K" },
  { id: "l", label: "L" },
  { id: "m", label: "M" },
  { id: "n", label: "N" },
  { id: "o", label: "O" },
  { id: "p", label: "P" },
  { id: "q", label: "Q" },
  { id: "r", label: "R" },
  { id: "s", label: "S" },
  { id: "t", label: "T" },
  { id: "u", label: "U" },
  { id: "v", label: "V" },
  { id: "w", label: "W" },
  { id: "x", label: "X" },
  { id: "y", label: "Y" },
  { id: "z", label: "Z" }
];

/**
 * Sous-ensemble de signes pour des tests ou des niveaux débutants
 */
export const BASIC_SIGNS: Sign[] = ALPHABET_SIGNS.slice(0, 8);

export default ALPHABET_SIGNS;
