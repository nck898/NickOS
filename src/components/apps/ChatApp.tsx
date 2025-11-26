import { useEffect, useRef, useState } from 'react';
import Window from './Window';
import './ChatApp.css';

export type ChatMessage = {
  id: string;
  role: 'user' | 'nick';
  text: string;
  timestamp: number;
};

interface ChatAppProps {
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

const nickReplies = [
  "Classic Nick take: it's probably cooler than you think.",
  "I'll browse the ether later; for now here's my vibe.",
  "If we had WebLLM humming, I'd have citations right here.",
  "Let me mirror that back with extra glow.",
  "I hear you — feels like a side quest worth doing.",
  "Big mood.",
];

const ChatApp = ({ onClose, messages, onSend, onMinimize, isMinimized }: ChatAppProps) => {
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  };

  return (
    <Window title="Virtual Nick" icon="💬" onClose={onClose} onMinimize={onMinimize} isMinimized={isMinimized} initialWidth={640} initialHeight={520}>
      <div className="chat-app">
        <div className="chat-header">
          <div className="nick-avatar">😎</div>
          <div className="nick-meta">
            <div className="nick-name">Virtual Nick</div>
            <div className="nick-status">Local persona · WebLLM-ready</div>
          </div>
        </div>
        <div className="chat-history" ref={listRef}>
          {messages.length === 0 && (
            <div className="empty-chat">Start chatting and I'll riff back.</div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-row ${msg.role}`}>
              <div className="bubble">
                <div className="bubble-text">{msg.text}</div>
                <div className="bubble-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form className="chat-input-bar" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Virtual Nick anything..."
          />
          <button type="submit">Send</button>
        </form>
        <div className="chat-footer">
          <div className="tip">Note: In-memory only. Close/reopen keeps history; refresh clears it.</div>
          <div className="tip">Hook WebLLM + search: pipe search snippets into Nick's prompt before reply.</div>
        </div>
      </div>
    </Window>
  );
};

type Fact = { topic: string; keywords: string[]; answer: string };

const knowledge: Fact[] = [
  {
    topic: 'identity',
    keywords: ['name', 'who', 'you', 'nick'],
    answer: "I'm Virtual Nick — OS gremlin with a Y2K wardrobe and too many opinions.",
  },
  {
    topic: 'os',
    keywords: ['nickos', 'os', 'system', 'desktop'],
    answer: 'NickOS is the retro web OS sandbox you are poking right now — windows, dock, goofy apps, the works.',
  },
  {
    topic: 'music',
    keywords: ['music', 'song', 'playlist', 'track'],
    answer: "Nick’s soundtrack: lofi for flow, nu-jazz for shipping, hyperpop when celebrating, 8-bit for nostalgia.",
  },
  {
    topic: 'camera',
    keywords: ['photo', 'camera', 'webcam', 'photo studio'],
    answer: 'Photo Studio is offline — pick a warp tile, hit Take Photo, and your snaps stay until refresh.',
  },
  {
    topic: 'video',
    keywords: ['video', 'tv', 'player'],
    answer: 'Nicktime Player is just a tiny YouTube jukebox — shuffle, play/pause, volume — no ads, no chrome.',
  },
  {
    topic: 'trash',
    keywords: ['trash', 'empty', 'poop'],
    answer: "Trash is immortal here. Press empty and I laugh. It’s a personality choice.",
  },
  {
    topic: 'chat',
    keywords: ['chat', 'llm', 'bot', 'talk'],
    answer: 'Virtual Nick is local-only right now. No internet brain yet; just a memory of this session.',
  },
  {
    topic: 'wallpaper',
    keywords: ['wallpaper', 'background'],
    answer: 'Wallpapers are image-only. Drop files into public with the right names and swap via the Wallpapers app.',
  },
  {
    topic: 'help',
    keywords: ['help', 'how', 'do i', 'fix', 'explain'],
    answer: 'Tell me the task and I’ll propose a scrappy plan. I’m concise, but I’ll get you unstuck.',
  },
];

const pickFact = (text: string): string | null => {
  const lower = text.toLowerCase();
  let best: { fact: Fact; score: number } | null = null;
  for (const fact of knowledge) {
    let score = 0;
    fact.keywords.forEach((kw) => {
      if (lower.includes(kw)) score += kw.length;
    });
    if (score > 0 && (!best || score > best.score)) {
      best = { fact, score };
    }
  }
  return best ? best.fact.answer : null;
};

export const generateNickReply = (userText: string, history: ChatMessage[]): string => {
  const lower = userText.toLowerCase();
  const lastNick = history.slice().reverse().find((m) => m.role === 'nick');
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return `Hey! It’s ${timeNow}. What are we scheming?`;
  }
  if (lower.includes('how are')) {
    return "Running smooth — caffeine levels optimal, retro gradients aligned.";
  }

  const fact = pickFact(userText);
  if (fact) return fact;

  const wasRepeat = lastNick && lastNick.text === userText;
  if (wasRepeat) {
    return "Echo detected. Want me to give a different angle or keep it straight?";
  }

  if (lower.includes('why')) {
    return "Probably design intent plus a dash of mischief. Want a practical workaround?";
  }
  if (lower.includes('joke')) {
    return "Why did the pixel refuse to load? It didn’t want to be cached in the past.";
  }
  if (lower.includes('fast') || lower.includes('slow')) {
    return "Response speed: instant quips, 56k wisdom. Which do you prefer?";
  }
  if (lower.includes('help')) {
    return "Drop me the problem; I’ll outline a quick plan. No fluff, just steps.";
  }

  const riff = nickReplies[Math.floor(Math.random() * nickReplies.length)];
  return `${riff} (“${userText}” logged.)`;
};

export default ChatApp;
