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
    id: string;
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
        authorities: string[];
        application: string;
        conclusion: string;
    }[];
}

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
    { id: 'Conclusion', icon: CheckCircle2, label: 'Conclusion', description: 'State the final answer to the issue' },
];

export const IRACInterface: React.FC<IRACInterfaceProps> = ({
    scenarioId = 'SC-TEST-123',
    scenarioText = 'The defendant, David, was driving his car at 50mph in a 30mph zone. He lost control and collided with a pedestrian, Peter, who was crossing the road. Peter suffered a broken leg and missed two months of work. David claims his brakes failed suddenly.',
    onSubmit,
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
            conclusion: '',
        },
    ]);

    const addEntry = () => {
        setEntries((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                number: prev.length + 1,
                issue: '',
                rule: '',
                authorities: [],
                application: '',
                conclusion: '',
            },
        ]);
    };

    const removeEntry = (idToRemove: string) => {
        if (entries.length === 1) return;
        setEntries((prev) => {
            const filtered = prev.filter((e) => e.id !== idToRemove);
            return filtered.map((e, i) => ({ ...e, number: i + 1 }));
        });
    };

    const updateEntry = (id: string, field: keyof IRACEntry, value: any) => {
        setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
    };

    const addAuthority = (entryId: string, authority: Authority) => {
        setEntries((prev) =>
            prev.map((entry) => {
                if (entry.id === entryId && !entry.authorities.some((a) => a.id === authority.id)) {
                    return { ...entry, authorities: [...entry.authorities, authority] };
                }
                return entry;
            })
        );
        setSearchQuery('');
    };

    const removeAuthority = (entryId: string, authId: string) => {
        setEntries((prev) =>
            prev.map((entry) =>
                entry.id === entryId
                    ? { ...entry, authorities: entry.authorities.filter((a) => a.id !== authId) }
                    : entry
            )
        );
    };

    const handleSubmit = () => {
        const isValid = entries.every((e) => e.issue.trim() !== '' && e.rule.trim() !== '');
        if (!isValid) {
            alert('Please ensure all Issue and Rule fields are filled before submitting.');
            return;
        }
        const payload: ScenarioSubmission = {
            scenario_id: scenarioId,
            entries: entries.map((e) => ({
                number: e.number,
                issue: e.issue,
                rule: e.rule,
                authorities: e.authorities.map((a) => `${a.name} ${a.citation}`),
                application: e.application,
                conclusion: e.conclusion,
            })),
        };
        console.log('Submitting IRAC JSON:', JSON.stringify(payload, null, 2));
        if (onSubmit) onSubmit(payload);
    };

    const filteredAuthorities = MOCK_AUTHORITIES.filter(
        (a) =>
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.citation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto bg-stone-100 dark:bg-slate-950 min-h-screen pt-4 pb-12 px-4 sm:px-6 lg:px-8">

            {/* Scenario Panel */}
            <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div
                    className="px-6 py-4 bg-slate-900 dark:bg-slate-800 text-white flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setIsScenarioCollapsed(!isScenarioCollapsed)}
                >
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold">Scenario</h2>
                    </div>
                    <button className="text-slate-300 hover:text-white transition-colors text-sm">
                        {isScenarioCollapsed ? 'Expand' : 'Collapse'}
                    </button>
                </div>

                {!isScenarioCollapsed && (
                    <div className="px-6 py-5 text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        {scenarioText}
                    </div>
                )}
            </div>

            {/* Main IRAC content */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 flex-1 flex flex-col">

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center py-4 px-2 sm:px-4 min-w-[110px] transition-all duration-200 border-b-2 ${
                                activeTab === tab.id
                                    ? 'border-slate-900 dark:border-white bg-slate-100/40 dark:bg-slate-800/40 text-slate-900 dark:text-white'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <tab.icon
                                className={`w-5 h-5 mb-1.5 ${
                                    activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                                }`}
                            />
                            <span className="text-sm font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                            {activeTab} Entries
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {TABS.find((t) => t.id === activeTab)?.description}
                        </p>
                    </div>
                    <button
                        onClick={addEntry}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors gap-2 flex-shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add Entry
                    </button>
                </div>

                {/* Entries List */}
                <div className="p-4 sm:p-6 space-y-6 overflow-y-auto bg-slate-50/30 dark:bg-slate-800/10 flex-1">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative group transition-all duration-200 hover:shadow-md hover:border-slate-400 dark:hover:border-slate-500"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm">
                                        {entry.number}
                                    </span>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">
                                        {activeTab} {entry.number}
                                    </h4>
                                </div>
                                {entries.length > 1 && (
                                    <button
                                        onClick={() => removeEntry(entry.id)}
                                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Delete this entry"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Textarea */}
                            <textarea
                                className="w-full text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 min-h-[160px] resize-y text-base outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                placeholder={`Write your ${activeTab.toLowerCase()} here...`}
                                value={(entry[activeTab.toLowerCase() as keyof IRACEntry] as string) || ''}
                                onChange={(e) =>
                                    updateEntry(entry.id, activeTab.toLowerCase() as keyof IRACEntry, e.target.value)
                                }
                            />

                            {/* Authorities (Rule tab only) */}
                            {activeTab === 'Rule' && (
                                <div className="mt-5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                                    <h5 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        Linked Authorities
                                    </h5>

                                    {entry.authorities.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {entry.authorities.map((auth) => (
                                                <span
                                                    key={auth.id}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                                                >
                                                    {auth.name}{' '}
                                                    <span className="opacity-70 ml-1 font-normal">{auth.citation}</span>
                                                    <button
                                                        onClick={() => removeAuthority(entry.id, auth.id)}
                                                        className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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

                                    {/* Authority Search */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full sm:w-2/3 lg:w-1/2 p-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 outline-none"
                                            placeholder="Search cases or statutes to link..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>

                                        {searchQuery && (
                                            <div className="absolute z-10 mt-1 w-full sm:w-2/3 lg:w-1/2 bg-white dark:bg-slate-900 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-auto">
                                                {filteredAuthorities.length > 0 ? (
                                                    <ul className="py-1 text-sm">
                                                        {filteredAuthorities.map((auth) => (
                                                            <li
                                                                key={auth.id}
                                                                className="cursor-pointer py-2 pl-3 pr-4 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                                                                onClick={() => addAuthority(entry.id, auth)}
                                                            >
                                                                <span className="font-medium text-slate-900 dark:text-white block">
                                                                    {auth.name}
                                                                </span>
                                                                <span className="text-slate-500 dark:text-slate-400 text-xs">
                                                                    {auth.citation} · {auth.type === 'case' ? 'Case Law' : 'Statute'}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="py-3 px-3 text-sm text-slate-500 dark:text-slate-400">
                                                        No authorities found matching "{searchQuery}"
                                                    </div>
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

            {/* Footer */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · Issue and Rule required for each.
                </p>
                <button
                    onClick={handleSubmit}
                    className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold text-white dark:text-slate-900 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 transition-colors"
                >
                    Submit Analysis
                </button>
            </div>
        </div>
    );
};

export default IRACInterface;
