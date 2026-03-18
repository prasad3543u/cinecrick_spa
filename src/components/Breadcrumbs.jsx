import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  const getPathName = (path) => {
    const names = {
      "admin": "Admin",
      "grounds": "Grounds",
      "bookings": "Bookings",
      "my-bookings": "My Bookings",
      "profile": "Profile",
      "settings": "Settings",
      "dashboard": "Dashboard",
      "today": "Today's Matches",
      "users": "Users",
      "slots": "Slots",
    };
    return names[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-white/50 mb-6" aria-label="Breadcrumb">
      <Link to="/home" className="hover:text-pink-400 transition-colors">
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {paths.map((path, index) => {
        const url = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;
        
        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-white font-medium">{getPathName(path)}</span>
            ) : (
              <Link 
                to={url} 
                className="hover:text-pink-400 transition-colors"
              >
                {getPathName(path)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}