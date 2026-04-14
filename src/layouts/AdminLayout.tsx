import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, FileText } from 'lucide-react';

export const AdminLayout = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', name: 'Usuários', icon: Users },
    { path: '/admin/posts', name: 'Posts', icon: FileText },
    { path: '/admin/settings', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <h1 className="text-xl font-bold text-[#6C63FF] mb-8">CriarteAI Admin</h1>
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isActive ? 'bg-[#6C63FF] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Exit Button */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-slate-100 mt-auto border-t border-slate-100 pt-4"
        >
          <LogOut size={20} />
          Sair do Admin
        </Link>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};
