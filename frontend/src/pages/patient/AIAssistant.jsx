import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Bot, Send, User, ShieldAlert, Heart, Calendar, ArrowRight, Activity, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/GlassCard';

const AIAssistant = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your AI Health Assistant. Please describe any symptoms you are experiencing (e.g., 'chest pain', 'sore throat and high fever', 'dry skin rash') and I'll analyze them for you.",
      analysis: null,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await API.post('/ai/consult', { symptomDescription: userText });
      if (res.data.success) {
        const { analysis } = res.data;
        let replyText = `Based on your symptoms, I have recommended the **${analysis.recommendedDepartment}** department. `;

        if (analysis.isEmergency) {
          replyText += `🚨 **Attention:** Potential emergency symptoms detected. Please read the emergency advisory below.`;
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: replyText,
            analysis,
          },
        ]);
      }
    } catch (error) {
      addToast('Error analyzing symptoms. Please try again.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm sorry, I encountered an issue analyzing your symptoms. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-[calc(100vh-140px)] w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Bot className="w-7 h-7 text-indigo-500 animate-pulse" /> AI Health Advisor
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Describe your symptoms in natural language to receive instant clinical guidance.
        </p>
      </div>

      {}
      <GlassCard hoverEffect={false} className="flex-grow flex flex-col p-4 rounded-3xl overflow-hidden min-h-0 relative">
        <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-6 pb-6">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                    msg.sender === 'user'
                      ? 'bg-brand-500 shadow-md shadow-brand-500/20'
                      : 'bg-indigo-500 shadow-md shadow-indigo-500/20'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className="flex flex-col gap-3">
                  <div
                    className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-500 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/30 dark:border-slate-800'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {}
                  {msg.analysis && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col gap-4 mt-2"
                    >
                      {}
                      {msg.analysis.isEmergency && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-start gap-2">
                          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                          <div>
                            <span className="font-bold">Urgent Medical Alert:</span> Severe or life-threatening symptoms detected. Please contact local emergency services immediately.
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-850 flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                            Possible Conditions
                          </span>
                          <div className="flex flex-col gap-2 mt-1">
                            {msg.analysis.predictedConditions.map((cond, i) => (
                              <div key={i} className="flex flex-col gap-1 border-b pb-2 last:border-b-0 last:pb-0 dark:border-slate-800">
                                <div className="flex justify-between text-xs text-slate-800 dark:text-white font-semibold">
                                  <span>{cond.condition}</span>
                                  <span className="text-brand-500">{cond.confidence}%</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                      cond.severity === 'High'
                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                        : cond.severity === 'Medium'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    }`}
                                  >
                                    {cond.severity} Severity
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-850 flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                            Home Care & Precautions
                          </span>
                          <ul className="flex flex-col gap-1.5 mt-1">
                            {msg.analysis.suggestedPrecautions.map((prec, i) => (
                              <li key={i} className="text-xs text-slate-650 dark:text-slate-455 list-disc list-inside leading-relaxed">
                                {prec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {}
                      {msg.analysis.recommendedDoctors && msg.analysis.recommendedDoctors.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1">
                            Recommended Specialists in {msg.analysis.recommendedDepartment}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.analysis.recommendedDoctors.map((doc) => (
                              <div
                                key={doc._id}
                                className="p-3 bg-white dark:bg-slate-900/60 border rounded-2xl flex items-center justify-between gap-3 dark:border-slate-850"
                              >
                                <div className="flex items-center gap-2.5">
                                  {doc.userId.avatar ? (
                                    <img
                                      src={`http://localhost:5000${doc.userId.avatar}`}
                                      alt={doc.userId.name}
                                      className="w-10 h-10 rounded-xl object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl flex items-center justify-center font-bold text-sm">
                                      {doc.userId.name.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <h5 className="font-bold text-xs text-slate-800 dark:text-white">
                                      Dr. {doc.userId.name}
                                    </h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{doc.specialization}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => navigate(`/patient/book/${doc.userId._id}`)}
                                  className="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 rounded-lg transition-all"
                                  title="Book appointment"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3 self-start">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-indigo-500">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl rounded-tl-none border border-slate-200/30 dark:border-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef}></div>
        </div>

        {}
        <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t dark:border-slate-800 mt-auto bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe what you feel (e.g. 'I have had chest pain and short breath for 10 minutes')..."
            className="flex-grow px-4 py-3 rounded-xl glass-input text-xs sm:text-sm text-slate-800 dark:text-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="px-4 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </GlassCard>

      {}
      <div className="bg-slate-100 dark:bg-slate-900 p-3.5 border rounded-2xl text-[10px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-2 border-slate-200/50 dark:border-slate-800/80 leading-relaxed max-w-2xl mx-auto">
        <AlertTriangle className="w-5 h-5 text-amber-500/80 flex-shrink-0" />
        <p>
          <span className="font-bold uppercase text-amber-600 dark:text-amber-500/95">Disclaimer:</span> HAS AI predictions are for informational and educational purposes only. This analyzer is NOT a substitute for professional medical diagnosis, treatment, or clinical consultation. Always seek advice from a doctor for serious concerns.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
