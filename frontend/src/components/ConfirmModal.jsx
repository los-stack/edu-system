import React from 'react';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl dark:shadow-none dark:border dark:border-zinc-800 w-full max-w-sm overflow-hidden transform transition-all border border-zinc-200/50">
                <div className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/30">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">{title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{message}</p>
                </div>
                <div className="px-6 py-4 bg-zinc-50/50 dark:bg-transparent border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                        Скасувати
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 dark:shadow-none">
                        Підтвердити
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;