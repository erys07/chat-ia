import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Moon } from 'lucide-react';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'ai';
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newMessage: Message = { id: Date.now(), content: input, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInput('');
      simulateAIResponse(input);
    }
  };

  const simulateAIResponse = async (prompt: string) => {
    setIsThinking(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
        mode: 'cors',
      });

      const data = await response.json();

      console.log('Resposta da API:', data);

      if (response.ok) {
        const aiMessage: Message = {
          id: Date.now(),
          content: data.response || 'Desculpe, não consegui encontrar uma resposta.',
          sender: 'ai',
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          id: Date.now(),
          content: data.error || 'Ocorreu um erro ao buscar a resposta.',
          sender: 'ai',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now(),
        content: 'Erro de conexão. Tente novamente mais tarde.',
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`flex flex-col h-screen ${isThinking ? 'bg-blue-900' : 'bg-blue-50'} transition-colors duration-500`}>
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">DANDAR.AI</h1>
        <Sparkles className="w-6 h-6" />
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-md mx-2 p-3 rounded-lg ${
              message.sender === 'user' ? 'bg-blue-200 ml-auto' : 'bg-white mr-auto'
            }`}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white shadow-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {isThinking && (
        <div className="absolute inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
            <Moon className="w-8 h-8 text-blue-500 animate-pulse" />
            <p className="text-lg font-semibold text-blue-800">Enquanto pensamos na sua resposta, lembre-se sempre de fechar a torneira enquanto escova os dentes...</p>
          </div>
        </div>
      )}
    </div>
  );
}
