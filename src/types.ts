export type TabType = 'hub' | 'chat' | 'vault' | 'analytics';

export interface TopicMastery {
  id: string;
  unit: string;
  title: string;
  subtitle: string;
  status: 'VERIFIED' | 'FLAGGED' | 'PENDING';
  auditDetails: string;
  masteryScore: number;
}

export interface SolverStep {
  stepNumber: number;
  title: string;
  description: string;
  verified: boolean;
  mathBlock?: string;
  criticFeedback?: string; // Critic AI line-by-line commentary
}

export interface Citation {
  textbook: string;
  chapter: string;
  notes: string;
  ncertPage?: string;
}

export interface DualAiPipelineLog {
  solverDraftSummary: string;
  criticVerificationPassed: boolean;
  ncertSourceMatch: string;
  criticWarnings?: string[];
}

export interface SolverResult {
  id: string;
  query: string;
  subject: string;
  title: string;
  summary: string;
  steps: SolverStep[];
  finalEquation: string;
  citation: Citation;
  timestamp: string;
  criticAuditStatus: 'VERIFIED' | 'FLAGGED';
  criticAuditNotes?: string;
  pipelineLog?: DualAiPipelineLog;
  isOutOfScope?: boolean;
}

export interface VaultProblem {
  id: string;
  problemNumber: string;
  category: string;
  title: string;
  question: string;
  reference: {
    textbook: string;
    chapter: string;
    page: string;
  };
  solution: SolverResult;
  params: {
    mass: number;
    velocity: number;
    radius: number;
    mu: number;
  };
}

export interface CohortMetric {
  cohortId: string;
  meanScore: number;
  variance: number;
  participation: number;
}

export interface UnitOverview {
  id: string;
  name: string;
  course: string;
  overallMastery: number;
  masteryDelta: number;
  totalTimeHours: number;
  totalTimeMinutes: number;
  questionsCompleted: number;
  questionsTotal: number;
  topics: TopicMastery[];
}

