export default function Dashboard() {
  console.log('Minimal Dashboard component loaded!');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-primary-foreground">Minimal Dashboard Loaded!</h1>
        <p className="text-muted-foreground">This is a temporary test to debug the rendering issue.</p>
      </div>
    </div>
  );
}
