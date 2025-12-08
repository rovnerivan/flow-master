export interface TagInfo {
  id: string;
  name: string;
  color: string;
}

// Default system tags
export const defaultTags: TagInfo[] = [
  { id: 'operaciones', name: 'Operaciones', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'ventas', name: 'Ventas', color: 'bg-green-500/20 text-green-400' },
  { id: 'atencion', name: 'Atención al Cliente', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'almacen', name: 'Almacén', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'finanzas', name: 'Finanzas', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'seguridad', name: 'Seguridad', color: 'bg-red-500/20 text-red-400' },
  { id: 'calidad', name: 'Calidad', color: 'bg-teal-500/20 text-teal-400' },
  { id: 'rrhh', name: 'RRHH', color: 'bg-pink-500/20 text-pink-400' },
];

// Custom tag colors to cycle through
export const customTagColors = [
  'bg-cyan-500/20 text-cyan-400',
  'bg-lime-500/20 text-lime-400',
  'bg-amber-500/20 text-amber-400',
  'bg-rose-500/20 text-rose-400',
  'bg-violet-500/20 text-violet-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-sky-500/20 text-sky-400',
  'bg-fuchsia-500/20 text-fuchsia-400',
];