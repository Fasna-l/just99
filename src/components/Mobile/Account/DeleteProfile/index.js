import React, { Component } from "react";

import { connect } from "react-redux";
import { logoutUser } from "../../../../services/user/actions";
import ConfirmDelete from "./ConfirmDelete";
import Loading from "../../../helpers/loading";
import Ink from "react-ink";
import Axios from "axios";
import { DELETE_USER_PROFILE_URL } from "../../../../configs";

class DeleteProfile extends Component {
	state = {
		confirmDeletePopupOpen: false,
        loading: false,
        haveRunningOrder: false,
        errorMessage: null,
	};

	openConfirmDelete = () => {
		this.setState({ confirmDeletePopupOpen: true });
	};

    async _handleDelete(event) {
        this.setState({ loading: true });
        const { user } = this.props;
        // console.log(user);
        Axios.post(DELETE_USER_PROFILE_URL, {
            token: user.data.auth_token,
            user_id: user.data.id
        })
        .then((response) => {
            const data = response.data;
            if (data.success === true) {
                this.props.logoutUser();
            } else {
                this.setState({ loading: false });
                this.setState({ confirmDeletePopupOpen: false });
                this.setState({ haveRunningOrder: true });
                setTimeout(function(){
                    this.setState({haveRunningOrder:false});
               }.bind(this),5000); 
            }
        })
        .catch((error) => {
            this.setState({ loading: false });
            console.log(error);
        });
    }

	render() {
		return (
			<React.Fragment>
				<ConfirmDelete
					ConfirmDeleteOpen={this.state.confirmDeletePopupOpen}
					handleDelete={() => this._handleDelete()}
				/>
                {this.state.haveRunningOrder && 
                    <div className="auth-error no-click">
                        <div className="error-shake">
                        You have running Orders. Kindly complete the orders before Deleting Account!!!
                        </div>
                    </div>
                }
                {this.state.loading && <Loading />}
				<div className="mx-15 position-relative text-center mt-4" onClick={this.openConfirmDelete}>
					<div className="flex-auto">
                        <div className="btn deleteAccountBtn btn-outline-danger btn-block">
                            <i className="si si-trash mr-1" /> Delete Account
                            <Ink duration="500" />
                        </div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	user: state.user.user,
});

export default connect(
	mapStateToProps,
    { logoutUser }
)(DeleteProfile);