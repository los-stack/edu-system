import React, { useState, memo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

function CreateAssignmentModal({ isOpen, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [file, setFile] = useState(null);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-full my-auto animate-scale-in">
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-transparent">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Створити нове завдання</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <form id="assignmentForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Назва завдання</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium" placeholder="Наприклад: Практична робота №1" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Опис завдання</label>
                            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                                <ReactQuill 
                                    theme="snow"
                                    value={description} 
                                    onChange={setDescription} 
                                    placeholder="Додайте детальний опис, інструкції..."
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Дедлайн</label>
                                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Матеріали (опціонально)</label>
                                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-zinc-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 dark:file:bg-zinc-800 file:text-blue-700 dark:file:text-zinc-300 hover:file:bg-blue-100 dark:hover:file:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 cursor-pointer" />
                            </div>
                        </div>

                    </form>
                </div>
                
                <div className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-transparent">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">Скасувати</button>
                    <button type="submit" form="assignmentForm" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 dark:shadow-none flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                        Створити
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(CreateAssignmentModal);