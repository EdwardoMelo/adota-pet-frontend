import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="text-center">
        <h1 className="mb-4 font-display text-7xl font-black text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">Esta página fugiu do canil 🐾</p>
        <a
          href="/"
          className="inline-flex rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-warm transition hover:bg-accent/90"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
