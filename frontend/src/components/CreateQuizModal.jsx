import React, { useState } from 'react';

function CreateQuizModal({ isOpen, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    const [questions, setQuestions] = useState([
        { 
            text: '', 
            options: [
                { text: '', isCorrect: true }, 
                { text: '', isCorrect: false }
            ] 
        }
    ]);

    if (!isOpen) return null;

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
    };

    const removeQuestion = (qIndex) => {
        setQuestions(questions.filter((_, i) => i !== qIndex));
    };

    const updateQuestionText = (text, qIndex) => {
        const newQs = [...questions];
        newQs[qIndex].text = text;
        setQuestions(newQs);
    };

    const addOption = (qIndex) => {
        const newQs = [...questions];
        newQs[qIndex].options.push({ text: '', isCorrect: false });
        setQuestions(newQs);
    };

    const removeOption = (qIndex, optIndex) => {
        const newQs = [...questions];
        newQs[qIndex].options = newQs[qIndex].options.filter((_, i) => i !== optIndex);
        setQuestions(newQs);
    };

    const updateOptionText = (text, qIndex, optIndex) => {
        const newQs = [...questions];
        newQs[qIndex].options[optIndex].text = text;
        setQuestions(newQs);
    };

    const setCorrectOption = (qIndex, optIndex) => {
        const newQs = [...questions];
        newQs[qIndex].options.forEach(opt => opt.isCorrect = false);
        newQs[qIndex].options[optIndex].isCorrect = true;
        setQuestions(newQs);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (questions.length === 0) return alert("Додайте хоча б одне питання!");
        
        const payload = { title, description, questions };
        onCreate(payload);
        
        setTitle(''); setDescription(''); 
        setQuestions([{ text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
                
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        Конструктор тесту
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="quizForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Назва тесту</label>
                                <input type="text" placeholder="Наприклад: Підсумковий тест з модуля 1" value={title} onChange={(e) => setTitle(e.target.value)} required 
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Короткий опис або інструкція</label>
                                <textarea placeholder="У вас буде 15 хвилин на проходження..." value={description} onChange={(e) => setDescription(e.target.value)} rows="2"
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-5 border border-gray-200 rounded-xl relative bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-4 gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-gray-800 mb-1.5">Питання {qIndex + 1}</label>
                                            <input type="text" placeholder="Введіть запитання..." value={q.text} onChange={(e) => updateQuestionText(e.target.value, qIndex)} required 
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                        </div>
                                        <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-600 mt-6 p-1 transition-colors" title="Видалити питання">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>

                                    <div className="space-y-2.5 pl-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Варіанти відповідей (виберіть правильний)</label>
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                                <input 
                                                    type="radio" 
                                                    name={`correct-${qIndex}`} 
                                                    checked={opt.isCorrect} 
                                                    onChange={() => setCorrectOption(qIndex, optIndex)}
                                                    className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                                />
                                                <input type="text" placeholder={`Варіант ${optIndex + 1}`} value={opt.text} onChange={(e) => updateOptionText(e.target.value, qIndex, optIndex)} required 
                                                    className={`flex-1 px-3 py-1.5 text-sm bg-transparent border-none focus:ring-0 ${opt.isCorrect ? 'font-medium text-green-900' : 'text-gray-700'}`} />
                                                
                                                {q.options.length > 2 && (
                                                    <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button type="button" onClick={() => addOption(qIndex)} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        Додати варіант
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-bold text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex justify-center items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Додати наступне питання
                        </button>
                        
                    </form>
                </div>
                
                {/* Футер модалки */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Скасувати
                    </button>
                    <button type="submit" form="quizForm" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Зберегти тест
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateQuizModal;