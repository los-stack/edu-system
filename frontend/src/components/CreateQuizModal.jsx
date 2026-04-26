import React, { useState, useCallback, memo } from 'react';

const QuestionItem = memo(({ 
    q, qIndex, isExpanded, onToggle, handleQuestionChange, handleOptionChange, 
    setCorrectOption, addOption, removeOption, removeQuestion, canRemoveQuestion 
}) => {
    
    if (!isExpanded) {
        return (
            <div 
                onClick={() => onToggle(qIndex)}
                className="bg-white dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 flex justify-between items-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
                <div className="flex items-center gap-4 overflow-hidden">
                    <span className="bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {qIndex + 1}
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {q.question_text ? q.question_text : <span className="text-zinc-400 italic">Нове питання...</span>}
                    </span>
                </div>
                <svg className="w-5 h-5 text-zinc-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border-2 border-blue-500 shadow-md shadow-blue-500/10 dark:shadow-none relative">
            <div className="flex justify-between items-center mb-5 cursor-pointer" onClick={() => onToggle(qIndex)}>
                <h4 className="text-md font-black text-blue-600 dark:text-blue-400 flex items-center gap-3">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm">{qIndex + 1}</span>
                    Редагування питання
                </h4>
                <div className="flex items-center gap-4">
                    {canRemoveQuestion && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeQuestion(qIndex); }} className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-sm font-bold flex items-center gap-1 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> 
                            <span className="hidden sm:inline">Видалити</span>
                        </button>
                    )}
                    <svg className="w-5 h-5 text-blue-500 shrink-0 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            
            <textarea value={q.question_text} onChange={e => handleQuestionChange(qIndex, e.target.value)} required rows="2" className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 resize-none font-medium transition-all" placeholder="Введіть текст питання..." />

            <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Варіанти відповідей (позначте правильний)</p>
                {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-3">
                        <input 
                            type="radio" 
                            name={`correct-${qIndex}`} 
                            checked={q.correct_option_index === optIndex} 
                            onChange={() => setCorrectOption(qIndex, optIndex)}
                            className="w-5 h-5 text-green-600 bg-zinc-100 border-zinc-300 focus:ring-green-500 dark:bg-zinc-800 dark:border-zinc-600 cursor-pointer shrink-0"
                            title="Позначити як правильну відповідь"
                        />
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={opt} 
                                onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)} 
                                required 
                                className={`w-full pl-4 pr-10 py-3 bg-white dark:bg-zinc-900 border text-sm rounded-xl focus:outline-none transition-all ${q.correct_option_index === optIndex ? 'border-green-400 dark:border-green-500 focus:ring-2 focus:ring-green-500 text-green-900 dark:text-green-100 font-bold bg-green-50 dark:bg-green-500/10' : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 font-medium'}`} 
                                placeholder={`Варіант ${optIndex + 1}`} 
                            />
                            {q.options.length > 2 && (
                                <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                {q.options.length < 6 && (
                    <button type="button" onClick={() => addOption(qIndex)} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors flex items-center gap-1.5 mt-4 py-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg> Додати варіант
                    </button>
                )}
            </div>
        </div>
    );
});

function CreateQuizModal({ isOpen, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [expandedIndex, setExpandedIndex] = useState(0); 
    const [questions, setQuestions] = useState([
        { question_text: '', options: ['', ''], correct_option_index: 0 }
    ]);

    const toggleExpand = useCallback((index) => {
        setExpandedIndex(prev => prev === index ? -1 : index);
    }, []);

    const handleQuestionChange = useCallback((index, value) => {
        setQuestions(prev => {
            const newQs = [...prev];
            newQs[index] = { ...newQs[index], question_text: value };
            return newQs;
        });
    }, []);

    const handleOptionChange = useCallback((qIndex, optIndex, value) => {
        setQuestions(prev => {
            const newQs = [...prev];
            const newOptions = [...newQs[qIndex].options];
            newOptions[optIndex] = value;
            newQs[qIndex] = { ...newQs[qIndex], options: newOptions };
            return newQs;
        });
    }, []);

    const setCorrectOption = useCallback((qIndex, optIndex) => {
        setQuestions(prev => {
            const newQs = [...prev];
            newQs[qIndex] = { ...newQs[qIndex], correct_option_index: optIndex };
            return newQs;
        });
    }, []);

    const addOption = useCallback((qIndex) => {
        setQuestions(prev => {
            const newQs = [...prev];
            if (newQs[qIndex].options.length < 6) {
                newQs[qIndex] = { ...newQs[qIndex], options: [...newQs[qIndex].options, ''] };
            }
            return newQs;
        });
    }, []);

    const removeOption = useCallback((qIndex, optIndex) => {
        setQuestions(prev => {
            const newQs = [...prev];
            if (newQs[qIndex].options.length > 2) {
                const newOptions = [...newQs[qIndex].options];
                newOptions.splice(optIndex, 1);
                let newCorrectIndex = newQs[qIndex].correct_option_index;
                if (newCorrectIndex >= newOptions.length) newCorrectIndex = 0;
                newQs[qIndex] = { ...newQs[qIndex], options: newOptions, correct_option_index: newCorrectIndex };
            }
            return newQs;
        });
    }, []);

    const addQuestion = useCallback(() => {
        setQuestions(prev => {
            const newIndex = prev.length;
            setExpandedIndex(newIndex); 
            return [...prev, { question_text: '', options: ['', ''], correct_option_index: 0 }];
        });
    }, []);

    const removeQuestion = useCallback((index) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
        setExpandedIndex(prev => (prev === index ? -1 : prev));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].question_text.trim()) {
                setExpandedIndex(i); 
                return alert(`Питання ${i + 1} не має тексту.`);
            }
            for (let j = 0; j < questions[i].options.length; j++) {
                if (!questions[i].options[j].trim()) {
                    setExpandedIndex(i);
                    return alert(`У питанні ${i + 1} є порожній варіант відповіді.`);
                }
            }
        }

        onCreate({ title, description, questions });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 p-4 sm:p-6">
            <div className="bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl dark:shadow-none dark:border dark:border-zinc-800 w-full max-w-3xl flex flex-col max-h-full border border-transparent">
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-transparent shrink-0">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Створити новий тест</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-zinc-50/30 dark:bg-zinc-950/20">
                    <form id="quizForm" onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                        <div className="space-y-5 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Назва тесту</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium transition-all" placeholder="Наприклад: Підсумковий тест за модулем 1" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Опис (опціонально)</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none text-sm font-medium transition-all" placeholder="Коротка інструкція для студентів..." />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {questions.map((q, qIndex) => (
                                <QuestionItem 
                                    key={qIndex} 
                                    q={q} 
                                    qIndex={qIndex} 
                                    isExpanded={expandedIndex === qIndex}
                                    onToggle={toggleExpand}
                                    handleQuestionChange={handleQuestionChange}
                                    handleOptionChange={handleOptionChange}
                                    setCorrectOption={setCorrectOption}
                                    addOption={addOption}
                                    removeOption={removeOption}
                                    removeQuestion={removeQuestion}
                                    canRemoveQuestion={questions.length > 1}
                                />
                            ))}
                        </div>

                        <button type="button" onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-2xl text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                            Додати питання
                        </button>
                    </form>
                </div>
                
                <div className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-zinc-900 shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">Скасувати</button>
                    <button type="submit" form="quizForm" className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 dark:shadow-none flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        Зберегти тест
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(CreateQuizModal);