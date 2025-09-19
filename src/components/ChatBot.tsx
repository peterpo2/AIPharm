{/* Messages */}
<div className="flex-1 overflow-y-auto p-4 space-y-4">
  {messages.map((message) => (
    <div
      key={message.id}
      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex items-start space-x-2 max-w-[80%] ${
          message.isUser ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            message.isUser
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        <div
          className={`p-3 rounded-2xl ${
            message.isUser
              ? "bg-primary-500 text-white rounded-br-lg"
              : "bg-gray-100 text-gray-800 rounded-bl-lg"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          {!message.isUser && (
            <p className="text-xs opacity-70 mt-2 border-t border-gray-200 pt-2">
              ⚠️ Това е общa информация. Консултирайте се с лекар.
            </p>
          )}
        </div>
      </div>
    </div>
  ))}
