import React, { Component } from "react";
import { Dialog } from '@material-ui/core';

class ConfirmDelete extends Component {
	state = {
		open: false,
	};

	componentWillReceiveProps(nextProps) {
		if (nextProps.ConfirmDeleteOpen === false) {
			this.setState({ open: false });
		}
		if (nextProps.ConfirmDeleteOpen === true) {
			this.setState({ open: true });
		}
	}

	handleClose = () => {
		this.setState({ open: false });
	};

	render() {
		return (
			<React.Fragment>
				<Dialog
					fullWidth={true}
					fullScreen={false}
					open={this.state.open}
					onClose={this.handleClose}
					style={{ width: "300px", margin: "auto" }}
					PaperProps={{ style: { backgroundColor: "#fff", borderRadius: "10px" } }}
				>
					<div className="container" style={{ borderRadius: "10px" }} onClick={this.props.handleDelete}>
						<div className="row d-flex justify-content-center mt-30 mb-20 align-items-center flex-column">
							<div className="d-flex justify-content-center my-10 pl-3 pr-3 font-w700 text-center">
								Are you sure you want to delete your account?
							</div>
							<i className="si si-trash confirm-logout-icon" style={{ fontSize: "3.2rem", color: "red" }} />
							<div className="d-flex justify-content-center my-10 pl-3 pr-3 font-w400 text-center">
								Your name, phone, email, address, wallet balance, wallet transactions will be deleted. We cannot reverse this action!!!
							</div>
						</div>
					</div>
				</Dialog>
			</React.Fragment>
		);
	}
}

export default ConfirmDelete;
