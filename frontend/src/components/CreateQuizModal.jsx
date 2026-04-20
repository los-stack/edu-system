import React, { useState, useCallback, memo } from 'react';

// ОПТИМІЗАЦІЯ: Компонент питання тепер працює як "Акордеон". 
// Це розвантажує браузер під час скролу, бо малюється лише одне активне питання.
const QuestionItem = memo(({ 
    q, qIndex, isExpanded, onToggle, handleQuestionChange, handleOptionChange, 
    setCorrectOption, addOption, removeOption, removeQuestion, canRemoveQuestion 
}) => {
    
    // Згорнутий вигляд (дуже легкий для браузера)
    if (!isExpanded) {
        return (
            <div 
                onClick={() => onToggle(qIndex)}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {qIndex + 1}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {q.question_text ? q.question_text : <span className="text-gray-400 italic">Нове питання...</span>}
                    </span>
                </div>
                <svg className="w-5 h-5 text-gray-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        );
    }

    // Розгорнутий вигляд (для редагування)
    return (
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl border-2 border-blue-500 dark:border-blue-600 shadow-md relative">
            <div className="flex justify-between items-center mb-5 cursor-pointer" onClick={() => onToggle(qIndex)}>
                <h4 className="text-md font-black text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm">{qIndex + 1}</span>
                    Редагування питання
                </h4>
                <div className="flex items-center gap-4">
                    {canRemoveQuestion && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeQuestion(qIndex); }} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> 
                            <span className="hidden sm:inline">Видалити</span>
                        </button>
                    )}
                    <svg className="w-5 h-5 text-blue-500 shrink-0 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            
            <textarea value={q.question_text} onChange={e => handleQuestionChange(qIndex, e.target.value)} required rows="2" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 mb-5 resize-none font-medium" placeholder="Введіть текст питання..." />

            <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Варіанти відповідей (позначте правильний)</p>
                {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-3">
                        <input 
                            type="radio" 
                            name={`correct-${qIndex}`} 
                            checked={q.correct_option_index === optIndex} 
                            onChange={() => setCorrectOption(qIndex, optIndex)}
                            className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 cursor-pointer mt-0.5 shrink-0"
                            title="Позначити як правильну відповідь"
                        />
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={opt} 
                                onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)} 
                                required 
                                className={`w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-900 border text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors ${q.correct_option_index === optIndex ? 'border-green-400 dark:border-green-600 focus:ring-green-500 text-green-900 dark:text-green-100 font-medium bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 focus:ring-blue-500'}`} 
                                placeholder={`Варіант ${optIndex + 1}`} 
                            />
                            {q.options.length > 2 && (
                                <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                {q.options.length < 6 && (
                    <button type="button" onClick={() => addOption(qIndex)} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1.5 mt-4 py-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Додати варіант
                    </button>
                )}
            </div>
        </div>
    );
});

function CreateQuizModal({ isOpen, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [expandedIndex, setExpandedIndex] = useState(0); // Стан для Акордеону (відкрито 1-ше питання)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 sm:p-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-full">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Створити новий тест</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30 dark:bg-gray-900/20">
                    <form id="quizForm" onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                        <div className="space-y-4 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Назва тесту</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Наприклад: Підсумковий тест за модулем 1" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Опис (опціонально)</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="Коротка інструкція для студентів..." />
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

                        <button type="button" onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-blue-300 dark:border-blue-800/50 rounded-xl text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Додати питання
                        </button>
                    </form>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Скасувати</button>
                    <button type="submit" form="quizForm" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Зберегти тест
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(CreateQuizModal);