import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types/product';
import { ChatMessage } from '../types/chat';
import {
  getStoredApiKey,
  saveApiKey,
  removeApiKey,
  streamGeminiBarista,
  TARGET_MODEL,
} from '../services/gemini';
import {
  Sparkles,
  X,
  Send,
  Key,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Coffee,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface AIChatModalProps {
  products: Product[];
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isConfiguringKey, setIsConfiguringKey] = useState(false);
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [activeModel, setActiveModel] = useState(TARGET_MODEL);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize stored API Key on mount
  useEffect(() => {
    const stored = getStoredApiKey();
    if (stored) {
      setApiKey(stored);
      setKeyInput(stored);
      setHasKey(true);
    }
  }, []);

  // Initial greeting message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content:
            'สวัสดีครับ! ผมคือ **Mitchell AI Barista** ผู้ช่วยอัจฉริยะประจำร้าน Mitchell ยินดีต้อนรับครับ ☕✨\n\nผมพร้อมตอบคำถาม แนะนำเมนูกาแฟ เครื่องดื่ม เบเกอรี่ และของหวานแบบ **Real-time Streaming ตอบกลับรวดเร็วทันใจ** คุณสามารถพิมพ์ถามหรือเลือกคำถามตัวอย่างด้านล่างได้เลยครับ!',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom on new messages / streaming updates
  useEffect(() => {
    if (isOpen && !isConfiguringKey) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, isOpen, isConfiguringKey]);

  const handleSaveKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = keyInput.trim();
    if (!clean) {
      setErrorMessage('กรุณากรอก API Key ก่อนบันทึกครับ');
      return;
    }
    saveApiKey(clean);
    setApiKey(clean);
    setHasKey(true);
    setIsConfiguringKey(false);
    setErrorMessage(null);
  };

  const handleRemoveKey = () => {
    removeApiKey();
    setApiKey('');
    setKeyInput('');
    setHasKey(false);
    setIsConfiguringKey(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isStreaming) return;

    if (!hasKey || !apiKey) {
      setIsConfiguringKey(true);
      return;
    }

    const userMsgId = `${Date.now()}-user`;
    const assistantMsgId = `${Date.now()}-assistant`;

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsStreaming(true);
    setErrorMessage(null);

    // Placeholder message for streaming response
    let hasAddedAssistantMsg = false;

    try {
      await streamGeminiBarista(
        apiKey,
        newMessages,
        products,
        (accumulatedText, modelUsed) => {
          setActiveModel(modelUsed);
          if (!hasAddedAssistantMsg) {
            hasAddedAssistantMsg = true;
            setMessages((prev) => [
              ...prev,
              {
                id: assistantMsgId,
                role: 'assistant',
                content: accumulatedText,
                timestamp: new Date().toISOString(),
              },
            ]);
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
              )
            );
          }
        }
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Gemini API');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `${Date.now()}-welcome`,
        role: 'assistant',
        content: 'ประวัติการสนทนาถูกรีเซ็ตเรียบร้อยแล้วครับ ต้องการให้ผมแนะนำเมนูไหนเป็นพิเศษไหมครับ? ☕',
        timestamp: new Date().toISOString(),
      },
    ]);
    setErrorMessage(null);
  };

  const quickPrompts = [
    '☕ แนะนำเมนูกาแฟ Signature ด่วน',
    '🍵 มีเครื่องดื่มไหนไม่ใส่กาแฟบ้าง?',
    '🥐 Pain au Chocolat ทานคู่กับอะไรดี?',
    '✨ เมนูไหนที่ยังมีของพร้อมเสิร์ฟ?',
  ];

  const formatModelBadge = (_model?: string) => {
    return 'Gemini 3.8 Flash';
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (!hasKey) {
              setIsConfiguringKey(true);
            }
          }}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 font-bold shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title="คุยกับ Mitchell AI Barista (Streaming Fast)"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-neutral-950 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-950"></span>
            </span>
          </div>
          <span className="text-sm tracking-wide">AI Barista</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-neutral-950/20 text-neutral-950 flex items-center gap-0.5">
            <Zap className="w-3 h-3 fill-current" />
            Fast
          </span>
        </button>
      )}

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[430px] h-[600px] max-h-[85vh] z-50 flex flex-col rounded-3xl bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 flex items-center justify-center shadow-md shadow-amber-500/20">
                <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-neutral-100">Mitchell AI Barista</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    SSE Stream
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{formatModelBadge(activeModel)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* API Key settings button */}
              <button
                onClick={() => setIsConfiguringKey((prev) => !prev)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isConfiguringKey
                    ? 'bg-amber-500/20 text-amber-400'
                    : hasKey
                    ? 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
                    : 'text-amber-400 bg-amber-500/10 animate-pulse'
                }`}
                title="ตั้งค่า Gemini API Key"
              >
                <Key className="w-4 h-4" />
              </button>

              {/* Reset history button */}
              {!isConfiguringKey && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition cursor-pointer"
                  title="ล้างการสนทนา"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Close window */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition cursor-pointer"
                title="ปิดหน้าต่างแชท"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {isConfiguringKey ? (
            /* API Key Configuration Screen */
            <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between bg-neutral-950/40">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
                  <Key className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                    <span>ตั้งค่า Google Gemini API Key</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      รองรับทุก Key
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    ระบบใช้งานโมเดลเรือธง Gemini 3.8 Flash พร้อมระบบ Real-time Streaming ตอบกลับรวดเร็วทันใจ
                  </p>
                </div>

                {/* Direct Link to Google AI Studio */}
                <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-neutral-300">
                    รับ API Key ฟรีจาก Google AI Studio
                  </div>
                  <a
                    href="https://aistudio.google.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition whitespace-nowrap"
                  >
                    <span>สร้าง API Key</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Key Input Field */}
                <form onSubmit={handleSaveKey} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showKeyPassword ? 'text' : 'password'}
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeyPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                      >
                        {showKeyPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-neutral-500 leading-relaxed">
                    🔒 API Key ถูกบันทึกไว้ในเบราว์เซอร์ของคุณเท่านั้น มีระบบ Cascade Auto-Fallback เพื่อความเสถียรสูงสุด
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>บันทึกและเริ่มแชทความเร็วสูง</span>
                    </button>

                    {hasKey && (
                      <button
                        type="button"
                        onClick={() => setIsConfiguringKey(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-850 text-neutral-300 hover:bg-neutral-800 transition cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {hasKey && (
                <div className="pt-4 border-t border-neutral-850">
                  <button
                    onClick={handleRemoveKey}
                    className="w-full py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบ API Key ออกจากเครื่องนี้</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Active Chat View */
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-neutral-950/20">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-sm'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-sm'
                      }`}
                    >
                      {/* Message Content with basic Markdown formatting */}
                      <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                        {msg.content.split('\n').map((line, idx) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <p key={idx} className="font-bold text-neutral-100">
                                {line.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          return <p key={idx}>{line}</p>;
                        })}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-600 px-1 mt-1 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}

                {/* Streaming Indicator */}
                {isStreaming && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 px-2 py-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono">
                      กำลังสตรีมคำตอบ...
                    </span>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                    {errorMessage.includes('API Key') && (
                      <button
                        onClick={() => setIsConfiguringKey(true)}
                        className="text-xs font-semibold text-amber-400 underline hover:text-amber-300 block"
                      >
                        กดที่นี่เพื่อแก้ไขหรือตรวจสอบ API Key
                      </button>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              {messages.length <= 2 && !isStreaming && (
                <div className="px-4 py-2 border-t border-neutral-850/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-amber-500/50 hover:text-amber-300 transition cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t border-neutral-800 bg-neutral-950/80">
                {!hasKey ? (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <span className="text-amber-300 font-medium">กรุณากรอก API Key เพื่อเปิดใช้งาน AI</span>
                    <button
                      type="button"
                      onClick={() => setIsConfiguringKey(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition cursor-pointer text-xs whitespace-nowrap"
                    >
                      กรอก Key ที่นี่
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="สอบถามเมนูกับ AI Barista (ตอบกลับรวดเร็ว)..."
                      disabled={isStreaming}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isStreaming}
                      className="p-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
                      title="ส่งข้อความ"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
