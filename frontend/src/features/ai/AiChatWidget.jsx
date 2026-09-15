import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react"
import { useAuth } from "../auth/AuthContext"
import { chatWithAi } from "../food-entries/ai.api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

export function AiChatWidget() {
  const { accessToken } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  // History formatted for Gemini: [{ role: "user" | "model", parts: [{ text: "..." }] }]
  const [history, setHistory] = useState([
    {
      role: "model",
      parts: [{ text: "Hi! I'm your AI nutrition assistant. I can log meals, check your goals, and give you progress summaries. How can I help?" }]
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [history, isOpen])

  const handleSend = async (e) => {
    e?.preventDefault()
    
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage("")
    
    const updatedHistory = [
      ...history,
      { role: "user", parts: [{ text: userMessage }] }
    ]
    setHistory(updatedHistory)
    setIsLoading(true)

    try {
      // Exclude the last message from the history array sent to the backend because
      // the backend takes `message` and `history` separately to simplify logic.
      const historyToSent = history.map(item => ({
        role: item.role,
        parts: item.parts
      }));

      const response = await chatWithAi(userMessage, historyToSent, accessToken)
      
      setHistory([
        ...updatedHistory,
        { role: "model", parts: [{ text: response.data.reply }] }
      ])
    } catch (error) {
      setHistory([
        ...updatedHistory,
        { 
          role: "model", 
          parts: [{ text: "Sorry, I had trouble processing that request. Please try again later." }],
          isError: true 
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!accessToken) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] max-h-[70vh] bg-card border shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in-20">
          
          <div className="flex items-center justify-between p-4 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-full">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.role === "user" ? "bg-muted" : "bg-primary/10 text-primary"
                }`}>
                  {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                
                <div className={`rounded-2xl px-4 py-2 text-sm ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : msg.isError 
                      ? "bg-destructive/10 text-destructive rounded-tl-sm border border-destructive/20"
                      : "bg-muted rounded-tl-sm"
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.parts[0]?.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-muted rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-background">
            <form 
              onSubmit={handleSend}
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Ask your assistant..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-full border-muted-foreground/20 focus-visible:ring-primary/50"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!message.trim() || isLoading}
                className="rounded-full flex-shrink-0 h-10 w-10 shadow-sm"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            </form>
          </div>

        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={`h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          isOpen ? "bg-muted text-muted-foreground hover:bg-muted/90" : "bg-primary text-primary-foreground"
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </Button>
    </div>
  )
}
