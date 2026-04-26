import React, { useState, lazy, Suspense, memo, useCallback } from 'react';
import 'react-quill-new/dist/quill.snow.css'; 

const ReactQuill = lazy(() => import('react-quill-new'));

const MemoizedQuill = memo(({ value, onChange, placeholder }) => (
    <Suspense fallback={<div className="h-32 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-sm">Завантаження редактора...</div>}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-soft-lg w-full max-w-2xl flex flex-col max-h-full my-auto animate-scale-in">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Створити нове завдання</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    <form id="assignmentForm" onSubmit={handleSubmit} className="space-y-5">
                        
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Назва завдання</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Наприклад: Практична робота №1" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Опис завдання</label>
                            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                <MemoizedQuill 
                                    value={description} 
                                    onChange={handleDescriptionChange} 
                                    placeholder="Додайте детальний опис, інструкції..."
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Дедлайн</label>
                                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Матеріали (опціонально)</label>
                                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800" />
                            </div>
                        </div>

                    </form>
                </div>
                
                <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Скасувати</button>
                    <button type="submit" form="assignmentForm" className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Створити
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(CreateAssignmentModal);
