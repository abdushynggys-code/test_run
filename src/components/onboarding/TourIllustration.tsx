export type TourArt = 'home' | 'calendar' | 'tasks' | 'sidekick';

export function TourIllustration({ kind }: { kind: TourArt }) {
  if (kind === 'home') return <svg className="tour-illustration" viewBox="0 0 320 126" aria-hidden="true">
    <defs><linearGradient id="home-sky" x2="1" y2="1"><stop stopColor="#dff1ff" /><stop offset="1" stopColor="#fff4ec" /></linearGradient></defs>
    <rect width="320" height="126" rx="20" fill="url(#home-sky)" />
    <circle cx="258" cy="32" r="17" fill="#ffc957" /><g fill="#fff" opacity=".9"><circle cx="55" cy="34" r="13" /><circle cx="72" cy="30" r="18" /><circle cx="90" cy="37" r="11" /></g>
    <rect x="22" y="66" width="276" height="42" rx="14" fill="#fff" opacity=".82" /><rect x="37" y="79" width="34" height="8" rx="4" fill="#f37748" /><rect x="83" y="76" width="74" height="6" rx="3" fill="#6f7f91" /><rect x="83" y="89" width="48" height="5" rx="3" fill="#c4ccd5" />
    <rect x="220" y="77" width="28" height="20" rx="7" fill="#e9f7f3" /><path d="m229 87 5 5 8-10" fill="none" stroke="#35a17b" strokeWidth="3" strokeLinecap="round" />
  </svg>;
  if (kind === 'calendar') return <svg className="tour-illustration" viewBox="0 0 320 126" aria-hidden="true">
    <rect width="320" height="126" rx="20" fill="#eef4ff" /><rect x="24" y="16" width="272" height="94" rx="16" fill="#fff" /><rect x="24" y="16" width="272" height="25" rx="16" fill="#6b7fe7" /><path d="M24 31h272" stroke="#6b7fe7" strokeWidth="20" />
    {[0,1,2,3,4,5,6].map((day) => <rect key={day} x={36 + day * 36} y="51" width="25" height="18" rx="5" fill={day === 3 ? '#ffe8df' : '#edf1f5'} />)}
    {[0,1,2,3,4,5,6].map((day) => <rect key={day} x={36 + day * 36} y="78" width="25" height="18" rx="5" fill={day === 5 ? '#dff5ee' : '#f4f6f8'} />)}
    <circle cx="174" cy="60" r="7" fill="#f37748" /><path d="M170 60h8M174 56v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>;
  if (kind === 'tasks') return <svg className="tour-illustration" viewBox="0 0 320 126" aria-hidden="true">
    <rect width="320" height="126" rx="20" fill="#fff7dd" /><rect x="30" y="15" width="260" height="96" rx="17" fill="#fff" opacity=".9" />
    {[0,1,2].map((row) => <g key={row}><circle cx="58" cy={38 + row * 25} r="9" fill={row < 2 ? '#55b68e' : '#eef1f4'} /><path d={`m53 ${38 + row * 25} 4 4 7-8`} fill="none" stroke={row < 2 ? '#fff' : '#bac3cc'} strokeWidth="2.5" strokeLinecap="round" /><rect x="78" y={34 + row * 25} width={95 - row * 8} height="7" rx="4" fill="#798696" opacity=".74" /><rect x="78" y={44 + row * 25} width="55" height="4" rx="2" fill="#d5dbe1" /></g>)}
    <path d="m244 32 5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#ffc54d" /><text x="244" y="87" textAnchor="middle" fill="#a16c00" fontSize="13" fontWeight="800">LEVEL UP</text>
  </svg>;
  return <svg className="tour-illustration" viewBox="0 0 320 126" aria-hidden="true">
    <defs><linearGradient id="ai-bg" x2="1" y2="1"><stop stopColor="#6676e5" /><stop offset="1" stopColor="#9b67c9" /></linearGradient></defs>
    <rect width="320" height="126" rx="20" fill="url(#ai-bg)" /><circle cx="70" cy="63" r="31" fill="#fff" opacity=".17" /><path d="m70 38 6 18 18 7-18 7-6 18-7-18-18-7 18-7z" fill="#fff" />
    <rect x="120" y="30" width="166" height="28" rx="14" fill="#fff" opacity=".92" /><rect x="136" y="41" width="91" height="6" rx="3" fill="#7f75bc" opacity=".55" /><rect x="142" y="69" width="144" height="28" rx="14" fill="#fff" opacity=".2" /><rect x="158" y="80" width="77" height="6" rx="3" fill="#fff" opacity=".75" />
  </svg>;
}
