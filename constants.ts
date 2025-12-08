import { Category, Challenge } from './types';
import { Sparkles, Wind, Move, PenTool, CheckCircle } from 'lucide-react';

export const CATEGORY_CONFIG = {
  [Category.MOVEMENT]: { label: 'Bewegung', icon: Move, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  [Category.BREATHING]: { label: 'Atmen', icon: Wind, color: 'text-sky-500', bg: 'bg-sky-100' },
  [Category.FOCUS]: { label: 'Fokus', icon: CheckCircle, color: 'text-mint-600', bg: 'bg-mint-100' },
  [Category.JOURNALING]: { label: 'Journal', icon: PenTool, color: 'text-amber-500', bg: 'bg-amber-100' },
  [Category.TIDYING]: { label: 'Ordnung', icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-100' },
};

export const QUOTES = [
  { text: "Der Weg ist das Ziel.", author: "Konfuzius" },
  { text: "Atme tief ein und lass los.", author: "Zen Weisheit" },
  { text: "Nicht was wir erleben, sondern wie wir empfinden, was wir erleben, macht unser Schicksal aus.", author: "Marie von Ebner-Eschenbach" },
  { text: "Die Ruhe ist die Quelle der Kraft.", author: "Sprichwort" },
  { text: "Das Gestern ist Geschichte, das Morgen ein Rätsel, das Heute ein Geschenk.", author: "Eleanor Roosevelt" },
  { text: "Nichts bringt uns auf unserem Weg besser voran als eine Pause.", author: "Elizabeth Barrett Browning" },
  { text: "Sei du selbst die Veränderung, die du dir wünschst für diese Welt.", author: "Mahatma Gandhi" },
  { text: "Verweile nicht in der Vergangenheit, träume nicht von der Zukunft, konzentriere den Geist auf den gegenwärtigen Moment.", author: "Buddha" },
  { text: "In der Stille findest du Antworten, die der Lärm nicht geben kann.", author: "Unbekannt" },
  { text: "Glück ist nicht, was du hast, sondern was du bist.", author: "Osho" }
];

export const OFFLINE_CHALLENGES: Challenge[] = [
  // Breathing
  { id: 'b1', text: 'Box Breathing', description: '4 Sek. einatmen, 4 halten, 4 ausatmen, 4 halten.', durationSeconds: 60, category: Category.BREATHING },
  { id: 'b2', text: 'Tiefe Bauchatmung', description: 'Lege eine Hand auf den Bauch und atme tief ein.', durationSeconds: 120, category: Category.BREATHING },
  { id: 'b3', text: 'Augen schließen', description: 'Schließe die Augen und höre nur auf deine Umgebung.', durationSeconds: 60, category: Category.BREATHING },

  // Movement
  { id: 'm1', text: 'Kurz strecken', description: 'Arme weit nach oben strecken und tief einatmen.', durationSeconds: 30, category: Category.MOVEMENT },
  { id: 'm2', text: 'Nackenrollen', description: 'Langsam den Kopf von links nach rechts rollen.', durationSeconds: 45, category: Category.MOVEMENT },
  { id: 'm3', text: 'Aufstehen', description: 'Steh auf und schüttle Arme und Beine aus.', durationSeconds: 20, category: Category.MOVEMENT },
  { id: 'm4', text: 'Schulterkreisen', description: 'Kreise die Schultern 10x vorwärts und 10x rückwärts.', durationSeconds: 45, category: Category.MOVEMENT },
  
  // Journaling
  { id: 'j1', text: 'Ein Satz der Dankbarkeit', description: 'Wofür bist du gerade in diesem Moment dankbar?', durationSeconds: 0, category: Category.JOURNALING },
  { id: 'j2', text: 'Gefühls-Check', description: 'Wie fühlst du dich gerade? Schreibe ein Wort oder Satz auf.', durationSeconds: 0, category: Category.JOURNALING },
  { id: 'j3', text: 'Top Ziel heute', description: 'Was ist die EINE Sache, die du heute noch schaffen willst?', durationSeconds: 0, category: Category.JOURNALING },

  // Tidying
  { id: 't1', text: 'Schreibtisch Clear', description: 'Räume nur die Dinge weg, die du gerade nicht brauchst.', durationSeconds: 120, category: Category.TIDYING },
  { id: 't2', text: 'Digitales Aufräumen', description: 'Schließe alle Browser-Tabs, die du nicht mehr brauchst.', durationSeconds: 60, category: Category.TIDYING },
  { id: 't3', text: 'Wasserglas', description: 'Hol dir ein frisches Glas Wasser.', durationSeconds: 0, category: Category.TIDYING },

  // Focus
  { id: 'f1', text: 'Single Tasking', description: 'Wähle eine Aufgabe und arbeite 5 Minuten nur daran.', durationSeconds: 300, category: Category.FOCUS },
  { id: 'f2', text: 'Bildschirm-Pause', description: 'Schaue für 1 Minute aus dem Fenster in die Ferne.', durationSeconds: 60, category: Category.FOCUS },
];