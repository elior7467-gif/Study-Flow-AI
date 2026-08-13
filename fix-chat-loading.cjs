const fs = require('fs');
let code = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

// Add state for loading text
const stateInject = `
  const [loadingText, setLoadingText] = useState('Solver AI drafting step-by-step derivation...');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      setLoadingText('Solver AI drafting step-by-step derivation...');
      timeout = setTimeout(() => {
        setLoadingText('Critic AI cross-referencing NCERT textbooks...');
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [loading]);
`;

code = code.replace(
  'const scrollRef = useRef<HTMLDivElement>(null);',
  'const scrollRef = useRef<HTMLDivElement>(null);\n' + stateInject
);

code = code.replace(
  '<span className="text-[10px] text-[#64748B] font-bold ml-2 uppercase tracking-widest">Pipeline Auditing...</span>',
  '<span className="text-[10px] text-[#64748B] font-bold ml-2 uppercase tracking-widest">{loadingText}</span>'
);

fs.writeFileSync('src/components/ChatView.tsx', code);
