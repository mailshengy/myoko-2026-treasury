import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Home, Users, Receipt, Scale, Lock } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/participants', icon: Users, label: 'People' },
    { href: '/expenses', icon: Receipt, label: 'Expenses' },
    { href: '/settlement', icon: Scale, label: 'Settle' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2C3E50] font-sans selection:bg-[#8FA89B] selection:text-white">
      {/* Background Texture */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url(/images/card-pattern.png)', backgroundSize: '300px' }}
      />

      {/* Main Content */}
      <main className="relative z-10 pb-24 max-w-md mx-auto min-h-screen shadow-2xl shadow-black/5 bg-[#F5F5F0]/95 backdrop-blur-sm border-x border-white/20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-[#8FA89B]/20 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex flex-col items-center justify-center w-16 h-full transition-all duration-300",
                  isActive ? "text-[#C7826B] -translate-y-1" : "text-[#8FA89B] hover:text-[#2C3E50]"
                )}>
                  <item.icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={cn("mb-1 transition-transform", isActive && "scale-110")} 
                  />
                  <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C7826B]" />
                  )}
                </a>
              </Link>
            );
          })}
          
          {/* Treasurer Link (Hidden/Subtle) */}
          <Link href="/treasurer">
            <a className={cn(
              "flex flex-col items-center justify-center w-16 h-full transition-all duration-300",
              location === '/treasurer' ? "text-[#C7826B]" : "text-[#8FA89B]/50"
            )}>
              <Lock size={16} strokeWidth={1.5} />
            </a>
          </Link>
        </div>
      </nav>
    </div>
  );
}
