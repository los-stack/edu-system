import React, { useState } from 'react';

function CommentSection({ assignmentId, comments, currentUser, isOpen, onToggle, onCommentSubmit }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onCommentSubmit(assignmentId, text);
        setText('');
    };

    return (
        <>
            <button 
                onClick={() => onToggle(assignmentId)}
                className="w-full px-5 py-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                    Коментарі ({comments.length})
                </span>
                <svg className={`w-4 h-4 text-zinc-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {isOpen && (
                <div className="px-5 py-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <div className="space-y-0 mb-5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
                        {comments.length === 0 ? (
                            <div className="p-5 text-center text-sm text-zinc-500">
                                Поки немає коментарів.
                            </div>
                        ) : (
                            comments.map((comment, index) => {
                                const isMe = comment.user_id === currentUser.id;
                                const isLast = index === comments.length - 1;
                                
                                return (
                                    <div key={comment.id} className={`flex gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!isLast ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}>
                                        <div className="shrink-0">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${comment.user_role === 'teacher' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                {comment.user_name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-2 mb-1">
                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">{isMe ? 'Ви' : comment.user_name}</span>
                                                {comment.user_role === 'teacher' && (
                                                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400">Викладач</span>
                                                )}
                                                <span className="text-xs text-zinc-400 ml-auto">
                                                    {new Date(comment.created_at).toLocaleString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-3 items-start">
                        <div className="hidden sm:flex w-8 h-8 shrink-0 rounded-lg bg-primary-100 dark:bg-primary-900/50 items-center justify-center text-xs font-semibold text-primary-600 dark:text-primary-400">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <textarea 
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Додати коментар..." 
                                required 
                                rows="2"
                                className="w-full px-3 py-2.5 text-sm text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none" 
                            />
                            <div className="flex justify-end mt-2">
                                <button type="submit" className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 transition-colors inline-flex items-center gap-1.5">
                                    Надіслати
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

export default CommentSection;
