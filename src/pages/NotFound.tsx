import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Code2, Home } from "lucide-react";
import { HeroButton } from "@/components/ui/button-variants";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-6">
      <div className="text-center">
        <Code2 className="w-24 h-24 text-primary mx-auto mb-6 animate-float" />
        <h1 className="mb-4 text-8xl font-bold gradient-text">404</h1>
        <p className="mb-8 text-2xl text-muted-foreground">Page not found</p>
        <HeroButton onClick={() => navigate("/")}>
          <Home className="w-5 h-5 mr-2" />
          Return to Home
        </HeroButton>
      </div>
    </div>
  );
};

export default NotFound;
