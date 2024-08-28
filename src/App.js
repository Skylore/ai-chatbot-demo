import React from 'react';

import Chatbot, { createChatBotMessage } from "react-chatbot-kit";

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

    const response = await fetch('https://api-19.ai-chatbot-demo.com/chat/message', {
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
      <img src="https://cdn.jsdelivr.net/gh/Skylore/ai-chatbot-demo/build/static/media/avatar.jpg" alt="Avatar"/>
    </div>;
  }
}

const ActionProvider = ({createChatBotMessage, setState, children}) => {
  const sendButton = document.getElementsByClassName('react-chatbot-kit-chat-btn-send')[0];

  const setMessage = (message) => {
    const botMessage = createChatBotMessage(message);
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

        render() {
            return (
                <div className="App">
                    <div className={'app-chatbot-container' + (this.state.showChat ? '' : ' hide')}>
                        <Chatbot
                            config={{
                                botName: 'manager',
                                initialMessages: [createChatBotMessage('Гарного дня! Чим можемо долучитися до вашого ідеального смаку шампанського та вина? 😉')],
                                customComponents: {
                                    botAvatar: (props) => <BotAvatar/>
                                }
                            }}
                            headerText='Чат с менеджером'
                            placeholderText='Напишите свое сообщение'
                            messageParser={MessageParser}
                            actionProvider={ActionProvider}
                        />
                    </div>
                    <button type="button" title={'Чат с менеджером'} className="app-chatbot-trigger"
                            onClick={this.handleTriggerClick}></button>
                </div>
            );
        }
    }

    return <ChatWrapper/>;
}

export default App;
