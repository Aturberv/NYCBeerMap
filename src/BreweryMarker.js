import React, { Component } from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import BreweryDescription from './BreweryDescription'

class breweryMarker extends Component {
	state = {
		isShowingModal: false,
	}
  handleClick = () => this.setState({isShowingModal: true})
  handleClose = () => this.setState({isShowingModal: false})
  render() {
    return (
      <div onClick={this.handleClick}>
      <div style={{width:'25px', height:'25px', background:'red'}}/>
      {
        this.state.isShowingModal &&
        <ModalContainer onClose={this.handleClose}>
          <ModalDialog style={{width:'80%'}} onClose={this.handleClose}>
          	<BreweryDescription />
          </ModalDialog>
        </ModalContainer>
      }
    </div>
   );
  }
}

export default breweryMarker;
