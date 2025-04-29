import Markdown from 'react-markdown';

interface ChatGPTFormatterProps {
  response: string;
  writing?: boolean;
}

const ChatGPTFormatter = ({  response, writing }: ChatGPTFormatterProps) => {

    

  return (
    <div className="chat-gpt-formatter font-lato" id={`message-${2}`}>
      <Markdown>{response}</Markdown>
      {/*<Markdown>{index === 0 && !showFullMessage ? truncatedResponse : response}</Markdown>
      
       {index === 0 && isLongResponse && (
        <button onClick={toggleShowMore} className="text-custom-brown">
          {showFullMessage ? 'Show Less' : 'See More'}
        </button>
      )} */}

      {writing && <span className="cursor">|</span>}
    </div>
  );
};

export default ChatGPTFormatter;