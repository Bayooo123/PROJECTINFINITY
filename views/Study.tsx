
import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage, UserProfile } from '../types';
import { Send, User, Bot, Info, Book, ChevronRight, ArrowLeft } from 'lucide-react';

interface StudyProps {
  user: UserProfile;
}

export const Study: React.FC<StudyProps> = ({ user }) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  // Helper to get user courses or fallback
  const userCourses = user.courses && user.courses.length > 0 
    ? user.courses 
    : ["Company Law", "Constitutional Law", "Criminal Law", "Legal Method"];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat when course changes
  useEffect(() => {
    if (selectedCourse) {
      setMessages([
        { 
          role: 'model', 
          text: `Welcome to the **${selectedCourse}** Study Room.\n\nI am ready to assist you with not just answers, but **exam predictions** and **study strategies**. Ask me about any topic, case, or section.` 
        }
      ]);
    }
  }, [selectedCourse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedCourse) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a temporary history without error messages for the AI
      const contextHistory = messages.filter(m => !m.isError);
      contextHistory.push(userMsg);

      const responseText = await sendChatMessage(contextHistory, userMsg.text, selectedCourse);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "I apologize, but I'm having trouble connecting to the legal database right now. Please check your connection or try again later.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // VIEW: Course Selection
  if (!selectedCourse) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-slate-900">Study Room</h2>
          <p className="text-slate-600">Select a course to enter its dedicated research environment.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userCourses.map((course) => (
            <button
              key={course}
              onClick={() => setSelectedCourse(course)}
              className="group text-left p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-amber-500 transition-all duration-200 flex flex-col justify-between h-40"
            >
              <div className="p-3 bg-slate-50 w-fit rounded-lg text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                <Book size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{course}</h3>
                <div className="flex items-center text-xs text-slate-400 group-hover:text-slate-500">
                  <span>Enter Room</span>
                  <ChevronRight size={14} className="ml-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // VIEW: Chat Interface
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-100px)] max-w-5xl mx-auto bg-white shadow-sm md:rounded-xl md:border md:border-slate-200 md:my-4 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedCourse(null)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            title="Switch Course"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-serif font-bold text-lg text-slate-900">{selectedCourse}</h2>
            <p className="text-xs text-amber-600 font-medium">Dedicated Research Assistant</p>
          </div>
        </div>
        <div className="hidden md:block px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">
          Context: Nigerian Legal System
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-amber-600 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-50 text-red-800 border border-red-100 rounded-tl-none' 
                    : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
              }`}>
                {/* Simple markdown-like formatting */}
                <div className="whitespace-pre-wrap font-light">
                  {msg.text.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[75%]">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a question about ${selectedCourse}...`}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none text-slate-900 transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-amber-600 hover:text-amber-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 justify-center">
          <Info size={10} />
          <span>AI assists with {selectedCourse}. Verify with primary sources.</span>
        </div>
      </div>
    </div>
  );
};
