// Process Types - Phase 1 SOP Improvements

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ProcessFrequency = 'daily' | 'weekly' | 'monthly' | 'occasional';

export interface ChecklistItem {
  id: string;
  text: string;
  checked?: boolean;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  documentUrl?: string;
  extendedContent?: ExtendedContentItem[];
  // Phase 1 additions
  isCritical?: boolean;
  checklist?: ChecklistItem[];
  troubleshooting?: string;
}

export interface ExtendedContentItem {
  id: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'text' | 'link';
  title?: string;
  content: string;
  description?: string;
}

export interface ProcessData {
  id: string;
  name: string;
  description: string;
  importance?: string;
  expectedResult?: string;
  estimatedTime?: string;
  // Phase 1 additions
  owner?: string;
  riskLevel?: RiskLevel;
  frequency?: ProcessFrequency;
  requiredTools?: string[];
  successCriteria?: string;
  // Existing fields
  steps: ProcessStep[];
  tags?: string[];
  status?: 'draft' | 'published' | 'under_review' | 'discontinued';
  currentVersion?: string;
  totalSteps?: number;
  compliance?: number;
  lastUpdated?: string;
}

// Risk level display configuration
export const riskLevelConfig: Record<RiskLevel, { label: string; color: string; bgColor: string; borderColor: string }> = {
  low: {
    label: 'Bajo',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20'
  },
  medium: {
    label: 'Medio',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20'
  },
  high: {
    label: 'Alto',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  critical: {
    label: 'Crítico',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20'
  }
};

// Frequency display configuration
export const frequencyConfig: Record<ProcessFrequency, { label: string; description: string }> = {
  daily: { label: 'Diaria', description: 'Se ejecuta todos los días' },
  weekly: { label: 'Semanal', description: 'Se ejecuta cada semana' },
  monthly: { label: 'Mensual', description: 'Se ejecuta cada mes' },
  occasional: { label: 'Ocasional', description: 'Solo cuando se necesita' }
};
