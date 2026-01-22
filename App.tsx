
import React, { useState, useEffect } from 'react';
import { Layout, ClipboardList, BookOpen, Trophy, Settings, ChevronRight, Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { generateQuiz } from './geminiService';
import { ExamType, ExamStage, Question, QuizSet, UserProgress } from './types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Helper for local storage
const STORAGE_KEY = 'rrb_prep_progress';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'setup' | 'quiz' | 'result'>('dashboard');
  const [examType, setExamType] = useState<ExamType>(ExamType.NTPC);
  const [examStage, setExamStage] = useState<ExamStage>(ExamStage.CBT1);
  const [currentQuiz, setCurrentQuiz] = useState<QuizSet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [history, setHistory] = useState<UserProgress[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveResult = (score: number, total: number) => {
    const newProgress: UserProgress = {
      quizId: currentQuiz?.id || Date.now().toString(),
      score,
      total,
      timestamp: Date.now(),
      exam: examType
    };
    const updatedHistory = [newProgress, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const startQuizGeneration = async () => {
    setIsLoading(true);
    try {
      const questions = await generateQuiz(examType, examStage, 10);
      const quiz: QuizSet = {
        id: Math.random().toString(36).substr(2, 9),
        title: `${examType} - ${examStage} Daily Set`,
        exam: examType,
        stage: examStage,
        questions,
        timestamp: Date.now()
      };
      setCurrentQuiz(quiz);
      setAnswers({});
      setQuizStartTime(Date.now());
      setView('quiz');
    } catch (err) {
      alert("Error generating quiz. Please check your connection or API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (!currentQuiz) return;
    let score = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });
    saveResult(score, currentQuiz.questions.length);
    setView('result');
  };

  const getRecentPerformance = () => {
    return history.map((h, i) => ({
      name: new Date(h.timestamp).toLocaleDateString(),
      score: h.score,
      total: h.total
    })).reverse();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Layout className="w-8 h-8" />
            RRB Master
          </h1>
        </div>
        <nav className="px-4 py-2 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Trophy className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setView('setup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'setup' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BookOpen className="w-5 h-5" />
            New Practice
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100">
            <ClipboardList className="w-5 h-5" />
            PYQ Library
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {view === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Welcome Back, Aspirant</h2>
                <p className="text-slate-500">Track your progress and beat your previous high score.</p>
              </div>
              <button 
                onClick={() => setView('setup')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Start Daily Quiz
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Avg. Score</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {history.length > 0 ? (history.reduce((a, b) => a + (b.score / b.total), 0) / history.length * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Tests Taken</p>
                    <p className="text-2xl font-bold text-slate-900">{history.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Questions Solved</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {history.reduce((a, b) => a + b.total, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getRecentPerformance()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activities</h3>
                <div className="space-y-4">
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${h.score / h.total > 0.7 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                          {h.score / h.total > 0.7 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{h.exam}</p>
                          <p className="text-xs text-slate-500">{new Date(h.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{h.score}/{h.total}</p>
                        <p className="text-xs text-slate-400">Solved</p>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-400 italic">No practice sets completed yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'setup' && (
          <div className="max-w-2xl mx-auto py-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Configuration</h2>
              <p className="text-slate-500 mb-8">Select your target exam and stage to generate an AI-powered practice set.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Target Exam</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setExamType(ExamType.NTPC)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${examType === ExamType.NTPC ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
                    >
                      <p className="font-bold text-slate-900">RRB NTPC</p>
                      <p className="text-xs text-slate-500">Non-Technical Popular Categories</p>
                    </button>
                    <button 
                      onClick={() => setExamType(ExamType.JE_CIVIL)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${examType === ExamType.JE_CIVIL ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
                    >
                      <p className="font-bold text-slate-900">RRB JE Civil</p>
                      <p className="text-xs text-slate-500">Junior Engineer - Civil Dept.</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Exam Stage</label>
                  <div className="flex gap-4">
                    {[ExamStage.CBT1, ExamStage.CBT2].map((stage) => (
                      <button 
                        key={stage}
                        onClick={() => setExamStage(stage)}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${examStage === stage ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={isLoading}
                    onClick={startQuizGeneration}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-6 h-6" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        Start Practice Set
                        <ChevronRight />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'quiz' && currentQuiz && (
          <QuizEngine 
            quiz={currentQuiz} 
            answers={answers} 
            setAnswers={setAnswers} 
            onFinish={handleFinish} 
          />
        )}

        {view === 'result' && currentQuiz && (
          <QuizResult 
            quiz={currentQuiz} 
            answers={answers} 
            onRestart={() => setView('setup')}
            onDashboard={() => setView('dashboard')}
          />
        )}
      </main>
    </div>
  );
}

// Sub-component: Quiz Engine
function QuizEngine({ quiz, answers, setAnswers, onFinish }: { 
  quiz: QuizSet; 
  answers: Record<number, number>; 
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>; 
  onFinish: () => void 
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const q = quiz.questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{quiz.title}</h2>
          <p className="text-sm text-slate-500">Question {currentIdx + 1} of {quiz.questions.length}</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-full text-slate-600 font-mono font-bold">
          00:00 {/* Timer placeholder logic could go here */}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg uppercase tracking-wider">
            {q.subject}
          </span>
          <p className="text-xl font-medium text-slate-900 leading-relaxed">
            {q.question}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: idx }))}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${answers[currentIdx] === idx ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${answers[currentIdx] === idx ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-400'}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={`text-lg ${answers[currentIdx] === idx ? 'text-blue-900 font-semibold' : 'text-slate-700'}`}>
                {option}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4">
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-0 transition-all"
          >
            Previous
          </button>
          
          {currentIdx === quiz.questions.length - 1 ? (
            <button 
              onClick={onFinish}
              className="px-10 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
            >
              Finish Quiz
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Next
            </button>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-8 bg-slate-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300" 
          style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Sub-component: Quiz Result
function QuizResult({ quiz, answers, onRestart, onDashboard }: { 
  quiz: QuizSet; 
  answers: Record<number, number>; 
  onRestart: () => void; 
  onDashboard: () => void 
}) {
  const score = quiz.questions.filter((q, idx) => answers[idx] === q.correctAnswer).length;
  const percentage = (score / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
        <div className="flex justify-center">
          <div className={`p-6 rounded-full ${percentage >= 70 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            <Trophy className="w-16 h-16" />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900">Score: {score}/{quiz.questions.length}</h2>
          <p className="text-xl text-slate-500 mt-2">
            {percentage >= 90 ? 'Exceptional! You are exam ready.' : 
             percentage >= 70 ? 'Great job! Keep refining your skills.' : 
             percentage >= 50 ? 'Good effort, but more practice is needed.' : 
             'Don\'t give up! Review the explanations below.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={onRestart}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCcw size={18} />
            Try Another Set
          </button>
          <button 
            onClick={onDashboard}
            className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">Review Questions</h3>
        {quiz.questions.map((q, idx) => {
          const isCorrect = answers[idx] === q.correctAnswer;
          return (
            <div key={idx} className={`p-6 bg-white rounded-2xl border ${isCorrect ? 'border-green-200' : 'border-red-200'} shadow-sm space-y-4`}>
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-slate-800">{idx + 1}. {q.question}</p>
                {isCorrect ? (
                  <CheckCircle2 className="text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="text-red-500 flex-shrink-0" />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div 
                    key={oIdx} 
                    className={`text-sm p-3 rounded-lg border ${
                      oIdx === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 
                      (oIdx === answers[idx] && !isCorrect) ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase mb-1">Explanation</p>
                <p className="text-sm text-blue-700 leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
