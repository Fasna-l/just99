import React, { Component } from "react";
import Axios from "axios";
import {
  RETRY_PLACE_ORDER_URL,
  SAFEUPI_GATEWAY_PAYMENT_URL,
} from "../../../../../../configs";
import { Helmet } from "react-helmet";
import { Dialog } from "@material-ui/core";
import Ink from "react-ink";
import { getPaymentGateways } from "../../../../../../services/paymentgateways/actions";
import { connect } from "react-redux";
import Loading from "../../../../../helpers/loading";
import { checkAssetURL, saveQrCodeImage } from "../../../../../helpers/truncate";

class Retrypayment extends Component {
  static contextTypes = {
    router: () => null,
  };
  state = {
    payment_gateway_loading: true,
    loading: false,
    stripe_opened: false,
    delivery_charges: 0.0,
    error: false,
    razorpay_opened: false,
    razorpay_success: false,
    canPayPartialWithWallet: false,
    walletChecked: false,
    canPayFullWithWallet: false,
    distance: 0,
    placeOrderError: false,
    errorMessage: "",
    cashChange: "",
    regexp: /^[0-9\b]+$/,
    showCod: false,
    gateways_received: false,

    //Disable Click on Payment buttons if clicked once
    pointerEvents: "auto",
    cursor: "pointer",
    popupopen: false,
  };

  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this.props
        .getPaymentGateways(
          user.data.auth_token,
          localStorage.getItem("activeRestaurant")
        )
        .then((response) => {
          if (response && response.payload) {
            this.setState({ gateways_received: true });
          } else {
            console.error(
              "fetching payment gateways failed... trying again after 2.5s"
            );
            this.retryPaymentGatewaySetInterval = setInterval(() => {
              this.fetchPaymentGateways(user.data.auth_token);
            }, 2500);
          }
        });
    }
  }



  _upiGatewayClick = async (foodomaa_order_id, foodomaa_unique_order_id) => {


    Axios.post(RETRY_PLACE_ORDER_URL, {
      order_id: foodomaa_order_id,
      unique_order_id: foodomaa_unique_order_id,
      token: this.props.user.data.auth_token,
      method: "SAFEUPI",
    }
    ).then(async (response) => {
      if (response.data.success === true) {
        if (response.data.qr_image) {
          await saveQrCodeImage(response.data.qr_image);
          sessionStorage.setItem("amountToPay", response.data.amount);
          sessionStorage.setItem("orderType", response.data.order_type);
          const redirectUrl = `/payment/safe-upi/${response.data.order_id}`;
          window.location.replace(redirectUrl);
          console.log(redirectUrl);
        } else if (response.data.redirect_url) {
          const redirectUrl = response.data.redirect_url;
          console.log(redirectUrl);
          window.location.replace(redirectUrl);
        }
      } else {
        alert("Message - " + response.data.message);
      }
    });

  };


  __handlePlaceOrderAsCod = async (
    foodomaa_order_id,
    foodomaa_unique_order_id
  ) => {
    const { data } = await Axios.post(RETRY_PLACE_ORDER_URL, {
      order_id: foodomaa_order_id,
      unique_order_id: foodomaa_unique_order_id,
      token: this.props.user.data.auth_token,
      method: "COD",
    });
    console.log(data);
    if (data.success) {
      window.location.reload();
    }
  };

  render() {
    console.log(this.props);
    console.log(this.props.paymentgateways);

    return (
      <React.Fragment>

        <div
          onClick={() => this.setState({ popupopen: true })}
          style={{
            backgroundColor: localStorage.getItem("storeColor"),
            padding: "8px",
            position: "relative",
            color: "white",
          }}
        >
          Retry-Payment
          {/* <span className="pulse ml-2" /> */}
          <Ink duration="500" />
        </div>
        <Dialog open={this.state.popupopen}>
          {this.state.loading && <Loading />}
          <div style={{ borderRadius: "5px", width: "100%" }}>
            <div className="col-12 py-3">
              <h1 className="mt-2 mb-2 font-weight-black h4 text-center">
                Retry Payment
              </h1>
              <hr />

              {this.props.paymentgateways.map((gateway) => (
                <>
                  {gateway.name === "SafeUPI-Gateway" && (
                    <div
                      className="col-12 paymentGatewayBlock"
                      onClick={() => {
                        this.setState({ loading: true });
                        this._upiGatewayClick(
                          this.props.order.id,
                          this.props.order.unique_order_id
                        );
                      }}
                      style={{
                        cursor: this.state.cursor,
                        pointerEvents: this.state.pointerEvents,
                      }}
                    >
                      <div className="block block-link-shadow text-left shadow-light">
                        <div className="block-content block-content-full clearfix py-3 payment-select-block">
                          <div className="float-right mt-10">
                            <img
                              src={checkAssetURL("/assets/img/various/upi.png")}
                              alt={gateway.name}
                              className="img-fluid"
                            />
                          </div>
                          <div className="font-size-h3 font-w600">
                            {localStorage.getItem("checkoutUpiGatewayText")}
                          </div>
                          <div className="font-size-sm font-w600 text-muted">
                            {localStorage.getItem(
                              "checkoutUpiGatewaySubText"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {

                    (
                      <React.Fragment>
                        {gateway.name === "COD" && (
                          <React.Fragment>

                            <React.Fragment>
                              <div
                                className="col-12 paymentGatewayBlock"
                                onClick={() => {
                                  this.setState({ loading: true });
                                  this.__handlePlaceOrderAsCod(
                                    this.props.order.id,
                                    this.props.order.unique_order_id
                                  );
                                }}
                              >
                                <div className="block block-link-shadow text-left shadow-light">
                                  <div className="block-content block-content-full clearfix py-3 payment-select-block">
                                    <div className="float-right mt-10">
                                      <img
                                        src={checkAssetURL("/assets/img/various/cod.png")}
                                        alt={gateway.name}
                                        className="img-fluid"
                                      />
                                    </div>
                                    <div className="font-size-h3 font-w600">
                                      {localStorage.getItem(
                                        "checkoutCodText"
                                      )}
                                    </div>
                                    <div className="font-size-sm font-w600 text-muted">
                                      {localStorage.getItem(
                                        "checkoutCodSubText"
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="col-12 hidden"
                                ref="cashAmountBlock"
                              >
                                <div className="text-left">
                                  <input
                                    type="tel"
                                    name="cashChange"
                                    value={this.state.cashChange}
                                    className="form-control cash-change-input"
                                    placeholder={localStorage.getItem(
                                      "cashChangeInputPlaceholder"
                                    )}
                                    onChange={this.__handleCashInput}
                                  />
                                  <button
                                    className="btn btn-main"
                                    style={{
                                      backgroundColor: localStorage.getItem(
                                        "cartColorBg"
                                      ),
                                    }}
                                    onClick={this.__handleCashInputConfirm}
                                  >
                                    {localStorage.getItem(
                                      "cashChangeConfirmButton"
                                    )}
                                  </button>
                                  <p className="pt-2">
                                    {localStorage.getItem(
                                      "cashChangeHelpText"
                                    )}
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>

                          </React.Fragment>
                        )}
                      </React.Fragment>
                    )}


                </>
              ))}
            </div>

            <div className="d-flex justify-content-around align-items-center mb-20 mt-10">
              <button
                style={{ width: "15rem" }}
                className="btn btn-lg btn-danger  "
                onClick={() => this.setState({ popupopen: false })}
              >
                close
              </button>
            </div>
          </div>
        </Dialog>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  paymentgateways: state.paymentgateways.paymentgateways,
});

export default connect(
  mapStateToProps,
  { getPaymentGateways }
)(Retrypayment);
