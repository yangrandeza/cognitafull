export type Class = {
  id: string;
  name: string;
  studentCount: number;
  responsesCount: number;
  quizLink: string;
};

export type Student = {
  id: string;
  name: string;
  age: number;
  gender?: string;
  quizStatus: 'pending' | 'completed';
  unifiedProfileId?: string;
};

export type VarkProfile = {
  dominant: string;
  scores: { v: number; a: number; r: number; k: number };
};

export type DiscProfile = {
  dominant: string;
  scores: { d: number; i: number; s: number; c: number };
};

export type UnifiedProfile = {
  id: string;
  studentId: string;
  varkProfile: VarkProfile;
  discProfile: DiscProfile;
  jungianProfile: string;
  schwartzValues: {
    top_values: string[];
    scores: Record<string, number>;
  };
  dissonanceAlert: boolean;
  dissonanceNotes: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'disabled';
};
