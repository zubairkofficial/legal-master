
export default function AdminDashboard() {
  return (
  
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stats Cards */}
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold mt-2">2,456</p>
            <p className="text-xs text-green-500 mt-1">+12% from last month</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium">Active Documents</h3>
            <p className="text-3xl font-bold mt-2">1,893</p>
            <p className="text-xs text-green-500 mt-1">+7% from last month</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium">Revenue</h3>
            <p className="text-3xl font-bold mt-2">$34,567</p>
            <p className="text-xs text-red-500 mt-1">-3% from last month</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium">New Users</h3>
            <p className="text-3xl font-bold mt-2">321</p>
            <p className="text-xs text-green-500 mt-1">+18% from last month</p>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium">User Management</h3>
            </div>
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">User #{i} was updated</p>
                    <p className="text-sm text-muted-foreground">Email: user{i}@example.com</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  
  );
} 