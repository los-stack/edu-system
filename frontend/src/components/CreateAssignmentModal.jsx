import React, { useState, lazy, Suspense, memo, useCallback } from 'react';
import 'react-quill-new/dist/quill.snow.css'; 

const ReactQuill = lazy(() => import('react-quill-new'));

const MemoizedQuill = memo(({ value, onChange, placeholder }) => (
    <Suspense fallback={<div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500">Завантаження редактора...</div>}>
        <ReactQuill 
            theme="snow" 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
        />
    </Suspense>
));

function CreateAssignmentModal({ isOpen, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [file, setFile] = useState(null);

    const handleDescriptionChange = useCallback((val) => {
        setDescription(val);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description); 
        formData.append('due_date', dueDate);
        if (file) {
            formData.append('file', file);
        }
        
        onCreate(formData);
        
        setTitle('');
        setDescription('');
        setDueDate('');
        setFile(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-full my-auto">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Створити нове завдання</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30 dark:bg-gray-900/20">
                    <form id="assignmentForm" onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
                        
                        <div className="space-y-4 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Назва завдання</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm font-medium" placeholder="Наприклад: Практична робота №1" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Опис завдання (Лекція)</label>
                                <MemoizedQuill 
                                    value={description} 
                                    onChange={handleDescriptionChange} 
                                    placeholder="Додайте детальний опис, інструкції, списки..."
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Дедлайн</label>
                                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Матеріали (опціонально)</label>
                                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900" />
                            </div>
                        </div>

                    </form>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Скасувати</button>
                    <button type="submit" form="assignmentForm" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Створити
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(CreateAssignmentModal);