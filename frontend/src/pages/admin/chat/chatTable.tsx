import  { useEffect, useState } from "react";
import { User } from "@/types/types";
import { Button } from "@/components/ui/button";
import { MessageCircle, MessagesSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import chatService, { Chat, ChatMessage } from "@/services/chat.service";
import userService from "@/services/user.service";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function ChatTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<Record<string, Chat[]>>({});
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatDetailsOpen, setIsChatDetailsOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatTitle, setSelectedChatTitle] = useState("");

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
      // If messages for this chat are not loaded yet, fetch them
      if (!chatMessages[chatId]) {
        const messages = await chatService.getChatMessages(chatId);
        setChatMessages(prev => ({
          ...prev,
          [chatId]: messages
        }));
      }
      
      // Set selected chat and open the modal
      setSelectedChatId(chatId);
      setSelectedChatTitle(`Chat #${chatId} - ${user.name}`);
      setIsMessagesModalOpen(true);
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
                users
                  .filter(user => userChats[user.id]?.length > 0)
                  .map((user) => (
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
                                            Load Messages
                                          </Button>
                                        </div>
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

      {/* Chat Messages Modal */}
      <Dialog.Root open={isMessagesModalOpen} onOpenChange={setIsMessagesModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white p-6 shadow-lg z-50 flex flex-col">
            <Dialog.Title className="text-xl font-semibold mb-4">
              {selectedChatTitle}
            </Dialog.Title>
            
            <div className="flex-1 overflow-y-auto mb-4 border rounded-md p-4 space-y-3 max-h-[60vh]">
              {selectedChatId && chatMessages[selectedChatId] ? (
                chatMessages[selectedChatId].length > 0 ? (
                  chatMessages[selectedChatId].map((message, index) => (
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
                ) : (
                  <div className="text-center py-8">No messages in this chat</div>
                )
              ) : (
                <div className="text-center py-8">Loading messages...</div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsMessagesModalOpen(false)}
                className="flex items-center gap-2"
              >
                Close
              </Button>
            </div>
            
            <Dialog.Close asChild>
              <button 
                className="absolute top-4 right-4 inline-flex items-center justify-center rounded-full w-6 h-6 focus:outline-none"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default ChatTable;
