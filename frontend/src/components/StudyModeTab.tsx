import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Code2, 
  Sparkles, 
  Download, 
  CheckCircle,
  BrainCircuit,
  Send
} from 'lucide-react';
import { api } from '../services/api';

export const StudyModeTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'explain' | 'quiz' | 'docx' | 'code'>('explain');
  
  // Concept Explain State
  const [conceptTopic, setConceptTopic] = useState('Binary Search Tree');
  const [conceptSubject, setConceptSubject] = useState('Data Structures');
  const [explanationResult, setExplanationResult] = useState<string | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  // Quiz State
  const [quizSubject, setQuizSubject] = useState('Operating Systems');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Docx Generator State
  const [docTitle, setDocTitle] = useState('Graph Algorithms & Traversal Notes');
  const [docContent, setDocContent] = useState('## Breadth-First Search (BFS)\nTraverses graph layer by layer using a Queue. Time Complexity: O(V + E).\n\n## Depth-First Search (DFS)\nExplores along each branch using recursion or Stack. Useful for topological sort and cycle detection.');
  const [docResult, setDocResult] = useState<{ filename: string; filepath: string } | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Code Analyzer State
  const [codeSnippet, setCodeSnippet] = useState(`public class MaxFinder {\n    public static int findMax(int a, int b, int c) {\n        int max = a;\n        if (b > max) max = b;\n        if (c > max) max = c;\n        return max;\n    }\n}`);
  const [codeAnalysis, setCodeAnalysis] = useState<any | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);

  const handleExplain = async () => {
    if (!conceptTopic) return;
    setLoadingExplain(true);
    try {
      const res = await api.sendChatMessage(`Jarvis, explain ${conceptTopic} in ${conceptSubject}`, false);
      const explanation = res.tools_executed?.[0]?.result?.explanation || res.response_text;
      setExplanationResult(explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const res = await api.sendChatMessage(`Jarvis, quiz me on ${quizSubject}`, false);
      const questions = res.tools_executed?.[0]?.result?.questions || [];
      setQuizQuestions(questions);
      setSelectedAnswers({});
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleGenerateDocx = async () => {
    setLoadingDoc(true);
    try {
      const res = await api.sendChatMessage(`Jarvis, create document for ${docTitle}`, false);
      const result = res.tools_executed?.[0]?.result;
      if (result) {
        setDocResult(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleAnalyzeCode = async () => {
    setLoadingCode(true);
    try {
      const res = await api.sendChatMessage(`Jarvis, analyze this Java code: ${codeSnippet}`, false);
      const analysis = res.tools_executed?.[0]?.result || { message: res.response_text };
      setCodeAnalysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCode(false);
    }
  };

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">
      {/* Subnav header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-jarvis-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <BrainCircuit size={20} className="text-jarvis-cyan" />
            <h2 className="font-hud font-bold text-lg text-slate-100 tracking-wider">
              STUDY & ACADEMIC ASSISTANT
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Dedicated learning mode for college assignments, concept mastery, revision notes, and code analysis.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-jarvis-card p-1 rounded-xl border border-jarvis-border">
          {[
            { id: 'explain', label: 'Concept Explainer', icon: BookOpen },
            { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle },
            { id: 'docx', label: 'Notes to Word', icon: FileText },
            { id: 'code', label: 'Code Reviewer', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-jarvis-cyan text-jarvis-dark font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. CONCEPT EXPLAINER */}
      {activeSubTab === 'explain' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 hud-panel rounded-2xl p-5 space-y-4">
            <h3 className="font-hud text-xs text-jarvis-cyan font-bold tracking-wider uppercase">
              QUERY ACADEMIC CONCEPT
            </h3>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">TOPIC</label>
              <input
                type="text"
                value={conceptTopic}
                onChange={(e) => setConceptTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming, TCP 3-Way Handshake"
                className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">SUBJECT AREA</label>
              <input
                type="text"
                value={conceptSubject}
                onChange={(e) => setConceptSubject(e.target.value)}
                placeholder="e.g. Algorithms, Operating Systems"
                className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
              />
            </div>

            <button
              onClick={handleExplain}
              disabled={loadingExplain}
              className="w-full py-2.5 rounded-xl bg-jarvis-cyan text-jarvis-dark font-hud font-bold text-xs tracking-wider flex items-center justify-center space-x-2 hover:bg-white transition-colors"
            >
              <Sparkles size={15} />
              <span>{loadingExplain ? 'SYNTHESIZING...' : 'EXPLAIN CONCEPT'}</span>
            </button>
          </div>

          <div className="lg:col-span-8 hud-panel rounded-2xl p-5 min-h-[350px]">
            <h3 className="font-hud text-xs text-slate-400 font-bold tracking-wider uppercase mb-3">
              SYNTHESIZED EXPLANATION
            </h3>
            {explanationResult ? (
              <div className="prose prose-invert max-w-none text-sm text-slate-200 whitespace-pre-line leading-relaxed bg-jarvis-dark/60 p-4 rounded-xl border border-jarvis-border">
                {explanationResult}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <BookOpen size={36} className="opacity-40 mb-2 text-jarvis-cyan" />
                <p className="text-xs font-mono">Enter a computer science topic to synthesize an explanation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PRACTICE QUIZ */}
      {activeSubTab === 'quiz' && (
        <div className="space-y-4">
          <div className="hud-panel rounded-2xl p-4 flex items-center space-x-3">
            <input
              type="text"
              value={quizSubject}
              onChange={(e) => setQuizSubject(e.target.value)}
              placeholder="Enter subject or exam topic (e.g. Operating Systems Deadlocks)"
              className="flex-1 bg-jarvis-dark border border-jarvis-border rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
            />
            <button
              onClick={handleGenerateQuiz}
              disabled={loadingQuiz}
              className="px-5 py-2.5 rounded-xl bg-jarvis-cyan text-jarvis-dark font-hud font-bold text-xs hover:bg-white transition-colors"
            >
              {loadingQuiz ? 'GENERATING...' : 'GENERATE QUIZ'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quizQuestions.length > 0 ? (
              quizQuestions.map((q) => (
                <div key={q.id} className="hud-panel rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-jarvis-cyan uppercase px-2 py-0.5 rounded bg-jarvis-cyan/10 border border-jarvis-cyan/30">
                      QUESTION {q.id}
                    </span>
                    <p className="text-sm font-semibold text-slate-100 mt-2">{q.question}</p>

                    <div className="space-y-2 mt-4">
                      {q.options?.map((opt: string, i: number) => {
                        const optKey = opt.charAt(0);
                        const isSelected = selectedAnswers[q.id] === optKey;
                        const isCorrect = isSelected && optKey === q.correct_answer;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optKey })}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                  : 'bg-red-500/20 border-red-500 text-red-300'
                                : 'bg-jarvis-dark/60 border-jarvis-border text-slate-300 hover:border-slate-500'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedAnswers[q.id] && (
                    <div className="pt-3 border-t border-jarvis-border/60 text-xs font-sans text-slate-300">
                      <span className="font-bold text-emerald-400">Answer: {q.correct_answer}</span> — {q.explanation}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-3 hud-panel rounded-2xl p-12 text-center text-slate-500">
                <HelpCircle size={36} className="mx-auto mb-2 opacity-40 text-jarvis-cyan" />
                <p className="text-xs font-mono">Click "Generate Quiz" to create practice questions with answer keys.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. WORD DOCUMENT GENERATOR */}
      {activeSubTab === 'docx' && (
        <div className="hud-panel rounded-2xl p-6 space-y-4 max-w-4xl mx-auto">
          <div>
            <h3 className="font-hud text-sm text-slate-100 font-bold tracking-wider uppercase mb-1">
              WORD DOCUMENT GENERATION (.DOCX)
            </h3>
            <p className="text-xs font-mono text-slate-400">
              JARVIS will format your lecture notes and assignment drafts into professional Word documents.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">DOCUMENT TITLE</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">CONTENT / NOTES (MARKDOWN COMPATIBLE)</label>
            <textarea
              rows={8}
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-jarvis-cyan leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleGenerateDocx}
              disabled={loadingDoc}
              className="px-6 py-2.5 rounded-xl bg-jarvis-cyan text-jarvis-dark font-hud font-bold text-xs hover:bg-white transition-colors"
            >
              {loadingDoc ? 'CREATING DOCUMENT...' : 'GENERATE .DOCX FILE'}
            </button>

            {docResult && (
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
                <CheckCircle size={15} />
                <span>SAVED: {docResult.filename}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CODE REVIEWER */}
      {activeSubTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 hud-panel rounded-2xl p-5 space-y-3">
            <h3 className="font-hud text-xs text-jarvis-cyan font-bold tracking-wider uppercase">
              SOURCE CODE EDITOR
            </h3>
            <textarea
              rows={12}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-jarvis-cyan leading-relaxed"
            />
            <button
              onClick={handleAnalyzeCode}
              disabled={loadingCode}
              className="w-full py-2.5 rounded-xl bg-jarvis-cyan text-jarvis-dark font-hud font-bold text-xs hover:bg-white transition-colors"
            >
              {loadingCode ? 'INSPECTING ALGORITHM...' : 'ANALYZE CODE & COMPLEXITY'}
            </button>
          </div>

          <div className="lg:col-span-5 hud-panel rounded-2xl p-5">
            <h3 className="font-hud text-xs text-slate-400 font-bold tracking-wider uppercase mb-3">
              STATIC ANALYSIS RESULTS
            </h3>
            {codeAnalysis ? (
              <div className="space-y-3 text-xs font-mono bg-jarvis-dark/60 p-4 rounded-xl border border-jarvis-border">
                <div>
                  <span className="text-slate-500 block text-[10px]">TIME COMPLEXITY</span>
                  <span className="text-emerald-400 font-bold">{codeAnalysis.estimated_complexity || 'O(1)'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">INSPECTION FINDINGS</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 mt-1">
                    {codeAnalysis.findings?.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <Code2 size={36} className="opacity-40 mb-2 text-jarvis-cyan" />
                <p className="text-xs font-mono">Paste code to inspect logic and Big-O runtime bounds.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
