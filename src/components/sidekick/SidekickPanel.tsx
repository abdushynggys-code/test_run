import { useState } from 'react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { askSidekick, type SidekickAction } from '../../lib/sidekick';
import type { CalendarEvent, FamilyMember, Todo } from '../../types/family';
import type { WeatherSnapshot } from '../../lib/weather';
import { SidekickActionCard } from './SidekickActionCard';

interface Props {
  open: boolean;
  members: FamilyMember[];
  todos: Todo[];
  events: CalendarEvent[];
  weather: WeatherSnapshot | null;
  weatherLocation: string;
  onClose: () => void;
  onApply: (action: SidekickAction) => void;
}

interface ChatMessage { role: 'assistant' | 'user'; text: string }
const suggestions = ['What is happening today?', 'Add homework for tomorrow', 'Help me with math', 'What is the weather?'];

export function SidekickPanel(props: Props) {
  const { open, members, todos, events, weather, weatherLocation, onClose, onApply } = props;
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: 'Hi! I can plan your week, manage tasks, check the weather, or help with homework.' }]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<SidekickAction>({ type: 'none' });
  const [loading, setLoading] = useState(false);
  const voice = useVoiceInput((text) => setInput(text));

  const send = async (text = input) => {
    const message = text.trim();
    if (!message || loading) return;
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setInput(''); setPending({ type: 'none' }); setLoading(true);
    try {
      const result = await askSidekick(message, { members, todos, events, weather, weatherLocation });
      setMessages((current) => [...current, { role: 'assistant', text: result.reply }]);
      setPending(result.action);
      if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(result.reply));
    } catch (reason) {
      setMessages((current) => [...current, { role: 'assistant', text: reason instanceof Error ? reason.message : 'I could not answer just now.' }]);
    } finally { setLoading(false); }
  };

  return <aside className={`sidekick-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
    <header><div className="sidekick-orb">✦</div><div><strong>Sidekick</strong><small>Gemini 2.5 Flash</small></div><button className="icon-button" onClick={onClose} aria-label="Close Sidekick">×</button></header>
    <div className="sidekick-messages">
      {messages.map((message, index) => <p className={message.role} key={`${message.role}-${index}`}>{message.text}</p>)}
      {loading && <p className="assistant sidekick-thinking">Thinking<span>…</span></p>}
    </div>
    <SidekickActionCard action={pending} onDismiss={() => setPending({ type: 'none' })} onApply={() => { onApply(pending); setPending({ type: 'none' }); setMessages((current) => [...current, { role: 'assistant', text: 'Done — your family board is updated.' }]); }} />
    <div className="sidekick-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}</div>
    <form className="sidekick-compose" onSubmit={(event) => { event.preventDefault(); void send(); }}>
      <button type="button" className={`voice-button ${voice.listening ? 'listening' : ''}`} disabled={!voice.supported} onClick={voice.toggle} aria-label={voice.listening ? 'Stop listening' : 'Speak to Sidekick'}>{voice.listening ? '●' : '🎙'}</button>
      <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={voice.listening ? 'Listening…' : 'Ask Sidekick anything…'} />
      <button className="sidekick-send" disabled={!input.trim() || loading} aria-label="Send">➜</button>
    </form>
  </aside>;
}
