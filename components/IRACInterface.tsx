import React, { useState } from 'react';
import { Plus, Trash2, BookOpen, Scale, FileText, CheckCircle2 } from 'lucide-react';

// Types
export interface Authority {
    id: string;
    name: string;
    citation: string;
    jurisdiction?: string;
    type: 'case' | 'statute';
}

export interface IRACEntry {
    id: string; // Internal stable ID
    number: number;
    issue: string;
    rule: string;
    authorities: Authority[];
    application: string;
    conclusion: string;
}

export interface ScenarioSubmission {
    scenario_id: string;
    entries: {
        number: number;
        issue: string;
        rule: string;
        authorities: string[]; // List of authority strings
        application: string;
        conclusion: string;
    }[];
}

// Mock Database of Authorities
const MOCK_AUTHORITIES: Authority[] = [
    { id: 'a1', name: 'Donoghue v Stevenson', citation: '[1932] AC 562', jurisdiction: 'UK', type: 'case' },
    { id: 'a2', name: 'Carlill v Carbolic Smoke Ball Co', citation: '[1893] 1 QB 256', jurisdiction: 'UK', type: 'case' },
    { id: 'a3', name: 'Offences Against the Person Act', citation: '1861', jurisdiction: 'UK', type: 'statute' },
    { id: 'a4', name: 'R v Brown', citation: '[1994] 1 AC 212', jurisdiction: 'UK', type: 'case' },
    { id: 'a5', name: 'Theft Act', citation: '1968', jurisdiction: 'UK', type: 'statute' },
];

interface IRACInterfaceProps {
    scenarioId?: string;
    scenarioText?: string;
    onSubmit?: (data: ScenarioSubmission) => void;
}

type TabType = 'Issue' | 'Rule' | 'Application' | 'Conclusion';

const TABS: { id: TabType; icon: React.FC<any>; label: string; description: string }[] = [
    { id: 'Issue', icon: BookOpen, label: 'Issue', description: 'Identify the legal issue or question' },
    { id: 'Rule', icon: Scale, label: 'Rule', description: 'State the relevant legal principles and authorities' },
    { id: 'Application', icon: FileText, label: 'Application', description: 'Apply the rule to the specific facts' },
    { id: 'Conclusion', icon: CheckCircle2, label: 'Conclusion', description: 'State the final answer to the issue' }
];

export const IRACInterface: React.FC<IRACInterfaceProps> = ({
    scenarioId = 'SC-TEST-123',
    scenarioText = 'The defendant, David, was driving his car at 50mph in a 30mph zone. He lost control and collided with a pedestrian, Peter, who was crossing the road. Peter suffered a broken leg and missed two months of work. David claims his brakes failed suddenly.',
    onSubmit
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('Issue');
    const [isScenarioCollapsed, setIsScenarioCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [entries, setEntries] = useState<IRACEntry[]>([
        {
            id: crypto.randomUUID(),
            number: 1,
            issue: '',
            rule: '',
            authorities: [],
            application: '',
            conclusion: ''
        }
    ]);

    const addEntry = () => {
        setEntries(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                number: prev.length + 1,
                issue: '',
                rule: '',
                authorities: [],
                application: '',
                conclusion: ''
            }
        ]);
    };

    const removeEntry = (idToRemove: string) => {
        if (entries.length === 1) return; // Keep at least one

        setEntries(prev => {
            const filtered = prev.filter(e => e.id !== idToRemove);
            // Renumber
            return filtered.map((e, index) => ({ ...e, number: index + 1 }));
        });
    };

    const updateEntry = (id: string, field: keyof IRACEntry, value: any) => {
        setEntries(prev => prev.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    const addAuthority = (entryId: string, authority: Authority) => {
        setEntries(prev => prev.map(entry => {
            if (entry.id === entryId) {
                // Prevent duplicates
                if (!entry.authorities.some(a => a.id === authority.id)) {
                    return { ...entry, authorities: [...entry.authorities, authority] };
                }
            }
            return entry;
        }));
        setSearchQuery('');
    };

    const removeAuthority = (entryId: string, authId: string) => {
        setEntries(prev => prev.map(entry =>
            entry.id === entryId
                ? { ...entry, authorities: entry.authorities.filter(a => a.id !== authId) }
                : entry
        ));
    };

    const handleSubmit = () => {
        // Validation
        const isValid = entries.every(e => e.issue.trim() !== '' && e.rule.trim() !== '');
        if (!isValid) {
            alert("Please ensure all Issue and Rule fields are filled before submitting.");
            return;
        }

        const payload: ScenarioSubmission = {
            scenario_id: scenarioId,
            entries: entries.map(e => ({
                number: e.number,
                issue: e.issue,
                rule: e.rule,
                authorities: e.authorities.map(a => `${a.name} ${a.citation}`),
                application: e.application,
                conclusion: e.conclusion
            }))
        };

        console.log("Submitting IRAC JSON:", JSON.stringify(payload, null, 2));
        if (onSubmit) onSubmit(payload);
    };

    const filteredAuthorities = MOCK_AUTHORITIES.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.citation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto bg-gray-50 min-h-screen pt-4 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Header and Scenario Panel */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div
                    className="px-6 py-4 bg-gray-800 text-white flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setIsScenarioCollapsed(!isScenarioCollapsed)}
                >
                    <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-semibold">Scenario Context</h2>
                        <span className="text-gray-400 text-sm">({scenarioId})</span>
                    </div>
                    <button className="text-gray-300 hover:text-white transition-colors">
                        {isScenarioCollapsed ? 'Expand' : 'Collapse'}
                    </button>
                </div>

                {!isScenarioCollapsed && (
                    <div className="px-6 py-5 text-gray-700 leading-relaxed text-lg border-t border-gray-100 bg-gray-50/50">
                        {scenarioText}
                    </div>
                )}
            </div>

            {/* Main IRAC content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 flex-1 flex flex-col">
                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto border-b border-gray-200 no-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                flex-1 flex flex-col items-center py-4 px-2 sm:px-4 min-w-[120px] transition-all duration-200 border-b-2
                ${activeTab === tab.id
                                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }
              `}
                        >
                            <tab.icon className={`w-6 h-6 mb-2 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content Header */}
                <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {TABS.find(t => t.id === activeTab)?.icon({ className: 'w-5 h-5 text-indigo-600' })}
                            {activeTab} Entries
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {TABS.find(t => t.id === activeTab)?.description}
                        </p>
                    </div>
                    <button
                        onClick={addEntry}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Entry
                    </button>
                </div>

                {/* Entries List */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto bg-gray-50/30 flex-1">
                    {entries.map((entry, index) => (
                        <div key={entry.id} className="bg-white border text-gray-800 border-gray-200 rounded-lg p-5 shadow-sm relative group transition-all duration-200 hover:shadow-md hover:border-indigo-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold text-sm mr-3">
                                        {entry.number}
                                    </span>
                                    <h4 className="font-semibold text-lg text-gray-900">
                                        {activeTab} {entry.number}
                                    </h4>
                                </div>
                                {entries.length > 1 && (
                                    <button
                                        onClick={() => removeEntry(entry.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-md hover:bg-red-50"
                                        title="Delete this entry"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Text Area for the active tab */}
                            <div className="mt-2">
                                <textarea
                                    className="w-full text-black bg-white p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[160px] resize-y text-base"
                                    placeholder={`Write your ${activeTab.toLowerCase()} here...`}
                                    value={entry[activeTab.toLowerCase() as keyof IRACEntry] as string || ''}
                                    onChange={(e) => updateEntry(entry.id, activeTab.toLowerCase() as keyof IRACEntry, e.target.value)}
                                />
                            </div>

                            {/* Special Authorities Section (Only shows in Rule tab) */}
                            {activeTab === 'Rule' && (
                                <div className="mt-6 border border-gray-200 rounded-md bg-gray-50 p-4">
                                    <h5 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-gray-500" />
                                        Linked Authorities
                                    </h5>

                                    {/* Selected Authorities Tags */}
                                    {entry.authorities.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {entry.authorities.map(auth => (
                                                <span key={auth.id} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                                                    {auth.name} <span className="opacity-70 ml-1 font-normal">{auth.citation}</span>
                                                    <button
                                                        onClick={() => removeAuthority(entry.id, auth.id)}
                                                        className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-600 focus:outline-none"
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        <svg className="h-4 w-4" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Authority Search/Input */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full sm:w-2/3 lg:w-1/2 p-2 border border-gray-300 rounded-md text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                                            placeholder="Search cases or statutes to link..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>

                                        {/* Autocomplete Dropdown */}
                                        {searchQuery && (
                                            <div className="absolute z-10 mt-1 w-full sm:w-2/3 lg:w-1/2 bg-white shadow-lg rounded-md text-black border border-gray-200 max-h-60 overflow-auto">
                                                {filteredAuthorities.length > 0 ? (
                                                    <ul className="py-1 text-sm">
                                                        {filteredAuthorities.map(auth => (
                                                            <li
                                                                key={auth.id}
                                                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 hover:text-indigo-900 border-b border-gray-100 last:border-0"
                                                                onClick={() => addAuthority(entry.id, auth)}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-gray-900">{auth.name}</span>
                                                                    <span className="text-gray-500 text-xs">{auth.citation} • {auth.type === 'case' ? 'Case Law' : 'Statute'}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="py-2 px-3 text-sm text-gray-500">No authorities found matching "{searchQuery}"</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500">
                    Entries: {entries.length} • Ensure Issue and Rule are filled for all entries.
                </div>
                <button
                    onClick={handleSubmit}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    Generate Output & Submit
                </button>
            </div>
        </div>
    );
};

export default IRACInterface;
