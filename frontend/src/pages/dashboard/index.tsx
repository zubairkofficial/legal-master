import React from "react";
import { UserLayout } from "../../components/layout";
import { Calendar, Clock, FileText, MessageSquare } from "lucide-react";

export default function UserDashboard() {
  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Welcome, John</h1>
          <div className="flex items-center space-x-1 bg-muted px-3 py-1 rounded-md text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>Last login: Today, 9:42 AM</span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-4 shadow-sm hover:shadow transition cursor-pointer">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">New Document</h3>
              <p className="text-sm text-muted-foreground">Create a document</p>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-4 shadow-sm hover:shadow transition cursor-pointer">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Schedule</h3>
              <p className="text-sm text-muted-foreground">View your calendar</p>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-4 shadow-sm hover:shadow transition cursor-pointer">
            <div className="p-3 bg-green-500/10 rounded-full">
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium">Messages</h3>
              <p className="text-sm text-muted-foreground">3 unread messages</p>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-4 shadow-sm hover:shadow transition cursor-pointer">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Favorites</h3>
              <p className="text-sm text-muted-foreground">View saved items</p>
            </div>
          </div>
        </div>
        
        {/* Recent Documents */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium">Your Documents</h3>
            </div>
            <div className="divide-y divide-border">
              {[
                "Contract Agreement.pdf",
                "Legal Consultation.docx",
                "Proposal Draft.docx",
                "Meeting Notes.pdf",
                "Research Summary.pdf"
              ].map((doc, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc}</p>
                      <p className="text-sm text-muted-foreground">Modified {i + 1} days ago</p>
                    </div>
                  </div>
                  <button className="text-sm text-primary font-medium">Open</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
} 