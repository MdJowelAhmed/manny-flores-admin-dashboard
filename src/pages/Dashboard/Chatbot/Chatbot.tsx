import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Calendar, FileText, DollarSign, Send, Mic, FileCheck2, MessageCircle,  } from 'lucide-react';

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{type: 'bot' | 'user', content: string}>>([
        {
            type: 'bot',
            content: "Hi! I'm your Stone assistant. I can help you with tasks, answer questions, and navigate the system. What can I help you with?"
        }
    ]);
    const [inputValue, setInputValue] = useState('');

    const quickActions = [
        { icon: FileCheck2, text: 'Show pending approvals' },
        { icon: FileText, text: 'Create new project' },
        { icon: Calendar, text: "View today's schedule" },
        { icon: DollarSign, text: 'Generate invoice' },
    ];

    const handleSend = (text?: string) => {
        const messageText = text || inputValue;
        if (!messageText.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { type: 'user', content: messageText }]);
        setInputValue('');

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: "I'm processing your request. This is a demo response." 
            }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-[#2F8DF5] hover:bg-blue-600 text-white rounded-full shadow-lg transition-all hover:scale-105 z-[9999] flex items-center justify-center"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-[400px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#2F8DF5] rounded-full flex items-center justify-center text-white">
                                    <MessageCircle className="w-6 h-6" />
                                   
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg">Stone Assistant</h3>
                                    <p className="text-xs text-gray-500">Online & ready</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="p-4 flex-1 overflow-y-auto max-h-[400px] bg-gray-50/50 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.type === 'bot' && index === 0 && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bot className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Stone Assistant</span>
                                        </div>
                                    )}
                                    <div 
                                        className={`p-3 rounded-2xl max-w-[90%] text-sm ${
                                            msg.type === 'user' 
                                                ? 'bg-[#2F8DF5] text-white rounded-br-sm' 
                                                : 'bg-white border border-gray-100 text-gray-600 rounded-tl-sm shadow-sm'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                    
                                    {/* Quick Actions for first message */}
                                    {msg.type === 'bot' && index === 0 && (
                                        <div className="w-full mt-3 space-y-2">
                                            {quickActions.map((action, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSend(action.text)}
                                                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group shadow-sm text-left"
                                                >
                                                    <div className="flex items-center gap-3 text-gray-600 group-hover:text-[#2F8DF5] transition-colors">
                                                        <action.icon className="w-4 h-4" />
                                                        <span className="text-sm font-medium">{action.text}</span>
                                                    </div>
                                                    <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#2F8DF5] transition-colors">
                                                        <span className="text-gray-400 group-hover:text-[#2F8DF5] text-xs">›</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                            <div className="flex-1 relative">
                                <input 
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask me anything..."
                                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2F8DF5] focus:ring-1 focus:ring-[#2F8DF5] transition-all text-sm"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <Mic className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                onClick={() => handleSend()}
                                className="p-3 bg-[#2F8DF5] hover:bg-blue-600 text-white rounded-xl transition-colors shadow-sm"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
