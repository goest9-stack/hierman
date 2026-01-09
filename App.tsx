import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, Attachment, GenerationConfig } from './types';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { Send, Paperclip, X, Menu } from './components/Icons';
import { streamResponse, fileToGenerativePart } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  
  const [config, setConfig] = useState<GenerationConfig>({
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    systemInstruction: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Textarea Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      const newAttachments: Attachment[] = [];
      
      for (const file of files) {
        try {
          const attachment = await fileToGenerativePart(file);
          newAttachments.push(attachment);
        } catch (e) {
          console.error("Failed to process file", file.name, e);
          alert(`Failed to load ${file.name}`);
        }
      }
      setAttachments(prev => [...prev, ...newAttachments]);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearChat = () => {
    setMessages([]);
    setAttachments([]);
    setInput('');
  };

  const handleSubmit = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: input,
      attachments: [...attachments],
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    // Create placeholder for AI response
    const aiMessageId = (Date.now() + 1).toString();
    const aiPlaceholder: Message = {
      id: aiMessageId,
      role: Role.MODEL,
      text: '', // Start empty
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      await streamResponse(
        selectedModel,
        [...messages, userMessage],
        userMessage.text,
        userMessage.attachments || [],
        config,
        (currentText) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: currentText } : msg
          ));
        }
      );
    } catch (error: any) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, text: `Error: ${error.message || 'Something went wrong.'}`, isError: true } : msg
      ));
    } finally {
      setIsLoading(false);
      // Refocus textarea for speed
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-coporties-black text-white font-sans selection:bg-coporties-red selection:text-white">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        config={config}
        onConfigChange={setConfig}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onClearChat={handleClearChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Bar (Mobile) */}
        <div className="lg:hidden p-4 flex items-center border-b border-coporties-border bg-coporties-black/90 backdrop-blur z-30 sticky top-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-coporties-muted hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-bold text-coporties-red">AI COPORTIES</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
              <div className="w-24 h-24 mb-8 relative">
                 <div className="absolute inset-0 bg-coporties-red blur-3xl opacity-20 animate-pulse-slow"></div>
                 <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-coporties-red relative z-10" stroke="currentColor" strokeWidth="1">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">
                AI COPORTIES
              </h1>
              <p className="text-coporties-muted max-w-md text-lg font-light">
                The billion-dollar enterprise workspace. <br/>
                <span className="text-coporties-red">Fast. Elegant. Intelligent.</span>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-2xl">
                 <button onClick={() => setInput("Analyze the market trends for AI in 2025.")} className="p-4 border border-coporties-border rounded-xl hover:border-coporties-red/50 hover:bg-coporties-surface transition-all text-left group">
                    <span className="block text-white font-medium mb-1 group-hover:text-coporties-red transition-colors">Market Analysis</span>
                    <span className="text-xs text-coporties-muted">Generate comprehensive reports</span>
                 </button>
                 <button onClick={() => setInput("Write a Python script to optimize database queries.")} className="p-4 border border-coporties-border rounded-xl hover:border-coporties-red/50 hover:bg-coporties-surface transition-all text-left group">
                    <span className="block text-white font-medium mb-1 group-hover:text-coporties-red transition-colors">Code Generation</span>
                    <span className="text-xs text-coporties-muted">Develop robust solutions</span>
                 </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto pb-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-coporties-black/95 backdrop-blur border-t border-coporties-border z-20">
          <div className="max-w-4xl mx-auto relative">
            
            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-lg border border-coporties-border overflow-hidden bg-coporties-surface flex items-center justify-center">
                      {att.mimeType.startsWith('image/') ? (
                        <img src={`data:${att.mimeType};base64,${att.data}`} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-coporties-muted p-1 text-center break-all">{att.name.slice(0, 8)}...</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="absolute -top-2 -right-2 bg-coporties-red text-white rounded-full p-0.5 shadow-md hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className={`relative flex items-end gap-2 bg-coporties-surface border transition-colors rounded-2xl px-4 py-3 shadow-2xl ${
               isLoading ? 'border-coporties-border opacity-50 cursor-not-allowed' : 'border-coporties-border focus-within:border-coporties-red/50 focus-within:ring-1 focus-within:ring-coporties-red/20'
            }`}>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 mb-0.5 text-coporties-muted hover:text-white hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
                title="Add attachment"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                disabled={isLoading}
                rows={1}
                className="w-full bg-transparent text-white placeholder-coporties-muted focus:outline-none py-2.5 max-h-[200px] resize-none"
              />

              <button
                onClick={handleSubmit}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className={`p-2 mb-0.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                  (!input.trim() && attachments.length === 0) || isLoading
                    ? 'bg-coporties-border text-coporties-muted cursor-not-allowed'
                    : 'bg-coporties-red text-white hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center mt-3">
              <p className="text-[10px] text-coporties-muted uppercase tracking-widest">
                AI Coporties uses <span className="text-coporties-red font-bold">Gemini 3</span> Technology
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;