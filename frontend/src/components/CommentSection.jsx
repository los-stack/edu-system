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
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/50 border-t border-gray-100 hover:bg-gray-100 transition-colors focus:outline-none"
            >
                <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                    Коментарі класу ({comments.length})
                </span>
                <svg className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {isOpen && (
                <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/30">
                    <div className="space-y-0 mb-6 border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                        {comments.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">
                                Поки немає коментарів. Задайте питання першим!
                            </div>
                        ) : (
                            comments.map((comment, index) => {
                                const isMe = comment.user_id === currentUser.id;
                                const isLast = index === comments.length - 1;
                                
                                return (
                                    <div key={comment.id} className={`flex gap-4 p-5 hover:bg-gray-50/50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}>
                                        <div className="shrink-0 mt-1">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${comment.user_role === 'teacher' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {comment.user_name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-2 mb-1">
                                                <span className="text-sm font-bold text-gray-900">{isMe ? 'Ви' : comment.user_name}</span>
                                                {comment.user_role === 'teacher' && (
                                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">Викладач</span>
                                                )}
                                                <span className="text-xs text-gray-400 ml-auto">
                                                    {new Date(comment.created_at).toLocaleString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word">{comment.text}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                        <div className="hidden sm:flex w-9 h-9 mt-1 shrink-0 rounded-full bg-blue-50 items-center justify-center text-sm font-bold text-blue-700 border border-blue-100">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <textarea 
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Додати коментар для всього класу..." 
                                required 
                                rows="2"
                                className="w-full px-4 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none shadow-sm" 
                            />
                            <div className="flex justify-end mt-2">
                                <button type="submit" className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm inline-flex items-center gap-2">
                                    <span>Надіслати</span>
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