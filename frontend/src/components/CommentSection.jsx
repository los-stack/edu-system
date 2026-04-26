import React, { useState } from 'react';

const CommentSection = ({ assignmentId, comments, currentUser, isOpen, onToggle, onCommentSubmit }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onCommentSubmit(assignmentId, text);
        setText('');
    };

    return (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
            {/* Кнопка розгортання */}
            <button 
                onClick={() => onToggle(assignmentId)} 
                className="w-full py-4 px-8 flex items-center justify-between text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors focus:outline-none"
            >
                <span className="flex items-center gap-2.5">
                    <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Обговорення завдання 
                    {comments.length > 0 && (
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full text-xs border border-zinc-200 dark:border-zinc-700">
                            {comments.length}
                        </span>
                    )}
                </span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            {/* Зона коментарів */}
            {isOpen && (
                <div className="p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50">
                    <div className="space-y-6 mb-6 max-h-87.5 overflow-y-auto custom-scrollbar pr-2">
                        {comments.length === 0 ? (
                            <p className="text-center text-sm text-zinc-500 dark:text-zinc-500 py-6 font-medium">Ще немає коментарів. Будьте першим!</p>
                        ) : (
                            comments.map((comment, index) => {
                                // Перевіряємо, чи це наше повідомлення
                                const isMe = comment.user_id === currentUser.id;
                                const isTeacher = comment.user_role === 'teacher' || comment.user_role === 'admin';
                                
                                return (
                                    <div key={comment.id || index} className={`flex gap-3 sm:gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        
                                        {/* Аватарка */}
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 text-xs sm:text-sm font-bold shadow-sm ${isTeacher ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50' : 'bg-white border border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'}`}>
                                            {comment.user_name?.charAt(0).toUpperCase()}
                                        </div>
                                        
                                        {/* Бульбашка тексту */}
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
                                            <div className="flex items-baseline gap-2 mb-1.5 px-1">
                                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{isMe ? 'Ви' : comment.user_name}</span>
                                                {isTeacher && !isMe && <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Викладач</span>}
                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{new Date(comment.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            
                                            <div className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed ${
                                                isMe 
                                                ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-600/20 dark:shadow-none' 
                                                : 'bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 rounded-tl-sm shadow-sm dark:shadow-none'
                                            }`}>
                                                {comment.text}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    {/* Форма вводу */}
                    <form onSubmit={handleSubmit} className="flex gap-3 relative mt-2">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-sm font-bold text-zinc-600 dark:text-zinc-300 shadow-sm">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 relative flex items-center">
                            <input 
                                type="text" 
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Написати повідомлення..." 
                                className="w-full px-5 py-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 dark:focus:border-blue-500 transition-all pr-14 text-sm shadow-sm dark:shadow-none"
                            />
                            <button 
                                type="submit"
                                disabled={!text.trim()}
                                className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl disabled:opacity-0 disabled:scale-75 transition-all duration-200 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CommentSection;