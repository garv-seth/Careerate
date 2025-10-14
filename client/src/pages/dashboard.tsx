export default function Dashboard() {
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
          Dashboard
        </h1>
        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
          Welcome to your Careerate dashboard. This is a simplified version to avoid hydration issues.
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Total Projects</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>0</div>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>+2 from last month</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333', 
            borderRadius: '8px', 
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Active Deployments</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>0</div>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>All systems operational</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333', 
            borderRadius: '8px', 
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Monthly Cost</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>$0</div>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>-12% from last month</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #333', 
            borderRadius: '8px', 
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Uptime</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>99.9%</div>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Last 30 days</p>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          border: '1px solid #333', 
          borderRadius: '8px', 
          padding: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Deploy New Project
            </button>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid #333',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Manage Integrations
            </button>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid #333',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              View Costs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}