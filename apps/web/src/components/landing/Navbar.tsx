interface NavbarProps {
  onLoginClick: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  return (
    <nav className="bg-background/40 backdrop-blur-xl border-b border-white/5 fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-12 md:px-16 w-full h-20 transition-all duration-300">
      <div className="flex items-center gap-md">
        <img
          src="/logo.png"
          alt="HARDWOOD"
          className="h-10 w-10 object-contain brightness-110"
        />
        <span className="font-headline-lg text-lg font-bold text-on-surface tracking-[0.2rem] uppercase">
          HARDWOOD
        </span>
      </div>

      <div className="hidden md:flex gap-lg items-center">
        <a
          href="#"
          className="font-label-caps text-[11px] text-tertiary hover:text-primary transition-all duration-200 px-3 py-2 border-b-2 border-transparent hover:border-primary/50 flex items-center gap-1.5"
        >
          SIMULATION
        </a>
        <a
          href="#"
          className="font-label-caps text-[11px] text-tertiary hover:text-primary transition-all duration-200 px-3 py-2 border-b-2 border-transparent hover:border-primary/50 flex items-center gap-1.5"
        >
          DRAFT INTEL
        </a>
        <a
          href="#"
          className="font-label-caps text-[11px] text-tertiary hover:text-primary transition-all duration-200 px-3 py-2 border-b-2 border-transparent hover:border-primary/50 flex items-center gap-1.5"
        >
          LABORATORY
        </a>
        <a
          href="#"
          className="font-label-caps text-[11px] text-tertiary hover:text-primary transition-all duration-200 px-3 py-2 border-b-2 border-transparent hover:border-primary/50 flex items-center gap-1.5"
        >
          PRICING
        </a>
      </div>

      <div className="flex items-center gap-md">
        <button
          onClick={onLoginClick}
          className="bg-white font-label-caps text-[11px] px-6 py-2.5 border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-colors rounded-sm bg-transparent text-black"
        >
          Login
        </button>
      </div>
    </nav>
  );
}
