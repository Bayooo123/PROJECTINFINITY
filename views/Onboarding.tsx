

import React, { useState, useEffect } from 'react';
import { UserProfile, COURSE_STRUCTURE } from '../types';
import { Button } from '../components/Button';
import { Check, ChevronDown, ChevronUp, Quote } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [level, setLevel] = useState('100 Level');
  
  // Course Selection State
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  // Auto-select compulsory courses when level changes
  useEffect(() => {
    if (step === 2) {
      const levelData = COURSE_STRUCTURE[level];
      if (levelData) {
        // Start with compulsory courses for the user's level
        const initialCourses = new Set(levelData.compulsory);
        setSelectedCourses(initialCourses);
        // Expand the user's current level by default
        setExpandedLevels(new Set([level]));
      }
    }
  }, [step, level]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && university) {
      setStep(2);
    }
  };

  const handleStep2Submit = () => {
    setStep(3);
  };

  const toggleCourse = (course: string) => {
    const newSelection = new Set(selectedCourses);
    if (newSelection.has(course)) {
      newSelection.delete(course);
    } else {
      newSelection.add(course);
    }
    setSelectedCourses(newSelection);
  };

  const toggleLevelExpand = (lvl: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(lvl)) {
      newExpanded.delete(lvl);
    } else {
      newExpanded.add(lvl);
    }
    setExpandedLevels(newExpanded);
  };

  const handleFinalSubmit = () => {
    onComplete({
      name,
      university,
      level,
      courses: Array.from(selectedCourses),
      hasOnboarded: true
    });
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-6">
               <img src="learned_logo.png" alt="Learned Logo" className="h-24 w-auto" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 -mt-4">Welcome to Learned</h1>
            <p className="text-slate-600 leading-relaxed font-medium">
              The educational development of Nigeria is the shared responsibility of all Nigerians. Read Section 14(2)b, Section 18, and Section 20-21.
            </p>
          </div>

          <form onSubmit={handleStep1Submit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Chisom Adebayo"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="university" className="block text-sm font-medium text-slate-700">University</label>
              <input
                type="text"
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                placeholder="e.g. University of Lagos"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="level" className="block text-sm font-medium text-slate-700">Level</label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="100 Level">100 Level</option>
                <option value="200 Level">200 Level</option>
                <option value="300 Level">300 Level</option>
                <option value="400 Level">400 Level</option>
                <option value="500 Level">500 Level</option>
                <option value="Law School">Law School</option>
              </select>
            </div>

            <Button type="submit" fullWidth className="mt-4">
              Next Step
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 py-12">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Select Your Courses</h2>
            <p className="text-slate-600">
              We've selected compulsory courses for <span className="font-semibold text-slate-900">{level}</span>. <br/>
              Please add your electives and any carryover courses.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-medium text-slate-700">Course List</span>
              <span className="text-sm text-amber-600 font-medium">{selectedCourses.size} Selected</span>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {Object.entries(COURSE_STRUCTURE).map(([lvl, data]) => {
                const isCurrentLevel = lvl === level;
                const isExpanded = expandedLevels.has(lvl);

                return (
                  <div key={lvl} className="bg-white">
                    <button 
                      onClick={() => toggleLevelExpand(lvl)}
                      className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${isCurrentLevel ? 'bg-amber-50 hover:bg-amber-50/80' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                         <span className={`font-bold ${isCurrentLevel ? 'text-amber-700' : 'text-slate-700'}`}>{lvl}</span>
                         {isCurrentLevel && <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">My Level</span>}
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Compulsory */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Compulsory</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {data.compulsory.map(course => (
                              <label key={course} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:border-amber-500 transition-all">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCourses.has(course) ? 'bg-amber-600 border-amber-600' : 'border-slate-300 bg-white'}`}>
                                  {selectedCourses.has(course) && <Check size={14} className="text-white" />}
                                </div>
                                <input 
                                  type="checkbox" 
                                  className="hidden"
                                  checked={selectedCourses.has(course)}
                                  onChange={() => toggleCourse(course)}
                                />
                                <span className="text-sm font-medium text-slate-700">{course}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Electives */}
                        {data.electives.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Electives</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {data.electives.map(course => (
                                <label key={course} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:border-amber-500 transition-all">
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCourses.has(course) ? 'bg-amber-600 border-amber-600' : 'border-slate-300 bg-white'}`}>
                                    {selectedCourses.has(course) && <Check size={14} className="text-white" />}
                                  </div>
                                  <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={selectedCourses.has(course)}
                                    onChange={() => toggleCourse(course)}
                                  />
                                  <span className="text-sm font-medium text-slate-700">{course}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button fullWidth onClick={handleStep2Submit} disabled={selectedCourses.size === 0}>
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Manifesto / Welcome Message
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-900 to-amber-600"></div>
        <div className="absolute -right-10 -top-10 text-slate-100 opacity-50 pointer-events-none">
          <Quote size={180} />
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-tight">
            The development of the Nigerian educational sector is the shared responsibility of all Nigerian institutions and stakeholders.
          </h2>

          <div className="space-y-6 text-slate-700 text-lg leading-relaxed font-serif">
            <p>
              The right to education as recognised under the Nigerian constitution is categorised under the class of socio-economic rights. This classification has ssubjected education to a second class concern of the government and this can be seen in the non-justiciability of educational rights. A more appropriate constitutional interpretation would be that though the right to education is non-justiciable all stakeholders within and without the Nigerian government must work independently and jointly to develop the Nigerian educational sector.
            </p>
            <p>
              Learned seeks to address the issue of academic underperformance within the context of law students across Nigeria. Academic underperformance can be a failure of the state, institutions, the family and even students but its consequences are far reaching and all encompassing.
            </p>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <p className="text-xl font-bold text-slate-900 mb-1">Join Learned today.</p>
            <p className="text-lg text-slate-600 mb-8">Enjoy the right to education and lets grow together.</p>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="font-serif font-bold text-lg text-slate-900">Adebayo Gbadebo</p>
                <p className="text-amber-700 font-medium">Co-founder, Learned</p>
              </div>
              
              <Button onClick={handleFinalSubmit} className="px-8 py-4 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                Enter Learned
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
