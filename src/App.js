import React from 'react';

import Chatbot, {createChatBotMessage, createCustomMessage} from "react-chatbot-kit";

import 'react-chatbot-kit/build/main.css';
import './App.css';
import uuid from "react-uuid";

const ClientContext = React.createContext({
  id: uuid()
});

const MessageParser = ({children, actions}) => {
  const clientId = React.useContext(ClientContext).id;
  const sendButton = document.getElementsByClassName('react-chatbot-kit-chat-btn-send')[0];

  const parse = async (message) => {
    sendButton.setAttribute('disabled', '')

    const response = await fetch('https://api-flowers.ai-chatbot-demo.com/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({message, id: clientId})
    });
    const data = await response.json();

    // eslint-disable-next-line react/prop-types
    actions.setMessage(data.message);
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions,
        });
      })}
    </div>
  );
};

class BotAvatar extends React.Component {
  render() {
    return <div className="react-chatbot-kit-chat-bot-avatar-container">
      <img src="https://cdn.jsdelivr.net/gh/Skylore/ai-chatbot-demo@1.0.3-flowers/build/static/assistant-img.jpeg" alt="Avatar"/>
    </div>;
  }
}

const ActionProvider = ({setState, children}) => {
  const sendButton = document.getElementsByClassName('react-chatbot-kit-chat-btn-send')[0];

  const setMessage = (message) => {
    const botMessage = createCustomMessage("", 'custom', {
      payload: message
    })
    sendButton.removeAttribute('disabled')

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  // Put the handleHello function in the actions object to pass to the MessageParser
  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            setMessage,
          },
        });
      })}
    </div>
  );
};

function CustomMessage(message) {
  localStorage.setItem('chat_messages', JSON.stringify(message.state?.messages));

  const replaceMarkdownLinks = (text) => {
    // Regular expression to match [link name](link) format
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    // Replace with <a href="link">link name</a>
    return text.replace(regex, '<a href="$2" target="_blank">$1</a>');
  };

  const createMarkup = (text) => {
    // Replace markdown links with HTML links
    const parsedText = replaceMarkdownLinks(text);
    return { __html: parsedText };
  };

  return (
    <div className="react-chatbot-kit-chat-bot-message-container">
      <div className="react-chatbot-kit-chat-bot-avatar-container">
        <img src="https://cdn.jsdelivr.net/gh/Skylore/ai-chatbot-demo@1.0.3-flowers/build/static/assistant-img.jpeg" alt="Alt"/>
      </div>
      <div className="react-chatbot-kit-chat-bot-message">
        <span dangerouslySetInnerHTML={createMarkup(message.payload)}></span>
      </div>
    </div>
  );
}

function App() {
    class ChatWrapper extends React.Component {
        static contextType = ClientContext;

        constructor(props) {
            super(props);
            this.state = {showChat: true};
            this.handleTriggerClick = this.handleTriggerClick.bind(this);
        }

        handleTriggerClick() {
            this.setState(state => ({
                showChat: !state.showChat
            }));
        }

        loadMessages() {
          return JSON.parse(localStorage.getItem('chat_messages'));
        };

        render() {
            return (
                <div className="App">
                    <div className={'app-chatbot-container' + (this.state.showChat ? '' : ' hide')}>
                        <Chatbot
                            config={{
                                botName: 'manager',
                                initialMessages: [createChatBotMessage('🌺 Flowers Speak Louder Than Words! 🌺\n' +
                                  '\n' +
                                  'Welcome to a place where emotions blossom. 💐 We turn your feelings into vibrant arrangements. What would you like to share with the world today? Let\'s create a floral miracle together! 🌟')],
                                customComponents: {
                                    botAvatar: (props) => <BotAvatar/>
                                },
                              customMessages: {
                                custom: (props) => <CustomMessage {...props} />,
                              },
                            }}
                            headerText='Chat with florist '
                            placeholderText='Write your message'
                            messageParser={MessageParser}
                            actionProvider={ActionProvider}
                            messageHistory={this.loadMessages()}
                        />
                    </div>
                    <button type="button" title={'Chat with sommelier '} className="app-chatbot-trigger"
                            onClick={this.handleTriggerClick}></button>
                </div>
            );
        }
    }

    return <ChatWrapper/>;
}

export default App;
