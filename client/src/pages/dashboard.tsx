export default function Dashboard() {
  console.log('Dashboard component loaded!');
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard Component Loaded!</h1>
        <p className="text-muted-foreground">This is a test to see if the routing is working.</p>
      </div>
    </div>
  );
}
