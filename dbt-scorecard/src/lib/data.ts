import type { SessionListItem, SessionDetail } from './types';

export const sessionList: SessionListItem[] = [
	{
		id: '1842',
		patientLabel: 'Patient #1842',
		dateLabel: 'Sep 14',
		durationLabel: '52 min',
		status: 'Processed',
		dbtScore: 82,
		notesStatus: 'Ready',
		hasDetail: true
	},
	{
		id: '2081',
		patientLabel: 'Patient #2081',
		dateLabel: 'Sep 14',
		durationLabel: '47 min',
		status: 'Processed',
		dbtScore: 91,
		notesStatus: 'Ready',
		hasDetail: false
	},
	{
		id: '1657',
		patientLabel: 'Patient #1657',
		dateLabel: 'Sep 13',
		durationLabel: '55 min',
		status: 'Processing',
		dbtScore: null,
		notesStatus: 'Processing',
		hasDetail: false
	},
	{
		id: '1390',
		patientLabel: 'Patient #1390',
		dateLabel: 'Sep 13',
		durationLabel: '49 min',
		status: 'Processed',
		dbtScore: 74,
		notesStatus: 'Needs Review',
		hasDetail: false
	},
	{
		id: '2214',
		patientLabel: 'Patient #2214',
		dateLabel: 'Sep 12',
		durationLabel: '61 min',
		status: 'Processed',
		dbtScore: 88,
		notesStatus: 'Ready',
		hasDetail: false
	},
	{
		id: '1509',
		patientLabel: 'Patient #1509',
		dateLabel: 'Sep 12',
		durationLabel: '38 min',
		status: 'Processed',
		dbtScore: 79,
		notesStatus: 'Ready',
		hasDetail: false
	},
	{
		id: '1998',
		patientLabel: 'Patient #1998',
		dateLabel: 'Sep 11',
		durationLabel: '50 min',
		status: 'Processing',
		dbtScore: null,
		notesStatus: 'Processing',
		hasDetail: false
	}
];

const commitmentAlternatives = [
	'Instead of a broad "worthwhile" question, use a scaling probe: ask the patient to rate their commitment from 0–10, then explore what would move the number up by one point before ending the intervention.',
	'Try devil\'s advocate: gently argue the patient should keep the old coping behavior, prompting them to argue for the new skill themselves — this often produces stronger, self-generated commitment language than direct questioning.',
	'Use foot-in-the-door sequencing: secure agreement to a small, low-effort version of the target behavior first, then expand the commitment once that smaller commitment is confirmed.'
];

export const session1842: SessionDetail = {
	id: '1842',
	patientLabel: 'Patient #1842',
	dateLabel: 'September 14, 2026',
	durationLabel: '52 minutes',
	modality: 'Individual therapy · Telehealth',
	framework: 'Dialectical Behavior Therapy (DBT)',
	processedAtLabel: 'Sep 14, 2026 · 3:42 PM',
	overallScore: 82,
	summary:
		'This session focused on distress tolerance following a reported conflict with a family member earlier in the week. The therapist reviewed the patient\'s use of TIPP skills during the conflict, conducted a behavioral chain analysis of the escalation, and revisited the safety plan established in the prior session. Motivation for continuing the agreed coping strategy was explored but not fully anchored to a concrete commitment before the session closed.',
	keyObservations: [
		'The therapist consistently validated the patient\'s emotional experience before moving to problem-solving.',
		'Behavioral chain analysis was thorough but stopped short of identifying vulnerability factors from earlier in the day.',
		'Commitment language was present but was not reinforced or restated at the close of the session.'
	],
	transcript: [
		{
			timestamp: '02:15',
			speaker: 'Therapist',
			text: 'Before we get into the week, how has your mood been on a day-to-day basis since we last spoke?',
			tag: 'Check-in'
		},
		{
			timestamp: '04:03',
			speaker: 'Patient',
			text: 'Okay, mostly. There was one really bad night on Wednesday after an argument with my sister.'
		},
		{
			timestamp: '06:47',
			speaker: 'Therapist',
			text: 'That sounds really hard. It makes sense that would shake things up, especially given how close you two usually are.',
			tag: 'Validation'
		},
		{
			timestamp: '09:12',
			speaker: 'Patient',
			text: 'Yeah. I ended up yelling and then just left the house. I didn\'t use any of the skills we talked about.'
		},
		{
			timestamp: '11:30',
			speaker: 'Therapist',
			text: 'Let\'s slow down and walk through it step by step. What happened right before the argument started?',
			tag: 'Behavioral Chain Analysis'
		},
		{
			timestamp: '15:52',
			speaker: 'Patient',
			text: 'I hadn\'t really eaten all day and I was already on edge from a work email.'
		},
		{
			timestamp: '18:42',
			speaker: 'Therapist',
			text: 'What would make trying this strategy worthwhile for you this week?',
			tag: 'Commitment Strategies'
		},
		{
			timestamp: '19:20',
			speaker: 'Patient',
			text: 'I guess if it meant I didn\'t have to leave the house every time we disagree. That gets exhausting.'
		},
		{
			timestamp: '23:05',
			speaker: 'Therapist',
			text: 'That\'s a great reason to hold onto. Let\'s look at what TIPP would have offered in that exact moment.',
			tag: 'Skills Coaching'
		},
		{
			timestamp: '27:18',
			speaker: 'Therapist',
			text: 'Given everything on your plate this week, do you think the safety plan we built still fits, or does it need adjusting?',
			tag: 'Treatment Targets'
		},
		{
			timestamp: '31:08',
			speaker: 'Therapist',
			text: 'Let\'s come back to what you want to change before the next session.',
			tag: 'Commitment Strategies'
		},
		{
			timestamp: '31:40',
			speaker: 'Patient',
			text: 'Okay — I think I want to try pausing before I leave the room, even just for a minute.'
		},
		{
			timestamp: '38:14',
			speaker: 'Therapist',
			text: 'That pause is exactly the kind of skill we can build on. How confident do you feel about trying that this week?',
			tag: 'Skills Coaching'
		},
		{
			timestamp: '44:29',
			speaker: 'Patient',
			text: 'Fairly confident, maybe a 7 out of 10.'
		},
		{
			timestamp: '48:56',
			speaker: 'Therapist',
			text: 'Let\'s check in again next week on how the pause went, and we\'ll troubleshoot from there.',
			tag: 'Wrap-up'
		}
	],
	clinicalNote: {
		sessionSummary:
			'Patient presented with elevated distress following an interpersonal conflict earlier in the week. Session focused on reviewing the triggering event through behavioral chain analysis, reinforcing distress tolerance skills (TIPP), and revisiting the existing safety plan.',
		interventions: [
			'Behavioral chain analysis of Wednesday\'s conflict, identifying skipped meals and work stress as contributing vulnerability factors.',
			'Review and troubleshooting of TIPP skill application during the escalation.',
			'Revisited and lightly adjusted the standing safety plan to reflect current stressors.',
			'Explored patient motivation for adopting a brief pause strategy before leaving conflict situations.'
		],
		patientResponse:
			'Patient was engaged and forthcoming about the triggering event. Reported moderate confidence (7/10) in attempting the pause strategy before the next session. Some ambivalence noted regarding consistency of skill use under high arousal.',
		plan: [
			'Patient to practice a brief pause before physically leaving conflict situations, using the app-based skills log to record attempts.',
			'Continue behavioral chain analysis for any escalation events between sessions.',
			'Revisit commitment to the pause strategy and reinforce explicitly at the start of next session.',
			'Next session scheduled in 7 days.'
		]
	},
	scoreItems: [
		{
			id: 'validation-strategies',
			label: 'Validation Strategies',
			score: 92,
			rationale:
				'The therapist reflected and validated the patient\'s emotional experience at multiple points before shifting to problem-solving, including explicit acknowledgment of the difficulty of the conflict.',
			evidence: [
				{
					timestamp: '06:47',
					speaker: 'Therapist',
					text: 'That sounds really hard. It makes sense that would shake things up, especially given how close you two usually are.'
				}
			],
			workedWell: [
				'Validation was offered before any redirection toward skills or problem-solving.',
				'Language matched the emotional intensity the patient described.'
			],
			couldImprove: [
				'Could validate the difficulty of using skills in the moment, not only the triggering event itself.'
			],
			coaching: [
				{
					title: 'Validate the struggle to use skills, not just the trigger',
					description:
						'When a patient reports not using a skill, validate how hard it is to access skills under high emotional arousal before moving to analysis.'
				},
				{
					title: 'Name the emotion explicitly',
					description:
						'Pairing validation with an explicit emotion label ("that sounds like it brought up a lot of anger and hurt") deepens the sense of being understood.'
				}
			],
			alternativeApproach:
				'Try a two-step validation: first validate the emotion itself, then separately validate the behavioral response as an understandable attempt to cope, before introducing any alternative strategy.'
		},
		{
			id: 'behavioral-analysis',
			label: 'Behavioral Analysis',
			score: 84,
			rationale:
				'The therapist conducted a structured chain analysis of the triggering event, identifying the prompting event and immediate consequences, though earlier vulnerability factors were only partially explored.',
			evidence: [
				{
					timestamp: '11:30',
					speaker: 'Therapist',
					text: 'Let\'s slow down and walk through it step by step. What happened right before the argument started?'
				},
				{
					timestamp: '15:52',
					speaker: 'Patient',
					text: 'I hadn\'t really eaten all day and I was already on edge from a work email.'
				}
			],
			workedWell: [
				'Chain analysis was initiated promptly rather than staying in general discussion.',
				'Prompting event and immediate response were clearly identified.'
			],
			couldImprove: [
				'Vulnerability factors (skipped meal, work stress) were named by the patient but not explicitly mapped back into the chain.',
				'No discussion of consequences that reinforced the behavior.'
			],
			coaching: [
				{
					title: 'Explicitly map vulnerability factors',
					description:
						'When a patient mentions a contributing factor like missed meals or poor sleep, restate it as part of the chain out loud to reinforce the link.'
				},
				{
					title: 'Close the loop on consequences',
					description:
						'Ask what happened immediately after the behavior (relief, further conflict) to complete the chain and identify reinforcement.'
				}
			],
			alternativeApproach:
				'Use a written chain analysis worksheet in-session so vulnerability factors, links, and consequences are visually mapped together rather than discussed verbally only.'
		},
		{
			id: 'skills-coaching',
			label: 'Skills Coaching',
			score: 76,
			rationale:
				'TIPP skills were reviewed in relation to the triggering event, and the therapist checked confidence in a new coping strategy, but coaching stayed largely conceptual rather than rehearsed in session.',
			evidence: [
				{
					timestamp: '23:05',
					speaker: 'Therapist',
					text: 'That\'s a great reason to hold onto. Let\'s look at what TIPP would have offered in that exact moment.'
				},
				{
					timestamp: '38:14',
					speaker: 'Therapist',
					text: 'That pause is exactly the kind of skill we can build on. How confident do you feel about trying that this week?'
				}
			],
			workedWell: [
				'Confidence rating was collected before ending the discussion of the new strategy.',
				'Skill was tied back to a concrete moment from the patient\'s week.'
			],
			couldImprove: [
				'No in-session rehearsal or role-play of the pause strategy.',
				'Discussion of TIPP stayed conceptual rather than walking through a specific technique (e.g., paced breathing) step by step.'
			],
			coaching: [
				{
					title: 'Rehearse the skill in session',
					description:
						'Have the patient practice the pause or a TIPP technique out loud or physically in session, not just describe it hypothetically.'
				},
				{
					title: 'Pick one TIPP technique to go deep on',
					description:
						'Rather than reviewing TIPP broadly, select the single most relevant technique for the trigger described and walk through it in detail.'
				}
			],
			alternativeApproach:
				'Use in-session behavioral rehearsal: ask the patient to physically demonstrate the pause (standing up, stepping back) so the skill is encoded motorically, not just discussed.'
		},
		{
			id: 'treatment-targets',
			label: 'Treatment Targets',
			score: 88,
			rationale:
				'The session stayed focused on the highest-priority target (conflict-driven escalation) consistent with the treatment hierarchy, and the therapist checked whether the standing safety plan still fit current stressors.',
			evidence: [
				{
					timestamp: '27:18',
					speaker: 'Therapist',
					text: 'Given everything on your plate this week, do you think the safety plan we built still fits, or does it need adjusting?'
				}
			],
			workedWell: [
				'Session content stayed aligned with the current highest-priority target rather than drifting to lower-priority topics.',
				'Safety plan relevance was actively checked rather than assumed.'
			],
			couldImprove: [
				'Could explicitly state the treatment target hierarchy out loud to reinforce shared understanding with the patient.'
			],
			coaching: [
				{
					title: 'Name the target hierarchy explicitly',
					description:
						'Briefly stating why this target takes priority this week helps the patient understand the structure behind the session, not just its content.'
				}
			],
			alternativeApproach:
				'Open the session with a one-minute target review ("last week\'s priority was X, this week I want to check if that\'s still true") before moving into the chain analysis.'
		},
		{
			id: 'commitment-strategies',
			label: 'Commitment Strategies',
			score: 68,
			rationale:
				'The therapist explored motivation for change but did not consistently reinforce explicit commitment to the agreed behavioral target.',
			evidence: [
				{
					timestamp: '18:42',
					speaker: 'Therapist',
					text: 'What would make trying this strategy worthwhile for you this week?'
				},
				{
					timestamp: '31:08',
					speaker: 'Therapist',
					text: 'Let\'s come back to what you want to change before the next session.'
				}
			],
			workedWell: [
				'Opened the door for the patient to generate their own reason for change ("worthwhile for you").',
				'Returned to the topic of commitment later in the session rather than dropping it entirely.'
			],
			couldImprove: [
				'The specific behavioral target (the pause strategy) was not restated in explicit, observable terms once agreed upon.',
				'No confirmation or restatement of the commitment at the close of the session.',
				'Commitment was not tied back to the patient\'s longer-term treatment goals.'
			],
			coaching: [
				{
					title: 'Strengthen explicit commitment',
					description:
						'Ask the patient to state the specific behavior they are committing to before ending the intervention.'
				},
				{
					title: 'Connect commitment to treatment goals',
					description: 'Tie the behavioral commitment back to the patient\'s stated long-term goal.'
				},
				{
					title: 'Confirm next action',
					description:
						'End with a clear, observable action that can be reviewed in the next session.'
				}
			],
			alternativeApproach: commitmentAlternatives[0]
		}
	]
};

export function getSessionDetail(id: string): SessionDetail | undefined {
	if (id === session1842.id) return session1842;
	return undefined;
}

export function getAlternativeApproach(itemId: string, attempt: number): string {
	if (itemId === 'commitment-strategies') {
		return commitmentAlternatives[attempt % commitmentAlternatives.length];
	}
	const item = session1842.scoreItems.find((i) => i.id === itemId);
	return item?.alternativeApproach ?? '';
}
