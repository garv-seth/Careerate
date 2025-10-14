export default function TestDashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: '#ffffff',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Test Dashboard - Working!
        </h1>
        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
          This is a test dashboard to verify the routing and rendering is working correctly.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333', 
            borderRadius: '8px', 
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Status</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>✅ Working</div>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Dashboard is rendering</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333', 
            borderRadius: '8px', 
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Hydration</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>✅ Fixed</div>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>No more errors</p>
          </div>
        </div>
      </div>
    </div>
  );
}
