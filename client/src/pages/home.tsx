import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();
  
  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to CAREERATE</h1>
          <p className="text-xl text-gray-300">
            Hello {user?.firstName || user?.email || 'User'}! You're now signed in.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg mb-8">
            You have successfully logged into the world's first autonomous DevOps platform.
            Your multi-agent system is ready to revolutionize your cloud automation workflows.
          </p>
          
          <div className="space-y-4">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              Launch Dashboard
            </Button>
            <div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="text-gray-300 border-gray-600 hover:bg-gray-800 px-6 py-2 rounded-xl"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}