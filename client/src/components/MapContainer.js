import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import React, { Component } from 'react';
import mapTest from "../../mapTest.json";

const address = `${mapTest[i].streetAddress} ${mapTest[i].city} ${mapTest[i].state} ${mapTest[i].zip}`;

export class MapContainer extends Component {

    state = {
        "type" : "",
        "streetAddress": "",
        "city": "",
        "state": "",
        "zip": "",
        "gameStatus": ""
      };

    onMarkerClick = () => {
        alert("hey");
      };
    
      componentDidMount() {
          let addy = `${this.state.streetAddress} ${this.state.city} ${this.state.city} ${this.state.zip}`;

          API.



        setTimeout(() => {
          this.setState({
            on: true
          })
        }, 2000);
      }

  render() {
    return (
      <Map google={this.props.google} zoom={14}>

        {this.state.on ? <Marker onClick={this.onMarkerClick}
                name={address} /> : null}

      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: (AIzaSyCLk94LTMJRjooWHuL5CAzeCxxSoML927Y)
})(MapContainer)