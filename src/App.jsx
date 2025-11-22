import React, { useState, useEffect, useRef, createContext, useContext, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, FolderOpen, User, Mail, X, Minus, Maximize2, Minimize2, 
  Cpu, Wifi, Battery, Search, Code, ExternalLink, Github, Linkedin, 
  Power, Grid, FileCode, FileJson, Settings, Monitor, Calculator, 
  Globe, FileText, Music, Camera, Bell, Lock, Unlock, ChevronRight, 
  ChevronLeft, RotateCcw, Home, Save, Trash2, Plus, Moon, Sun,
  MoreVertical, Play, Pause, SkipForward, SkipBack, Volume2, Layout,
  Image as ImageIcon, Check, AlertCircle, Edit2, GripVertical, RefreshCw
} from 'lucide-react';

/* ==========================================
   SYSTEM KERNEL & CONFIGURATION
   ========================================== */

const SYSTEM_CONFIG = {
  version: "3.4.0-ULTIMATE",
  codename: "NeonGlass",
  defaultWallpaper: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
  wallpapers: [
    { name: "Nebula", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" },
    { name: "Cyberpunk", url: "https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2076&auto=format&fit=crop" },
    { name: "Minimal", url: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2000&auto=format&fit=crop" },
    { name: "Nature", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop" },
    { name: "Abstract", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" },
  ],
  user: {
    name: "DevUser",
    email: "hire@devuser.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DevUser&backgroundColor=b6e3f4",
    password: "admin"
  }
};

/* ==========================================
   VIRTUAL FILE SYSTEM (VFS) CORE
   ========================================== */

const INITIAL_FS = {
  "/": { type: "dir", children: ["home", "bin", "etc"] },
  "/bin": { type: "dir", children: ["sh", "ls", "cat", "neofetch"] },
  "/etc": { type: "dir", children: ["os-release"] },
  "/home": { type: "dir", children: ["user"] },
  "/home/user": { type: "dir", children: ["documents", "projects", "notes.txt", "portfolio.js"] },
  "/home/user/documents": { type: "dir", children: ["resume.pdf", "budget.xlsx"] },
  "/home/user/projects": { type: "dir", children: ["hospital-cms", "event-planner"] },
  "/home/user/notes.txt": { type: "file", content: "Welcome to GlassOS! Right click on the desktop to create new folders.\n\nDrag windows to the edges to snap them!" },
  "/home/user/portfolio.js": { type: "file", content: "const portfolio = {\n  owner: 'DevUser',\n  skills: ['React', 'Node', 'Postgres'],\n  status: 'Hired'\n};" },
  "/etc/os-release": { type: "file", content: "NAME=GlassOS\nVERSION=3.4\nID=glass" },
};

const fsReducer = (state, action) => {
  switch (action.type) {
    case 'WRITE_FILE':
      return { ...state, [action.path]: { type: "file", content: action.content } };
    case 'MAKE_DIR':
      const parentDir = action.path.substring(0, action.path.lastIndexOf('/')) || '/';
      const dirname = action.path.split('/').pop();
      if (!state[parentDir]) return state;
      return {
        ...state,
        [action.path]: { type: "dir", children: [] },
        [parentDir]: { ...state[parentDir], children: [...state[parentDir].children, dirname] }
      };
    case 'DELETE':
      const pDir = action.path.substring(0, action.path.lastIndexOf('/')) || '/';
      const dName = action.path.split('/').pop();
      const newState = { ...state };
      delete newState[action.path];
      if (newState[pDir]) {
        newState[pDir] = { ...newState[pDir], children: newState[pDir].children.filter(c => c !== dName) };
      }
      return newState;
    case 'RENAME':
      const oldParent = action.oldPath.substring(0, action.oldPath.lastIndexOf('/')) || '/';
      const oldName = action.oldPath.split('/').pop();
      const newPath = `${oldParent}/${action.newName}`;
      
      if (state[newPath]) return state; // Exists
      
      const stateCopy = { ...state };
      stateCopy[newPath] = stateCopy[action.oldPath];
      delete stateCopy[action.oldPath];
      
      if (stateCopy[oldParent]) {
        stateCopy[oldParent] = {
          ...stateCopy[oldParent],
          children: stateCopy[oldParent].children.map(c => c === oldName ? action.newName : c)
        };
      }
      return stateCopy;
    default:
      return state;
  }
};

/* ==========================================
   CONTEXTS & GLOBAL STATE
   ========================================== */

const SystemContext = createContext();

const SystemProvider = ({ children }) => {
  const [fs, dispatchFs] = useReducer(fsReducer, INITIAL_FS);
  const [wallpaper, setWallpaper] = useState(SYSTEM_CONFIG.defaultWallpaper);
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(75);
  const [isLocked, setIsLocked] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type, target }
  
  // Desktop Icon Positions (Draggable persistence)
  const [iconPositions, setIconPositions] = useState({});

  const addNotification = (title, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  return (
    <SystemContext.Provider value={{ 
      fs, dispatchFs, 
      wallpaper, setWallpaper, 
      brightness, setBrightness, 
      volume, setVolume,
      isLocked, setIsLocked,
      notifications, addNotification,
      contextMenu, setContextMenu,
      iconPositions, setIconPositions
    }}>
      {children}
    </SystemContext.Provider>
  );
};

/* ==========================================
   COMPONENTS: BOOT SCREEN
   ========================================== */

const BootScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        const jump = Math.random() * 15;
        return Math.min(prev + jump, 100);
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)", transition: { duration: 0.8 } }}
      className="fixed inset-0 bg-[#000000] z-[9999] flex flex-col items-center justify-center text-white overflow-hidden"
    >
       {/* Background ambient glow */}
       <motion.div
         initial={{ opacity: 0, scale: 0.5 }}
         animate={{ opacity: 0.3, scale: 1.5 }}
         transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
         className="absolute w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]"
       />

       {/* Logo Container */}
       <motion.div
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ duration: 1, ease: "easeOut" }}
         className="relative z-10 mb-12 flex flex-col items-center"
       >
         {/* Glassy Icon */}
         <div className="w-28 h-28 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50"></div>
            <Grid size={56} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
         </div>

         {/* Text */}
         <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-8 text-center"
         >
           <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 pb-2">
             GlassOS
           </h1>
           <p className="text-slate-500 text-sm font-mono tracking-widest uppercase opacity-70">
             System Loading
           </p>
         </motion.div>
       </motion.div>

       {/* Progress Bar */}
       <div className="w-64 md:w-80 h-1 bg-slate-800/50 rounded-full overflow-hidden relative z-10 backdrop-blur-sm">
         <motion.div
           className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.8)]"
           initial={{ width: "0%" }}
           animate={{ width: `${progress}%` }}
           transition={{ type: "spring", stiffness: 50 }}
         />
       </div>
       
       <div className="absolute bottom-10 text-xs text-slate-600 font-mono">
          {progress < 100 ? `${Math.round(progress)}%` : 'READY'}
       </div>
    </motion.div>
  );
};

/* ==========================================
   APP IMPLEMENTATIONS
   ========================================== */

/* --- 1. FILE EXPLORER --- */
const FileExplorer = () => {
  const { fs, dispatchFs, setContextMenu } = useContext(SystemContext);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [history, setHistory] = useState(['/home/user']);
  const [histIdx, setHistIdx] = useState(0);
  const [renaming, setRenaming] = useState(null); // { item: string }
  const [renameVal, setRenameVal] = useState('');

  const contents = fs[currentPath]?.children || [];

  const navigate = (path) => {
    const target = path.startsWith('/') ? path : `${currentPath === '/' ? '' : currentPath}/${path}`;
    if (fs[target]?.type === 'dir') {
      const newHist = history.slice(0, histIdx + 1);
      newHist.push(target);
      setHistory(newHist);
      setHistIdx(newHist.length - 1);
      setCurrentPath(target);
    }
  };

  const handleContextMenu = (e, item = null) => {
    e.preventDefault();
    e.stopPropagation();
    const path = item ? `${currentPath === '/' ? '' : currentPath}/${item}` : currentPath;
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: item ? 'file' : 'folder_bg',
      target: path,
      name: item,
      onRename: () => {
        setRenaming(item);
        setRenameVal(item);
      }
    });
  };

  const handleRenameSubmit = () => {
    if (renaming && renameVal && renameVal !== renaming) {
      const oldPath = `${currentPath === '/' ? '' : currentPath}/${renaming}`;
      dispatchFs({ type: 'RENAME', oldPath, newName: renameVal });
    }
    setRenaming(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 text-slate-200" onContextMenu={(e) => handleContextMenu(e)}>
      <div className="h-12 border-b border-slate-700 flex items-center px-4 gap-4 bg-slate-800/50 shrink-0">
        <div className="flex gap-1">
          <button onClick={() => histIdx > 0 && setCurrentPath(history[histIdx - 1]) || setHistIdx(h => h-1)} disabled={histIdx === 0} className="p-1 disabled:opacity-30 hover:bg-white/10 rounded"><ChevronLeft size={16}/></button>
        </div>
        <div className="flex-1 bg-slate-950/50 px-3 py-1 rounded border border-slate-700 text-sm font-mono flex items-center gap-2 truncate">
          <FolderOpen size={14} className="text-blue-400 shrink-0"/>
          {currentPath}
        </div>
      </div>
      <div className="flex-1 p-4 grid grid-cols-4 md:grid-cols-6 gap-4 content-start overflow-auto" onClick={() => setRenaming(null)}>
        {contents.map(item => {
          const fullPath = `${currentPath === '/' ? '' : currentPath}/${item}`;
          const isDir = fs[fullPath]?.type === 'dir';
          return (
            <div 
              key={item}
              onDoubleClick={() => isDir && navigate(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              className="flex flex-col items-center gap-2 p-2 hover:bg-blue-500/20 rounded-lg transition-colors group cursor-pointer relative"
            >
              {isDir ? (
                <FolderOpen size={48} className="text-yellow-400 drop-shadow-md group-hover:scale-105 transition-transform" />
              ) : (
                <FileText size={48} className="text-blue-300 drop-shadow-md group-hover:scale-105 transition-transform" />
              )}
              
              {renaming === item ? (
                <input 
                  autoFocus
                  value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRenameSubmit()}
                  onBlur={handleRenameSubmit}
                  onClick={e => e.stopPropagation()}
                  className="w-full text-xs text-center bg-slate-950 border border-blue-500 rounded px-1 outline-none"
                />
              ) : (
                <span className="text-xs text-center truncate w-full px-1 bg-slate-900/50 rounded select-none">{item}</span>
              )}
            </div>
          );
        })}
        {contents.length === 0 && <div className="text-slate-500 text-sm italic col-span-full text-center mt-10">Empty Folder</div>}
      </div>
    </div>
  );
};

/* --- 2. TERMINAL --- */
const TerminalApp = () => {
  const { fs, dispatchFs } = useContext(SystemContext);
  const [history, setHistory] = useState([{ type: 'output', content: 'GlassOS Kernel v3.4 initialized.' }]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/home/user');
  const bottomRef = useRef(null);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [history]);

  const handleCmd = (e) => {
    if (e.key !== 'Enter') return;
    const args = input.trim().split(' ');
    const cmd = args[0];
    const newHist = [...history, { type: 'input', content: input, path: cwd }];
    
    const resolvePath = (p) => {
      if (!p) return cwd;
      if (p.startsWith('/')) return p;
      if (p === '..') return cwd.substring(0, cwd.lastIndexOf('/')) || '/';
      return `${cwd === '/' ? '' : cwd}/${p}`;
    };

    switch(cmd) {
      case 'ls':
        const target = fs[cwd];
        target && target.children ? newHist.push({ type: 'output', content: target.children.join('  ') }) : newHist.push({ type: 'error', content: 'Dir not found' });
        break;
      case 'cd':
        const newPath = resolvePath(args[1]);
        fs[newPath]?.type === 'dir' ? setCwd(newPath) : newHist.push({ type: 'error', content: `cd: ${args[1]}: No such directory` });
        break;
      case 'mkdir':
        args[1] && dispatchFs({ type: 'MAKE_DIR', path: resolvePath(args[1]) });
        break;
      case 'neofetch':
        newHist.push({ type: 'output', content: `
       .---.       OS: GlassOS Ultimate
      /     \\      Kernel: 3.4.0
      |  O  |      Uptime: ${Math.floor(Math.random()*100)} mins
      \\     /      Shell: G-Shell
       '---'       CPU: Virtual Silicon
    ` });
        break;
      case 'clear': setHistory([]); setInput(''); return;
      case 'help': newHist.push({ type: 'output', content: 'Try: ls, cd, mkdir, neofetch, clear' }); break;
      default: if (input.trim()) newHist.push({ type: 'error', content: `Command not found: ${cmd}` });
    }
    setHistory(newHist);
    setInput('');
  };

  return (
    <div className="h-full bg-black/90 p-4 font-mono text-sm overflow-auto text-slate-200" onClick={() => document.getElementById('term-in')?.focus()}>
      {history.map((h, i) => (
        <div key={i} className="mb-1 whitespace-pre-wrap">
          {h.type === 'input' && <span className="text-green-400">root@glassos:{h.path}$ </span>}
          <span className={h.type === 'error' ? 'text-red-400' : 'text-slate-300'}>{h.content}</span>
        </div>
      ))}
      <div className="flex text-green-400">
        <span>root@glassos:{cwd}$ </span>
        <input id="term-in" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleCmd} className="flex-1 bg-transparent outline-none ml-2 text-slate-100" autoComplete="off" autoFocus />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

/* --- 3. MUSIC PLAYER --- */
const MusicApp = () => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [bars, setBars] = useState(Array(12).fill(10));
  
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setBars(bars.map(() => Math.random() * 40 + 10));
      setProgress(p => (p >= 100 ? 0 : p + 0.5));
    }, 100);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex flex-col p-6 select-none">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-48 h-48 bg-black/30 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
          <div className={`absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-60 ${playing ? 'animate-pulse' : ''}`}></div>
          <Music size={64} className="relative z-10 drop-shadow-lg" />
          {playing && (
             <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 items-end h-16 pb-4">
               {bars.map((h, i) => (
                 <motion.div 
                   key={i} 
                   animate={{ height: h }} 
                   transition={{ type: 'spring', stiffness: 300, damping: 20 }} 
                   className="w-2 bg-white/80 rounded-t-sm"
                 />
               ))}
             </div>
          )}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">Midnight Coding</h2>
          <p className="text-slate-400 text-sm">Lo-Fi Beats</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setProgress(((e.clientX - rect.left) / rect.width) * 100);
        }}>
          <motion.div className="h-full bg-blue-400" animate={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between px-8">
          <SkipBack className="cursor-pointer hover:text-blue-400" />
          <button onClick={() => setPlaying(!playing)} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/20">
            {playing ? <Pause fill="black" /> : <Play fill="black" className="ml-1"/>}
          </button>
          <SkipForward className="cursor-pointer hover:text-blue-400" />
        </div>
      </div>
    </div>
  );
};

/* --- 4. CODE EDITOR (VS CODE MOCK) --- */
const CodeApp = () => {
  return (
    <div className="h-full flex flex-row bg-[#1e1e1e] text-slate-300 font-mono text-sm">
       <div className="w-48 bg-[#252526] border-r border-black/20 flex flex-col">
          <div className="p-2 text-xs font-bold text-slate-500 tracking-wider">EXPLORER</div>
          <div className="px-2 space-y-1">
             <div className="flex items-center gap-2 px-2 py-1 bg-[#37373d] text-white rounded-sm cursor-pointer"><FolderOpen size={14} className="text-blue-400"/> src</div>
             <div className="pl-4 flex items-center gap-2 px-2 py-1 text-blue-300 bg-[#2a2d2e] cursor-pointer border-l-2 border-blue-500"><FileCode size={14} className="text-yellow-400"/> portfolio.jsx</div>
             <div className="pl-4 flex items-center gap-2 px-2 py-1 hover:text-white cursor-pointer"><FileCode size={14} className="text-blue-400"/> App.css</div>
             <div className="pl-4 flex items-center gap-2 px-2 py-1 hover:text-white cursor-pointer"><FileJson size={14} className="text-yellow-400"/> package.json</div>
          </div>
       </div>
       
       <div className="flex-1 flex flex-col min-w-0">
          <div className="flex bg-[#2d2d2d] border-b border-black/20 text-xs overflow-x-auto">
             <div className="px-4 py-2 bg-[#1e1e1e] border-t-2 border-blue-500 text-white flex items-center gap-2 min-w-fit">
                <FileCode size={14} className="text-yellow-400"/> portfolio.jsx <X size={12} className="ml-2 text-slate-500 hover:text-white cursor-pointer"/>
             </div>
          </div>
          <div className="flex-1 flex min-h-0">
             <div className="w-12 bg-[#1e1e1e] text-slate-600 text-right pr-3 pt-4 select-none border-r border-white/5 text-xs leading-6">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => <div key={i}>{i}</div>)}
             </div>
             <div className="flex-1 p-4 overflow-auto custom-scrollbar text-slate-300 selection:bg-blue-500/30 leading-6">
                <code>
                   <span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-orange-300">'react'</span>;<br/>
                   <br/>
                   <span className="text-green-600">// Welcome to my digital workspace</span><br/>
                   <span className="text-blue-400">const</span> <span className="text-yellow-300">Portfolio</span> = () <span className="text-blue-400">=&gt;</span> {'{'}<br/>
                   {'  '}<span className="text-blue-400">const</span> <span className="text-sky-300">developer</span> = {'{'}<br/>
                   {'    '}<span className="text-sky-300">name</span>: <span className="text-orange-300">'DevUser'</span>,<br/>
                   {'    '}<span className="text-sky-300">role</span>: <span className="text-orange-300">'Full Stack Engineer'</span>,<br/>
                   {'    '}<span className="text-sky-300">status</span>: <span className="text-orange-300">'Open to work'</span><br/>
                   {'  '}{'}'};<br/>
                   <br/>
                   {'  '}<span className="text-purple-400">return</span> (<br/>
                   {'    '}<span className="text-gray-400">&lt;</span><span className="text-blue-300">GlassOS</span><span className="text-gray-400">&gt;</span><br/>
                   {'      '}<span className="text-gray-400">&lt;</span><span className="text-green-300">Project</span> name=<span className="text-orange-300">"Hospital CMS"</span> /<span className="text-gray-400">&gt;</span><br/>
                   {'      '}<span className="text-gray-400">&lt;</span><span className="text-green-300">Project</span> name=<span className="text-orange-300">"Event Planner"</span> /<span className="text-gray-400">&gt;</span><br/>
                   {'    '}<span className="text-gray-400">&lt;/</span><span className="text-blue-300">GlassOS</span><span className="text-gray-400">&gt;</span><br/>
                   {'  '});<br/>
                   {'}'};
                </code>
             </div>
          </div>
          <div className="h-6 bg-blue-600 text-white text-xs flex items-center px-3 gap-4 shrink-0 justify-between">
             <div className="flex gap-4">
                <span className="flex items-center gap-1"><MoreVertical size={10}/> master*</span>
                <span className="flex items-center gap-1"><AlertCircle size={10}/> 0 errors</span>
             </div>
             <div className="flex gap-4">
                <span>Ln 12, Col 5</span>
                <span>UTF-8</span>
                <span>JavaScript React</span>
             </div>
          </div>
       </div>
    </div>
  );
};

/* --- 5. BROWSER & SETTINGS --- */
const BrowserApp = () => (
  <div className="h-full flex flex-col bg-slate-100">
    <div className="h-10 bg-slate-200 flex items-center px-2 gap-2 border-b border-slate-300 shrink-0">
      <div className="flex gap-1"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
      <div className="flex items-center gap-2 text-slate-500 mx-2">
         <ChevronLeft size={16}/> <ChevronRight size={16}/> <RotateCcw size={14}/>
      </div>
      <div className="flex-1 h-7 bg-white rounded-md px-2 flex items-center gap-2 text-xs border border-slate-300">
        <Lock size={10} className="text-green-600"/>
        <span className="flex-1">https://portfolio.dev</span>
      </div>
    </div>
    <div className="flex-1 bg-white flex flex-col items-center justify-center text-slate-400">
      <Globe size={48} className="mb-2 opacity-50" />
      <p>Simulated Browser Environment</p>
      <p className="text-xs mt-2 text-slate-300">Internet Access Restricted by OS</p>
    </div>
  </div>
);

/* ==========================================
   WINDOW MANAGER (RESIZE + SNAP)
   ========================================== */

const Window = ({ app, onClose, onFocus, isActive, style, onSnap, onMove }) => {
  const [maximized, setMaximized] = useState(false);
  const isMobile = window.innerWidth < 768;
  const Component = app.component;
  const resizing = useRef(false);

  // Resize Logic
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = style.w;
    const startH = style.h;

    const onPointerMove = (e) => {
      if (!resizing.current) return;
      // Enforce minimum size
      const newW = Math.max(300, startW + (e.clientX - startX));
      const newH = Math.max(200, startH + (e.clientY - startY));
      onMove(app.id, { w: newW, h: newH });
    };

    const onPointerUp = () => {
      resizing.current = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Snap Logic
  const handleDrag = (e, info) => {
    if (isMobile || maximized) return;
    if (e.clientX < 20) onSnap(app.id, 'preview-left');
    else if (e.clientX > window.innerWidth - 20) onSnap(app.id, 'preview-right');
    else onSnap(app.id, 'clear');
  };

  const handleDragEnd = (e, info) => {
    if (isMobile || maximized) return;
    onSnap(app.id, 'clear'); // Clear preview
    if (e.clientX < 50) onSnap(app.id, 'left');
    else if (e.clientX > window.innerWidth - 50) onSnap(app.id, 'right');
    else {
        // Update position based on drag delta
        onMove(app.id, { x: style.x + info.offset.x, y: style.y + info.offset.y });
    }
  };

  const toggleMaximize = () => {
    setMaximized(!maximized);
  };

  return (
    <motion.div
      drag={!maximized && !isMobile}
      dragMomentum={false}
      dragListener={!maximized}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onPointerDown={onFocus}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={maximized 
        ? { x: 0, y: 0, width: '100%', height: '100%', borderRadius: 0 } 
        : { x: style.x, y: style.y, width: style.w, height: style.h, borderRadius: 12, opacity: 1, scale: 1 }
      }
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      style={{ zIndex: style.zIndex, position: 'absolute' }}
      className={`bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col
        ${isActive ? 'ring-1 ring-white/10 shadow-blue-900/20' : 'opacity-95'}`}
    >
      {/* Titlebar */}
      <div 
        className="h-10 flex items-center justify-between px-4 shrink-0 bg-white/5 border-b border-white/5 select-none cursor-grab active:cursor-grabbing"
        onDoubleClick={() => !isMobile && toggleMaximize()}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-200 pointer-events-none">
          <app.icon size={14} className="text-blue-400" /> {app.title}
        </div>
        <div className="flex gap-2" onPointerDown={e => e.stopPropagation()}>
          <button onClick={() => onClose(app.id, true)} className="hover:bg-white/10 p-1 rounded text-yellow-400"><Minus size={14}/></button>
          {!isMobile && (
            <button onClick={toggleMaximize} className="hover:bg-white/10 p-1 rounded text-green-400">
                {maximized ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
            </button>
          )}
          <button onClick={() => onClose(app.id)} className="hover:bg-red-500 hover:text-white p-1 rounded text-red-400 transition-colors"><X size={14}/></button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
         <Component />
         {!isActive && <div className="absolute inset-0 bg-transparent" />}
      </div>

      {/* Resize Handle */}
      {!maximized && !isMobile && (
        <div 
          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center text-slate-500 hover:text-white z-50 transition-colors" 
          onPointerDown={handlePointerDown}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M10 10V0L0 10H10Z" /></svg>
        </div>
      )}
    </motion.div>
  );
};

/* ==========================================
   CONTEXT MENU
   ========================================== */

const ContextMenu = ({ menu, close, actions }) => {
  if (!menu) return null;
  return (
    <div 
      className="fixed bg-slate-800/90 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl py-1 z-[9999] w-48 origin-top-left animate-in fade-in zoom-in-95 duration-100" 
      style={{ top: Math.min(menu.y, window.innerHeight - 200), left: Math.min(menu.x, window.innerWidth - 200) }} 
      onClick={e => e.stopPropagation()}
    >
      {menu.type === 'desktop' && (
        <>
          <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-blue-600 flex items-center gap-2 transition-colors" onClick={() => { actions.createFolder(); close(); }}>
            <FolderOpen size={14}/> New Folder
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-blue-600 flex items-center gap-2 transition-colors" onClick={() => { actions.changeWallpaper(); close(); }}>
            <ImageIcon size={14}/> Change Wallpaper
          </button>
          <div className="h-[1px] bg-slate-700 my-1"/>
          <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-blue-600 flex items-center gap-2 transition-colors" onClick={() => { actions.refresh(); close(); }}>
            <RefreshCw size={14}/> Refresh System
          </button>
        </>
      )}
      {menu.type === 'file' && (
        <>
          <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-blue-600 flex items-center gap-2 transition-colors" onClick={() => { close(); }}>
            <ExternalLink size={14}/> Open
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-blue-600 flex items-center gap-2 transition-colors" onClick={() => { menu.onRename && menu.onRename(); close(); }}>
            <Edit2 size={14}/> Rename
          </button>
          <div className="h-[1px] bg-slate-700 my-1"/>
          <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 flex items-center gap-2 transition-colors" onClick={() => { actions.deleteFile(menu.target); close(); }}>
            <Trash2 size={14}/> Delete
          </button>
        </>
      )}
    </div>
  );
};

/* ==========================================
   SYSTEM SHELL
   ========================================== */

const APPS = [
  { id: 'terminal', title: 'Terminal', icon: Terminal, component: TerminalApp },
  { id: 'explorer', title: 'Files', icon: FolderOpen, component: FileExplorer },
  { id: 'code', title: 'VS Code', icon: Code, component: CodeApp },
  { id: 'music', title: 'Music', icon: Music, component: MusicApp },
  { id: 'browser', title: 'Chrome', icon: Globe, component: BrowserApp },
];

const Desktop = () => {
  const { wallpaper, isLocked, contextMenu, setContextMenu, dispatchFs, setWallpaper, setIsLocked } = useContext(SystemContext);
  const [windows, setWindows] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [startOpen, setStartOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [snapPreview, setSnapPreview] = useState(null); // 'left' | 'right' | null
  const [refreshKey, setRefreshKey] = useState(0); // To trigger visual refresh
  
  // Boot State
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Window Logic
  const launch = (appId) => {
    if (windows.find(w => w.id === appId)) {
      focusWindow(appId);
      return;
    }
    const app = APPS.find(a => a.id === appId);
    const offset = windows.length * 30;
    const x = Math.min(window.innerWidth - 820, Math.max(20, (window.innerWidth - 800) / 2 + offset));
    const y = Math.min(window.innerHeight - 520, Math.max(20, (window.innerHeight - 500) / 2 + offset));
    
    setWindows([...windows, { app, id: appId, z: windows.length + 1, minimized: false, x, y, w: 800, h: 500 }]);
    setActiveId(appId);
  };

  const closeWindow = (id, minimize = false) => {
    setWindows(prev => minimize ? prev.map(w => w.id === id ? { ...w, minimized: true } : w) : prev.filter(w => w.id !== id));
  };

  const focusWindow = (id) => {
    const maxZ = Math.max(0, ...windows.map(w => w.z));
    setWindows(prev => prev.map(w => w.id === id ? { ...w, z: maxZ + 1, minimized: false } : w));
    setActiveId(id);
  };

  const updateWindowPos = (id, newPos) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...newPos } : w));
  };

  const handleSnap = (id, type) => {
    if (type === 'preview-left') setSnapPreview('left');
    else if (type === 'preview-right') setSnapPreview('right');
    else if (type === 'clear') setSnapPreview(null);
    else {
        setSnapPreview(null);
        const w = window.innerWidth / 2;
        const h = window.innerHeight - 48; 
        const x = type === 'left' ? 0 : w;
        updateWindowPos(id, { x, y: 0, w, h });
    }
  };

  // Context Actions
  const contextActions = {
    createFolder: () => dispatchFs({ type: 'MAKE_DIR', path: '/home/user/New Folder' }),
    changeWallpaper: () => {
      const next = SYSTEM_CONFIG.wallpapers[Math.floor(Math.random() * SYSTEM_CONFIG.wallpapers.length)];
      setWallpaper(next.url);
    },
    deleteFile: (path) => dispatchFs({ type: 'DELETE', path }),
    refresh: () => setRefreshKey(k => k + 1)
  };

  return (
    <div 
      key={refreshKey}
      className="h-screen w-screen overflow-hidden relative select-none font-sans text-slate-200"
      onClick={() => { setStartOpen(false); setContextMenu(null); }}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, type: 'desktop' });
      }}
    >
      {/* 1. Boot Screen */}
      <AnimatePresence>
        {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      {/* 2. Lock Screen */}
      {booted && isLocked && (
        <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-[2000]">
          <div className="absolute inset-0 bg-cover bg-center opacity-50 transition-all duration-1000" style={{ backgroundImage: `url(${wallpaper})` }} />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"/>
          <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <h1 className="text-7xl md:text-9xl font-thin mb-4 tracking-tight drop-shadow-2xl font-mono">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h1>
            <p className="text-xl md:text-2xl mb-12 font-light drop-shadow-lg tracking-widest uppercase">{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 flex flex-col items-center gap-6 shadow-2xl ring-1 ring-white/10">
               <img src={SYSTEM_CONFIG.user.avatar} className="w-24 h-24 rounded-full border-4 border-white/10 shadow-lg" />
               <h3 className="text-xl font-medium tracking-wide">{SYSTEM_CONFIG.user.name}</h3>
               <button onClick={() => setIsLocked(false)} className="px-8 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors font-medium border border-white/10 flex items-center gap-2">
                 <Unlock size={16}/> Sign In
               </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop UI */}
      <div className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-1000 transform hover:scale-105" style={{ backgroundImage: `url(${wallpaper})` }} />
      <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none" />
      
      {/* Snap Preview Ghost */}
      <AnimatePresence>
        {snapPreview && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute top-2 bottom-14 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl z-20 shadow-2xl
                ${snapPreview === 'left' ? 'left-2 w-[49%]' : 'right-2 w-[49%]'}`}
            >
               <div className="absolute inset-0 flex items-center justify-center">
                  <Layout size={48} className="text-white/20"/>
               </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Icons */}
      <div className="absolute inset-0 z-10 p-4 pointer-events-none">
        {APPS.map((app, idx) => {
          const defaultY = 20 + (idx * 100);
          const defaultX = 20;
          
          return (
            <motion.button 
                key={app.id} 
                drag
                dragMomentum={false}
                initial={{ x: defaultX, y: defaultY }}
                onDoubleClick={() => launch(app.id)} 
                className="absolute group flex flex-col items-center gap-2 w-24 p-2 hover:bg-white/10 rounded-lg transition-colors pointer-events-auto cursor-default active:scale-95"
            >
                <div className="w-14 h-14 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center border border-white/10 group-hover:border-blue-400/50 group-hover:scale-105 transition-all">
                   <app.icon size={28} className="text-blue-400 drop-shadow-md" />
                </div>
                <span className="text-[11px] font-medium drop-shadow-md bg-black/40 px-2 py-0.5 rounded-full text-shadow">{app.title}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Windows Layer */}
      <AnimatePresence>
        {windows.map(win => !win.minimized && (
          <Window 
            key={win.id} 
            app={win.app} 
            style={win} 
            isActive={activeId === win.id} 
            onClose={closeWindow} 
            onFocus={() => focusWindow(win.id)} 
            onSnap={handleSnap}
            onMove={updateWindowPos}
           />
        ))}
      </AnimatePresence>

      {/* Context Menu Overlay */}
      <ContextMenu menu={contextMenu} close={() => setContextMenu(null)} actions={contextActions} />

      {/* Start Menu */}
      <AnimatePresence>
        {startOpen && (
          <motion.div 
            initial={{ y: 20, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="absolute bottom-16 left-4 w-80 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-[1500] origin-bottom-left"
            onClick={e => e.stopPropagation()}
          >
             <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14}/>
                <input className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 outline-none focus:bg-white/10 transition-colors" placeholder="Search apps, files..."/>
             </div>
             
             <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider px-1">Pinned</div>
             <div className="grid grid-cols-4 gap-2 mb-6">
               {APPS.map(app => (
                 <button key={app.id} onClick={() => { launch(app.id); setStartOpen(false); }} className="flex flex-col items-center gap-2 hover:bg-white/5 p-2 rounded-xl transition-colors group">
                   <div className="bg-slate-800 p-2.5 rounded-xl border border-white/5 shadow-sm group-hover:scale-105 transition-transform"><app.icon size={20} className="text-blue-300"/></div>
                   <span className="text-[10px] font-medium text-slate-300">{app.title}</span>
                 </button>
               ))}
             </div>

             <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider px-1">Recommended</div>
             <div className="space-y-1 mb-4">
                <button className="w-full flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg text-left transition-colors">
                   <FileText size={16} className="text-yellow-400"/>
                   <div className="flex flex-col">
                      <span className="text-xs font-medium">Project Specs.pdf</span>
                      <span className="text-[10px] text-slate-500">Recently opened</span>
                   </div>
                </button>
             </div>

             <div className="border-t border-white/10 pt-4 flex justify-between items-center px-1">
               <div className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors">
                 <img src={SYSTEM_CONFIG.user.avatar} className="w-8 h-8 rounded-full border border-white/10"/>
                 <div className="flex flex-col">
                    <span className="text-sm font-medium">{SYSTEM_CONFIG.user.name}</span>
                    <span className="text-[10px] text-slate-500">Administrator</span>
                 </div>
               </div>
               <button onClick={() => window.location.reload()} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors" title="Shut Down">
                 <Power size={18}/>
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="absolute bottom-0 w-full h-12 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-4 z-[1000]">
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); setStartOpen(!startOpen); }} 
            className={`p-2 rounded-lg transition-all duration-300 ${startOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-white/10 text-blue-400'}`}
          >
            <Grid size={20} />
          </button>
          <div className="h-6 w-[1px] bg-white/10" />
          
          {/* Open Apps */}
          <div className="flex gap-2">
            {windows.map(win => (
              <button 
                key={win.id} 
                onClick={() => win.id === activeId && !win.minimized ? closeWindow(win.id, true) : focusWindow(win.id)} 
                className={`group p-2 rounded-lg relative transition-all duration-200 ${win.id === activeId && !win.minimized ? 'bg-white/10 shadow-inner ring-1 ring-white/5' : 'hover:bg-white/5'}`}
                title={win.app.title}
              >
                <win.app.icon size={18} className={`transition-colors ${win.id === activeId ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!win.minimized && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,1)]"/>}
              </button>
            ))}
          </div>
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
           <div className="hidden md:flex gap-3 px-3 py-1.5 bg-black/20 rounded-full border border-white/5 hover:bg-black/30 transition-colors cursor-help">
               <Wifi size={14} className="text-slate-200"/>
               <div className="w-[1px] h-3 bg-white/10"/>
               <Battery size={14} className="text-slate-200"/>
           </div>
           <div className="text-right flex flex-col items-end cursor-default" onClick={() => setContextMenu({ type: 'calendar', x: window.innerWidth - 300, y: window.innerHeight - 400 })}>
               <div className="font-bold text-slate-100">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
               <div className="text-[10px] text-slate-500">{currentTime.toLocaleDateString()}</div>
           </div>
           {/* Show Desktop Button */}
           <div className="w-1 h-full border-l border-white/10 ml-2 hover:bg-white/20 cursor-pointer w-2" onClick={() => setWindows(prev => prev.map(w => ({...w, minimized: true})))}/>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <SystemProvider>
    <Desktop />
  </SystemProvider>
);

export default App;