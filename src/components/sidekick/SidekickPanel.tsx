import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { askSidekick, type SidekickAction } from '../../lib/sidekick';
import { prepareSidekickImage } from '../../lib/sidekickImage';
import type { CalendarEvent, FamilyMember, Todo } from '../../types/family';
import type { WeatherSnapshot } from '../../lib/weather';
import { SidekickActionCard } from './SidekickActionCard';

interface Props {
  open: boolean; members: FamilyMember[]; todos: Todo[]; events: CalendarEvent[];
  weather: WeatherSnapshot | null; weatherLocation: string;
  onClose: () => void; onApply: (action: SidekickAction) => void;
  onUploadPhoto: (file: File) => Promise<void>;
}

interface ChatMessage { role: 'assistant' | 'user'; text: string }
const suggestions = ['Show Sidekick a problem', 'What is happening today?', 'Add homework for tomorrow', 'Help me with math'];

function speakAnswer(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const answer = new SpeechSynthesisUtterance(text);
  answer.lang = navigator.language || 'en-US';
  answer.rate = .96;
  window.speechSynthesis.speak(answer);
}

export function SidekickPanel(props: Props) {
  const { open, members, todos, events, weather, weatherLocation, onClose, onApply, onUploadPhoto } = props;
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: 'Hi! I can plan your week, manage tasks, scan a room into chores, check the weather, or help with homework.' }]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<SidekickAction>({ type: 'none' });
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File>();
  const [photoPreview, setPhotoPreview] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voice = useVoiceInput((text) => { setInput(text); void send(text); });

  useEffect(() => {
    const container = messagesRef.current;
    if (open && container) container.scrollTo({ top: container.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [loading, messages, open, pending]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape); };
  }, [onClose, open]);
  useEffect(() => {
    if (!photo) { setPhotoPreview(''); return; }
    const url = URL.createObjectURL(photo); setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function clearPhoto() { setPhoto(undefined); if (photoRef.current) photoRef.current.value = ''; }
  async function send(text = input) {
    const selectedPhoto = photo;
    const message = text.trim() || (selectedPhoto ? 'Look at this photo and help me understand or solve what it shows.' : '');
    if (!message || loading) return;
    setMessages((current) => [...current, { role: 'user', text: selectedPhoto ? `📷 ${message}` : message }]);
    setInput(''); setPending({ type: 'none' }); setLoading(true);
    try {
      const image = selectedPhoto ? await prepareSidekickImage(selectedPhoto) : undefined;
      if (selectedPhoto) void onUploadPhoto(selectedPhoto).catch(() => undefined);
      const result = await askSidekick(message, { members, todos, events, weather, weatherLocation }, image, messages);
      setMessages((current) => [...current, { role: 'assistant', text: result.reply }]);
      setPending(result.action); clearPhoto();
      speakAnswer(result.reply);
    } catch (reason) {
      setInput(message);
      setMessages((current) => [...current, { role: 'assistant', text: reason instanceof Error ? reason.message : 'I could not answer just now.' }]);
    } finally { setLoading(false); }
  }

  return createPortal(<>{open && <button className="sidekick-backdrop" onClick={onClose} aria-label="Close Sidekick" />}
    <aside className={`sidekick-panel ${open ? 'open' : ''}`} role="dialog" aria-modal={open ? 'true' : undefined} aria-label="Sidekick assistant" aria-hidden={!open}>
      <header><div className="sidekick-orb">✦</div><div><strong>Sidekick</strong><small>Gemini 2.5 Flash · voice & photos</small></div><button className="icon-button" onClick={onClose} aria-label="Close Sidekick">×</button></header>
      <div className="sidekick-messages" ref={messagesRef} role="log" aria-live="polite" aria-busy={loading}>{messages.map((message, index) => <p className={message.role} key={`${message.role}-${index}`}>{message.text}</p>)}{voice.error && <p className="assistant sidekick-error">{voice.error}</p>}{loading && <p className="assistant sidekick-thinking">Looking and thinking<span>…</span></p>}</div>
      <SidekickActionCard action={pending} onDismiss={() => setPending({ type: 'none' })} onApply={() => { onApply(pending); setPending({ type: 'none' }); setMessages((current) => [...current, { role: 'assistant', text: 'Done — your family board is updated.' }]); }} />
      <div className="sidekick-suggestions">{suggestions.map((suggestion, index) => <button key={suggestion} onClick={() => index === 0 ? photoRef.current?.click() : void send(suggestion)}>{suggestion}</button>)}</div>
      <form className="sidekick-compose" onSubmit={(event) => { event.preventDefault(); void send(); }}>
        {photo && <div className="sidekick-photo-preview"><img src={photoPreview} alt="Ready for Sidekick" /><span><strong>Photo ready</strong><small>{photo.name}</small></span><button type="button" onClick={clearPhoto} aria-label="Remove photo">×</button></div>}
        <button type="button" className="photo-button" onClick={() => photoRef.current?.click()} aria-label="Take or add a photo">📷</button>
        <input ref={photoRef} className="sidekick-file-input" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => setPhoto(event.target.files?.[0])} />
        <button type="button" className={`voice-button ${voice.listening ? 'listening' : ''}`} disabled={!voice.supported || loading} onClick={voice.toggle} aria-label={voice.listening ? 'Stop listening' : 'Speak and send to Sidekick'}>{voice.listening ? '●' : '🎙'}</button>
        <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} aria-label="Message to Sidekick" placeholder={voice.listening ? 'Listening…' : 'Ask Sidekick anything…'} />
        <button type="submit" className="sidekick-send" disabled={(!input.trim() && !photo) || loading} aria-label="Send">➜</button>
      </form>
    </aside>
  </>, document.body);
}
