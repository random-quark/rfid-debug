import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
    };
  }
  componentDidMount() {
    this.socket = new WebSocket('ws://localhost:8080');

    this.socket.onopen = event => {
      console.info('Now connected to websocket server');
    };

    this.socket.onmessage = event => {
      console.log('Got message');
      const parts = event.data.split('/');
      const tagID = parts[0];
      const action = parts[1].replace(/\r?\n|\r/g, '');
      if (!tagID || !action)
        throw new Error(
          `RFID handler: did not receive message formatted as tagID/action (${event.data})`
        );

      if (action === 'REPLACED') {
        console.log(tagID, 'replaced');
        const tags = this.state.tags;
        const existingIndex = tags.findIndex(tag => tag.id === tagID);
        if (existingIndex > -1) {
          tags[existingIndex].active = true;
        } else {
          tags.push({
            id: tagID,
            active: true,
          });
        }
        this.setState({
          tags,
        });
      } else if (action === 'PICKEDUP') {
        console.log(tagID, 'pickedup');
        const tags = this.state.tags;
        const existingIndex = tags.findIndex(tag => tag.id === tagID);
        if (existingIndex > -1) {
          tags[existingIndex].active = false;
        } else {
          tags.push({
            id: tagID,
            active: false,
          });
        }
        this.setState({
          tags,
        });
      }
    };

    this.socket.onclose = msg => {
      setTimeout(this.connectToSerialProxy, 1000);
    };
  }
  render() {
    console.log('render', this.state.tags);
    this.state.tags.map(console.log);
    const tags = this.state.tags.reduce((acc, tag) => {
      acc.push(tag.id);
      return acc;
    }, []);
    return (
      <div className="App">
        {this.state.tags.map(tag => (
          <div
            className={['tag', 'inactive', tag.active && 'active'].join(' ')}
          />
        ))}
        <ul>{tags.map(tag => <li>{tag}</li>)}</ul>
      </div>
    );
  }
}

export default App;
