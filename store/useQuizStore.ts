import { create } from 'zustand';
import api from '@/lib/api';

interface Subject {
    _id: string;
    name: string;
    description: string;
    icon: string;
}

interface Quiz {
    _id: string;
    subjectId: string;
    title: string;
    difficulty: string;
}

interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Question {
    _id: string;
    content: string;
    options: Option[];
}

interface QuizResult {
    isCorrect: boolean;
    correctChoiceId: string;
    xpGained: number;
    newStreak: number;
    multiplier: number;
    stats: {
        totalXP: number;
        userLeague: string;
    };
}

interface QuizState {
    subjects: Subject[];
    quizzes: Quiz[];
    questions: Question[];
    currentStreak: number;
    multiplier: number;
    totalXP: number;
    lastResult: QuizResult | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    fetchSubjects: () => Promise<void>;
    fetchQuizzes: (subjectId: string) => Promise<void>;
    fetchQuestions: (quizId: string) => Promise<void>;
    submitAnswer: (userId: string, questionId: string, choiceId: string, sessionId: string) => Promise<QuizResult | void>;
    resetQuiz: () => void;
    clearLastResult: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
    subjects: [],
    quizzes: [],
    questions: [],
    currentStreak: 0,
    multiplier: 1.0,
    totalXP: 0,
    lastResult: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchSubjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/api/subjects');
            set({ subjects: response.data, isLoading: false });
        } catch {
            set({ error: 'Failed to fetch subjects', isLoading: false });
        }
    },

    fetchQuizzes: async (subjectId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/api/subjects/${subjectId}/quizzes`);
            set({ quizzes: response.data, isLoading: false });
        } catch {
            set({ error: 'Failed to fetch quizzes', isLoading: false });
        }
    },

    fetchQuestions: async (quizId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/api/quizzes/${quizId}/questions`);
            set({ questions: response.data, isLoading: false });
        } catch {
            set({ error: 'Failed to fetch questions', isLoading: false });
        }
    },

    submitAnswer: async (userId, questionId, choiceId, sessionId) => {
        set({ isSubmitting: true, error: null });
        try {
            const response = await api.post('/api/questions/answer', {
                userId,
                questionId,
                choiceId,
                sessionId,
            });

            const { newStreak, multiplier, stats } = response.data;

            set({
                currentStreak: newStreak,
                multiplier,
                totalXP: stats.totalXP,
                lastResult: response.data,
                isSubmitting: false,
            });

            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
            const axiosError = err as { response?: { data?: { message?: string } } };
            set({
                error: axiosError.response?.data?.message || errorMessage,
                isSubmitting: false,
            });
        }
    },

    resetQuiz: () => set({
        currentStreak: 0,
        multiplier: 1.0,
        lastResult: null,
        error: null,
        questions: [],
    }),
    clearLastResult: () => set({ lastResult: null }),
}));
