import { FieldValue } from "firebase/firestore";

export type UserRole = 'teacher' | 'admin';

export type UserProfile = {
  id: string; // Corresponds to Firebase Auth UID
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
};

export type Organization = {
  id: string;
  name: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  createdAt: FieldValue;
}

export type NewClass = {
  name: string;
  teacherId: string;
  organizationId: string;
  studentCount: number;
  responsesCount: number;
  createdAt: FieldValue;
}

export type Class = {
  id: string;
  name: string;
  teacherId: string;
  organizationId?: string;
  studentCount: number;
  responsesCount: number;
  createdAt: FieldValue;
};

export type Student = {
  id:string;
  name: string;
  age: number;
  email?: string;
  classId: string;
  gender?: string;
  generation?: string;
  quizStatus: 'pending' | 'completed';
  unifiedProfileId?: string;
  createdAt: string; // Changed from FieldValue to string for serialization
};

export type QuizAnswers = Record<string, any>;

export type NewStudent = {
    name: string;
    age: number;
    email?: string;
    gender?: string;
    classId: string;
    quizStatus: 'completed';
    createdAt: FieldValue;
    unifiedProfileId?: string;
};

export type VarkProfile = {
  dominant: 'Visual' | 'Auditivo' | 'Leitura/Escrita' | 'Cinestésico' | 'Multimodal';
  scores: { v: number; a: number; r: number; k: number };
};

export type DiscProfile = {
  dominant: 'Dominância' | 'Influência' | 'Estabilidade' | 'Consciência';
  scores: { d: number; i: number; s: number; c: number };
};

// This represents the raw data fetched from Firestore before client-side processing
export type RawUnifiedProfile = {
  id: string;
  studentId: string;
  classId: string;
  rawAnswers: QuizAnswers;
  createdAt: string; // Changed from FieldValue to string for serialization
};


// This represents the fully processed profile after client-side calculations
export type UnifiedProfile = Omit<RawUnifiedProfile, 'rawAnswers'> & {
  varkProfile: VarkProfile;
  discProfile: DiscProfile;
  jungianProfile: string; // e.g., "ENFP"
  schwartzValues: {
    top_values: string[];
    scores: Record<string, number>;
  };
  dissonanceAlert: boolean;
  dissonanceNotes?: string;
};


export type NewUnifiedProfile = {
    studentId: string;
    classId: string;
    rawAnswers: QuizAnswers;
    createdAt: FieldValue;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'disabled';
};

export type ClassWithStudentData = Class & {
  students: Student[];
  profiles: RawUnifiedProfile[]; // Fetch raw profiles
};
