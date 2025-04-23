import  { useEffect, useState } from "react";
import { User } from "@/types/types";
import { Button } from "@/components/ui/button";
import { MessageCircle, MessagesSquare, ChevronRight, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import chatService, { Chat, ChatMessage } from "@/services/chat.service";
import userService from "@/services/user.service";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function ChatTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<Record<string, Chat[]>>({});
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [isChatDetailsOpen, setIsChatDetailsOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await userService.getAllUsers();
      setUsers(users);
      
      // Get chats for each user
      const userChatsMap: Record<string, Chat[]> = {};
      
      for (const user of users) {
        try {
          const response = await chatService.getUserChats();
          // Filter chats for this user if the API doesn't already do it
          const chats = response.data.filter(chat => chat.userId === user.id);
          userChatsMap[user.id] = chats;
        } catch (err) {
          console.error(`Error fetching chats for user ${user.id}:`, err);
        }
      }
      
      setUserChats(userChatsMap);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewChatHistory = async (user: User, chatId: string) => {
    try {
      // If messages for this chat are already loaded, just toggle the expanded state
      if (chatMessages[chatId]) {
        setExpandedChat(expandedChat === chatId ? null : chatId);
        return;
      }

      // Otherwise, fetch the messages
      const messages = await chatService.getChatMessages(chatId);
      setChatMessages(prev => ({
        ...prev,
        [chatId]: messages
      }));
      setExpandedChat(chatId);
    } catch (err) {
      console.error(`Error fetching messages for chat ${chatId}:`, err);
    }
  };

  const handleViewUserChats = (user: User) => {
    setSelectedUser(user);
    setIsChatDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Chat Management</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading users and chats...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 border-b">User</th>
                <th className="text-left p-3 border-b">Email</th>
                <th className="text-center p-3 border-b">Total Chats</th>
                <th className="text-center p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="p-3 border-b">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {user.name}
                      </div>
                    </td>
                    <td className="p-3 border-b">{user.email}</td>
                    <td className="p-3 border-b text-center">
                      {userChats[user.id]?.length || 0}
                    </td>
                    <td className="p-3 border-b flex justify-center">
                      <Sheet open={isChatDetailsOpen && selectedUser?.id === user.id} onOpenChange={(open) => !open && setIsChatDetailsOpen(false)}>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewUserChats(user)}
                            className="flex items-center gap-2"
                          >
                            <MessagesSquare className="h-4 w-4" />
                            View Chats
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              {user.name}'s Chat History
                            </h3>
                            
                            {!userChats[user.id] || userChats[user.id].length === 0 ? (
                              <div className="text-center py-8">
                                No chat history found for this user
                              </div>
                            ) : (
                              <Accordion type="single" collapsible>
                                {userChats[user.id].map((chat) => (
                                  <AccordionItem value={chat.id} key={chat.id}>
                                    <AccordionTrigger className="px-4 py-2 hover:bg-muted/50 rounded-md">
                                      <div className="flex justify-between items-center w-full">
                                        <div className="flex items-center gap-2">
                                          <MessageCircle className="h-4 w-4" />
                                          <span>Chat #{chat.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <span>Status: {chat.status}</span>
                                          <span>Created: {formatDate(chat.createdAt)}</span>
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="p-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                          <h4 className="font-medium">Messages</h4>
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleViewChatHistory(user, chat.id)}
                                          >
                                            {!chatMessages[chat.id] ? "Load Messages" : (expandedChat === chat.id ? "Hide Messages" : "Show Messages")}
                                          </Button>
                                        </div>
                                        
                                        {expandedChat === chat.id && chatMessages[chat.id] && (
                                          <div className="border rounded-md p-4 space-y-3 max-h-96 overflow-y-auto">
                                            {chatMessages[chat.id].length === 0 ? (
                                              <div className="text-center py-2">No messages in this chat</div>
                                            ) : (
                                              chatMessages[chat.id].map((message, index) => (
                                                <div 
                                                  key={message.id || index} 
                                                  className={`p-3 rounded-md ${
                                                    message.sender === 'user' 
                                                      ? 'bg-blue-50 ml-auto max-w-[75%]' 
                                                      : 'bg-gray-50 mr-auto max-w-[75%]'
                                                  }`}
                                                >
                                                  <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-semibold">
                                                      {message.sender === 'user' ? 'User' : 'System'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                      {formatDate(message.createdAt)}
                                                    </span>
                                                  </div>
                                                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ChatTable;
