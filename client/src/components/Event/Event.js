import React from "react";
import {Modal, Collection, CollectionItem} from "react-materialize"
import axios from "axios";
import Header from "../Header";
import {Link} from "react-router-dom";
import "./Event.css";
import MapContainer from "../MapContainer";
import Invitation from "../Invitation";

const styles = {
  map: {
    width: 300,
    height: 300
  }
};

class Event extends React.Component {

  state = {
    currentEvent: {},
    date: "",
    message: "",
    hosts: [],
    messages: [],
    attendees: [],
    allUsers: [],
    joined: false
  };

  componentDidMount = () => {
    let eventId = this.props.match.params.id;
    this.getInfo(eventId);
  };

  getInfo = (EID) => {
    let joined = false;
    axios.get("/api/event/" + EID).then((data) => {
      for (let i = 0; i < data.data.attendees.Users.length; i++){
        if (data.data.attendees.Users[i].username === localStorage.getItem("username")){
          joined = true;
        };
      };
      let eventId = this.props.match.params.id;
      axios.get("/api/chat/" + EID).then((response) => {
        axios.get("/api/allUsers").then((third)=>{
          this.setState({messages: response.data, attendees: data.data.attendees.Users, currentEvent: data.data.attendees, date: data.data.attendees.date.split("T")[0], hosts: data.data.host, allUsers: third.data, joined: joined});
        });
      });
    });
  };

  getHostInfo = () => {
    let userArray =  this.state.attendees
    let hostArray = this.state.hosts
    let hosts = [];
    for (let i = 0; i < userArray.length; i++){
      for (let j = 0; j < hostArray.length; j++){
        if (userArray[i].id === hostArray[j].userId){
          hosts.push(userArray[i]);
        };
      };
    };
    return (hosts.map((element) =>{
      return (
      <div key={element.username} class="host">
        <img id="hostImage" src={element.image === null ? "https://www.vccircle.com/wp-content/uploads/2017/03/default-profile.png" : element.image} /> 
        <span id="hostName"> <Link to={"/profile/" + element.id}><p>{element.username}</p></Link> (Host)</span>
      </div>
      );
    })
  );
  };

  filterHost = () => {
    let emptyArray = [];
    let userArray = emptyArray.concat(this.state.attendees);
    let hostArray = this.state.hosts;
    for (let i = 0; i < userArray.length; i++){
      for (let j = 0; j < hostArray.length; j++){
        if (userArray[i].id === hostArray[j].userId){
          userArray.splice(i, 1);
        };
      };
    };
    return (
    userArray.map(function(person, index){
      return (
        <div key={index} className="attendee">
          <img className="image" src={person.image === null ? "https://www.vccircle.com/wp-content/uploads/2017/03/default-profile.png" : person.image} />
          <Link to={"/profile/" + person.id}><p>{person.username}</p></Link>
        </div>
        );
      })
    );
  };

  joinEvent = (EID) => {
    let userId = localStorage.getItem("user_id");
    axios.post("/api/join/" + EID, {userId: userId}).then((response) => {
      let attendees = this.state.attendees;
      attendees.push(response.data);
      this.setState({attendees: attendees, joined: true});
    });
  };

  handleInputChange = (event) => {
    let message = event.target.value;
    this.setState({message: message});
  };

  handleMessageSubmit = (EID) => {
    let username = localStorage.getItem("username");
    axios.post("/api/chat/", {content: this.state.message, username: username, event_id: EID}).then((response) => {
      let messages = this.state.messages;
      let blank = "";
      this.state.message.length > 0 ? (messages.push(response.data), console.log("greater than 0"), this.setState({messages: messages, message: blank})): console.log("can't send blank message");
    });
  };

  checkHost = () => {
    let user_id = localStorage.getItem("user_id");
    let hostArray = this.state.hosts;
    let found = false;
    for (let i = 0; i < hostArray.length; i++){
      if (hostArray[i].userId === +user_id){
        found = true;
      };
    };
    if (!found){
      return (
        this.state.joined ? <div><button disabled={this.state.joined} onClick={() => {
        }}>You are going</button> <button onClick={() => {
          this.leaveEvent(this.props.match.params.id, user_id)
        }}>Cancel RSVP</button></div> : <button disabled={this.state.joined} onClick={() => {
          this.joinEvent(this.props.match.params.id);
        }}>Join this event</button> 
      );
    } else {
      return (
        <div id="topButtons">
          <Modal trigger={<button>Delete this event</button>}>
          <h5>Are you sure you want to delete this event?</h5>
          <Link to={"/"}><button onClick={() => {
            this.deleteEvent(this.props.match.params.id, user_id)
          }}>Delete this event</button></Link>
          </Modal>
            <Modal trigger={<button>Add another host</button>}>
            <Collection>
            {this.state.allUsers.filter((user)=>{
              return user.username !== localStorage.getItem("username")
            }).map((element) =>{
              return (
                this.checkInvited(element.username) ? 
                <CollectionItem key={element.username}>{element.username} <button disabled="true" value={element.username} onClick={() => {
                  this.inviteHost(this.props.match.params.id, element.id) 
                }}>already going</button></CollectionItem> : <CollectionItem key={element.username}>{element.username} <button value={element.username} className="blue lighten-3" onClick={() => {
                  this.inviteHost(this.props.match.params.id, element.id) 
                }}>add as host</button></CollectionItem>
              );
            })}
            </Collection>
            </Modal>
        </div>
      );
    };
  };

  inviteHost = (EID, userId) => {
    axios.post("/api/addHost/" + EID, {userId: userId}).then((response) => {
      let hosts = this.state.hosts;
      hosts.push(response.data.id);
      this.getInfo(EID);
    });
  };

  leaveEvent = (EID, userId) => {
    axios.delete("/api/leaveEvent/" + userId, {data: {eventId: EID}}).then((response) => {
      this.getInfo(EID);
    });
  };

  deleteEvent = (EID, userId) => {
    let isHost = false
    for (let i = 0; i < this.state.hosts.length; i++){
      if (this.state.hosts[i].userId === +userId){
        isHost = true;
      };
    };
    if (isHost){
      axios.delete("/api/userEvent/" + EID).then((response) => {
        console.log(response);
      });
    };
  };

  inviteUser = (EID, username) => {
    axios.post("/api/invite/", {eventId: EID, eventName: this.state.currentEvent.name, username: username, userId: localStorage.getItem("user_id"), sender: localStorage.getItem("username")}).then((response) => {
    });
  };

  checkInvited = (current) => {
    for (let i = 0; i < this.state.attendees.length; i++){
      if (this.state.attendees[i].username === current){
        return true
      };
    };
    return false
  };

  render(){

    return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col m8" id="topSection">
            <h2>{this.state.currentEvent.name}</h2>
            <p><i class="material-icons">date_range</i>{this.state.date}</p><br/>
            <p id="address"><i class="material-icons">add_location</i>{this.state.currentEvent.address} </p><br/>
            {this.getHostInfo()}<br/>
            {this.checkHost()} 
            <Modal trigger={<button>Share with another user!</button>}>
              <Collection>
                {this.state.allUsers.filter((user) => {
                    return user.username !== localStorage.getItem("username");
                  }).map((element) => {
                    return (
                    this.checkInvited(element.username) ? <CollectionItem key={element.username}>{element.username} <button disabled="true" id={element.username} onClick={() => {
                      this.inviteUser(this.props.match.params.id, element.username)
                    }}>User is already going</button></CollectionItem> : <CollectionItem key={element.username}>{element.username} <button className="blue lighten-2" id={element.username} onClick={() => {
                      this.inviteUser(this.props.match.params.id, element.username)
                    }}>Invite this user</button></CollectionItem>
                  )
                })}
              </Collection>
            </Modal>
          </div>
          <div id="mapLocation" className="col m4">
            <div id="map">
            <MapContainer isEvent={true} events={this.state.currentEvent}  style={styles.map}/>
            </div>
          </div>
        </div>  
        <div className="row">
          <h5>About this event</h5>
            <div class="col m12">
              <p>{this.state.currentEvent.description}</p>
            </div>
        </div>
        <div className="row">
          <h5>Attendees</h5><br/>
            <div class="col m12">
            {this.filterHost()}
            </div>
        </div>
        <div className="row">
        <h5>Message Board</h5><br/>
          <div className="col m12">
              <div id="messageBoard">
                <ul>
                  {this.state.messages.map((message, index) => {
                    return (
                      <li key={index}>
                      <div className="messageBody">
                        <img className="messageImg" src={this.state.attendees.filter((item) => {
                          return item.username === message.username
                        }).map(function(element){
                          return (element.image === null ? 
                          "https://www.vccircle.com/wp-content/uploads/2017/03/default-profile.png" : element.image)
                        })}/> <span className="usernameMessage">{message.username}</span><br/>
                        <span className="message">{message.content}</span>
                        </div>
                      </li>
                      )
                  })}
                </ul>
                <div id="messageSubmit">
                  <textarea value={this.state.message} onChange={this.handleInputChange} placeholder="send a message">
                  </textarea>
                  <button class="blue" onClick={() => {
                  this.handleMessageSubmit(this.props.match.params.id)
                  }}><i class="material-icons">send</i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
};

export default Event;
