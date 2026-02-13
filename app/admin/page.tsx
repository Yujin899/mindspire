"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldAlert,
    ChevronRight,
    Database,
    Layers,
    FileJson,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Copy,
    FileUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface Subject {
    _id: string;
    name: string;
    description: string;
}

interface Quiz {
    _id: string;
    title: string;
    difficulty: string;
}

export default function AdminPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const res = await api.get('/api/auth/me');
                setUserRole(res.data.role);
                if (res.data.role !== 'admin') {
                    router.push('/subjects');
                }
            } catch (err) {
                console.error("Verification failed", err);
                router.push('/subjects');
            } finally {
                setIsVerifying(false);
            }
        };
        verifyAdmin();
    }, [router]);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    // Form States
    const [newSubject, setNewSubject] = useState({ name: '', description: '', icon: 'BookOpen' });
    const [newQuiz, setNewQuiz] = useState({ title: '', difficulty: 'Medium' });
    const [jsonInput, setJsonInput] = useState('');

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/api/subjects');
            setSubjects(res.data);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchQuizzes = async (subjectId: string) => {
        try {
            const res = await api.get(`/api/subjects/${subjectId}/quizzes`);
            setQuizzes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/subjects', newSubject);
            setStatus({ type: 'success', msg: 'Subject created by the Elders!' });
            setNewSubject({ name: '', description: '', icon: 'BookOpen' });
            fetchSubjects();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to craft subject' });
        }
    };

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubject) return;
        try {
            await api.post('/api/quizzes', { ...newQuiz, subjectId: selectedSubject._id });
            setStatus({ type: 'success', msg: 'Quiz forged!' });
            setNewQuiz({ title: '', difficulty: 'Medium' });
            fetchQuizzes(selectedSubject._id);
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to forge quiz' });
        }
    };

    const handleBatchUpload = async () => {
        if (!selectedQuiz || !jsonInput) return;
        try {
            const questions = JSON.parse(jsonInput);
            const res = await api.post('/api/questions/batch', { quizId: selectedQuiz._id, questions });
            setStatus({ type: 'success', msg: `Infused ${res.data.count} questions into the realm!` });
            setJsonInput('');
        } catch (err: any) {
            setStatus({ type: 'error', msg: 'Invalid JSON format or server error' });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                JSON.parse(content);
                setJsonInput(content);
                setStatus({ type: 'success', msg: 'Scroll decoded successfully!' });
            } catch (err) {
                setStatus({ type: 'error', msg: 'Thy scroll is corrupted (Invalid JSON)' });
            }
        };
        reader.readAsText(file);
    };

    const jsonFormula = `[
  {
    "content": "Thy question text goes here?",
    "explanation": "Why this answer is the true revelation...",
    "options": [
      { "id": "1", "text": "Correct Answer", "isCorrect": true },
      { "id": "2", "text": "False Prophet", "isCorrect": false }
    ]
  }
]`;

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <p className="font-pixel text-white/20 animate-pulse tracking-widest uppercase text-xs">Verifying Credentials...</p>
            </div>
        );
    }

    if (userRole !== 'admin') return null;

    return (
        <div className="h-screen bg-slate-950 text-slate-200 font-sans overflow-y-auto overflow-x-hidden pt-4 md:pt-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-4 border-2 border-slate-700 shadow-[4px_4px_0_#000]">
                            <ShieldAlert className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div>
                            <h1 className="font-pixel text-4xl text-white tracking-widest uppercase">Dungeon Master</h1>
                            <p className="text-slate-500 text-xs mt-1 uppercase tracking-[0.2em]">Thy word is law in Mindspire</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/subjects')}
                        className="cartoon-btn bg-slate-800 text-white px-6 py-2 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> RETURN TO REALM
                    </button>
                </header>

                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`mb-8 p-4 border-2 flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-red-500/10 border-red-500 text-red-400'
                                }`}
                        >
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-pixel text-xs uppercase">{status.msg}</span>
                            <button onClick={() => setStatus(null)} className="ml-auto opacity-50 hover:opacity-100">×</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">

                    {/* Column 1: Subjects */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900/50 border-2 border-slate-800 p-6 shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
                            <h2 className="font-pixel text-xl text-yellow-500 mb-6 flex items-center gap-2">
                                <Database className="w-5 h-5" /> REALMS
                            </h2>

                            <form onSubmit={handleCreateSubject} className="space-y-4 mb-8">
                                <input
                                    type="text"
                                    placeholder="Subject Name"
                                    value={newSubject.name}
                                    onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 p-3 text-sm focus:border-yellow-500 outline-none"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={newSubject.description}
                                    onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 p-3 text-sm focus:border-yellow-500 outline-none h-24"
                                />
                                <button className="w-full bg-yellow-500 text-black font-pixel py-3 text-sm hover:bg-yellow-400 transition-colors">
                                    CREATE REALM
                                </button>
                            </form>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                                {subjects.map(s => (
                                    <button
                                        key={s._id}
                                        onClick={() => {
                                            setSelectedSubject(s);
                                            fetchQuizzes(s._id);
                                            setSelectedQuiz(null);
                                        }}
                                        className={`w-full text-left p-4 border transition-all flex justify-between items-center group ${selectedSubject?._id === s._id ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                                            }`}
                                    >
                                        <span className="font-pixel text-xs uppercase">{s.name}</span>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedSubject?._id === s._id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quizzes */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900/50 border-2 border-slate-800 p-6 shadow-[8px_8px_0_rgba(0,0,0,0.3)] min-h-[400px]">
                            <h2 className="font-pixel text-xl text-blue-500 mb-6 flex items-center gap-2">
                                <Layers className="w-5 h-5" /> EXPEDITIONS
                            </h2>

                            {selectedSubject ? (
                                <>
                                    <form onSubmit={handleCreateQuiz} className="space-y-4 mb-8">
                                        <input
                                            type="text"
                                            placeholder="Quiz Title"
                                            value={newQuiz.title}
                                            onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 p-3 text-sm focus:border-blue-500 outline-none"
                                        />
                                        <select
                                            value={newQuiz.difficulty}
                                            onChange={e => setNewQuiz({ ...newQuiz, difficulty: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 p-3 text-sm focus:border-blue-500 outline-none"
                                        >
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                        <button className="w-full bg-blue-500 text-white font-pixel py-3 text-sm hover:bg-blue-400 transition-colors uppercase">
                                            Forge Expedition
                                        </button>
                                    </form>

                                    <div className="space-y-2">
                                        {quizzes.map(q => (
                                            <button
                                                key={q._id}
                                                onClick={() => setSelectedQuiz(q)}
                                                className={`w-full text-left p-4 border transition-all flex justify-between items-center group ${selectedQuiz?._id === q._id ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-pixel text-[10px] uppercase">{q.title}</span>
                                                    <span className="text-[10px] opacity-50 uppercase tracking-tighter">{q.difficulty}</span>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedQuiz?._id === q._id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                            </button>
                                        ))}
                                        {quizzes.length === 0 && <p className="text-slate-600 text-[10px] font-pixel text-center py-8">No expeditions in this realm yet</p>}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center py-20">
                                    <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="font-pixel text-[10px] uppercase">Select a realm to manage its expeditions</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: JSON Upload */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900/50 border-2 border-slate-800 p-6 shadow-[8px_8px_0_rgba(0,0,0,0.3)] min-h-[400px]">
                            <h2 className="font-pixel text-xl text-purple-500 mb-6 flex items-center gap-2">
                                <FileJson className="w-5 h-5" /> SCROLL INGESTION
                            </h2>

                            {selectedQuiz ? (
                                <div className="space-y-4">
                                    <div className="bg-black/50 p-4 border border-slate-800 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-pixel uppercase mb-1">Target Expedition:</p>
                                            <p className="text-sm font-pixel text-white uppercase">{selectedQuiz.title}</p>
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-purple-600 hover:bg-purple-500 p-3 border-b-4 border-purple-900 transition-all flex items-center gap-2 text-[10px] font-pixel text-white"
                                        >
                                            <FileUp className="w-4 h-4" /> UPLOAD SCROLL
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept=".json"
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            placeholder='[ { "content": "Question?", "options": [{ "id": "1", "text": "Ans", "isCorrect": true }] } ]'
                                            value={jsonInput}
                                            onChange={e => setJsonInput(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 p-3 text-[10px] font-mono focus:border-purple-500 outline-none h-48 no-scrollbar placeholder:opacity-20"
                                        />
                                    </div>

                                    <button
                                        onClick={handleBatchUpload}
                                        disabled={!jsonInput}
                                        className="w-full bg-purple-600 text-white font-pixel py-3 text-sm hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-purple-950 active:border-b-0 active:translate-y-[2px]"
                                    >
                                        INJECT SCROLLS
                                    </button>

                                    <div className="space-y-4 pt-4 border-t border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <p className="font-pixel text-[10px] text-yellow-500 uppercase">Ritual Formula (Schema)</p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(jsonFormula);
                                                    setStatus({ type: 'success', msg: 'Formula copied to spellbook!' });
                                                }}
                                                className="text-slate-500 hover:text-white transition-colors"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <pre className="bg-black/80 p-4 font-mono text-[9px] text-purple-300 overflow-x-auto border border-purple-500/20 max-h-48">
                                            {jsonFormula}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center py-20">
                                    <FileJson className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="font-pixel text-[10px] uppercase">Select an expedition to inject questions</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Background Grain/Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        </div>
    );
}
