export type ProcessingStatus = 'Processed' | 'Processing';
export type NotesStatus = 'Ready' | 'Processing' | 'Needs Review';

export interface SessionListItem {
	id: string;
	patientLabel: string;
	dateLabel: string;
	durationLabel: string;
	status: ProcessingStatus;
	dbtScore: number | null;
	notesStatus: NotesStatus;
	/** Only sessions with a detail page in this demo are navigable. */
	hasDetail: boolean;
}

export type ScoreStatus = 'strong' | 'meets' | 'attention';

export interface TranscriptLine {
	timestamp: string;
	speaker: 'Therapist' | 'Patient';
	text: string;
	tag?: string;
}

export interface CoachingSuggestion {
	title: string;
	description: string;
}

export interface ScoreItem {
	id: string;
	label: string;
	score: number;
	rationale: string;
	evidence: { timestamp: string; speaker: 'Therapist' | 'Patient'; text: string }[];
	workedWell: string[];
	couldImprove: string[];
	coaching: CoachingSuggestion[];
	alternativeApproach: string;
}

export interface ClinicalNote {
	sessionSummary: string;
	interventions: string[];
	patientResponse: string;
	plan: string[];
}

export interface SessionDetail {
	id: string;
	patientLabel: string;
	dateLabel: string;
	durationLabel: string;
	modality: string;
	framework: string;
	processedAtLabel: string;
	overallScore: number;
	summary: string;
	keyObservations: string[];
	transcript: TranscriptLine[];
	clinicalNote: ClinicalNote;
	scoreItems: ScoreItem[];
}

export function scoreStatus(score: number): ScoreStatus {
	if (score >= 85) return 'strong';
	if (score >= 70) return 'meets';
	return 'attention';
}

export const scoreStatusLabel: Record<ScoreStatus, string> = {
	strong: 'Strong',
	meets: 'Meets Criteria',
	attention: 'Needs Attention'
};

export const scoreStatusPillClass: Record<ScoreStatus, string> = {
	strong: 'pill-strong',
	meets: 'pill-meets',
	attention: 'pill-attention'
};
