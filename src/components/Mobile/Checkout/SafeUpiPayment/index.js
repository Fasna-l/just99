import React, { Component } from "react";
import Axios from "axios";
import {
  SAFEUPI_GATEWAY_CONVERT_ORDER_TO_COD_URL,
  SAFEUPI_GATEWAY_ORDER_STATUS_CHECK_URL,
} from "../../../../configs";
import Meta from "../../../helpers/meta";
import { WEBSITE_URL } from "../../../../configs/website";
import {
  FoodomaaAndroidWebViewUA,
  FoodomaaAndroidWebViewUA2,
  handleDecodeSafeUpiQr,
  parseUpiUri,
} from "../../../helpers/truncate";
import { formatPrice } from "../../../helpers/formatPrice";

class SafeUpiPayment extends Component {
  state = {
    redirecting: false,
    showIntents: true,
    showQrCodeModal: false,
    paytm: null,
    phonepe: null,
  };

  async componentDidMount() {
    const dataUrl = sessionStorage.getItem("qrCodeImage");
    const decodeData = await handleDecodeSafeUpiQr(dataUrl);
    if (decodeData) {
      const result = await parseUpiUri(decodeData);
      if (result&&result.am > 0) {
        this.setState({
          paytm: `paytmmp://cash_wallet?pa=${result.pa}&pn=${result.pn}&am=${
            result.am
          }&cu=INR&tn=${
            result.tn
          }&mc=4722&&sign=AAuN7izDWN5cb8A5scnUiNME+LkZqI2DWgkXlN1McoP6WZABa/KkFTiLvuPRP6/nWK8BPg/rPhb+u4QMrUEX10UsANTDbJaALcSM9b8Wk218X+55T/zOzb7xoiB+BcX8yYuYayELImXJHIgL/c7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr&featuretype=money_transfer`,
          phonepe: `phonepe://qr_scan?pa=${result.pa}&pn=${result.pn}&am=${
            result.am
          }&tn=${result.tn}&tid=${result.tid}`,
        });
      }
      console.log(result);
    }

    console.log(this.props);
    const { order_id } = this.props.match.params;
    this.checkOrderPaymentStatus(order_id); // Start checking order payment status immediately
    this.checkOrderStatusInterval = setInterval(() => {
      this.checkOrderPaymentStatus(order_id);
    }, 5 * 1000); // Check every 5 seconds
  }

  checkOrderPaymentStatus = (order_id) => {
    if (order_id !== null) {
      const url = SAFEUPI_GATEWAY_ORDER_STATUS_CHECK_URL + "/" + order_id;
      Axios.get(url).then((response) => {
        if (response.data.success === true) {
          this.setState({ redirecting: true });
          this.setState({ showIntents: false });
          sessionStorage.removeItem("phonePeIntentUrl");
          sessionStorage.removeItem("googlePayIntentUrl");
          sessionStorage.removeItem("paytmIntentUrl");
          sessionStorage.removeItem("bhimIntentUrl");
          sessionStorage.removeItem("qrCodeImage");
          setTimeout(() => {
            window.location.href = response.data.redirect_url;
          }, 2.5 * 1000);
        }
        if (response.data.success === false) {
          if (response.data.redirect_url) {
            window.location.href = response.data.redirect_url;
          }
        }
      });
    }
  };

  placeOrderAsCod = (order_id) => {
    if (order_id !== null) {
      const url = SAFEUPI_GATEWAY_CONVERT_ORDER_TO_COD_URL + "/" + order_id;
      Axios.get(url).then((response) => {
        if (response.data.success === true) {
          this.setState({ redirecting: true });
          this.setState({ showIntents: false });
          setTimeout(() => {
            window.location.href = response.data.redirect_url;
          }, 3 * 1000);
        }
      });
    }
  };

  handleShowQrCodeModal = () => {
    this.setState({ showQrCodeModal: true });
  };

  handleCloseQrCodeModal = () => {
    this.setState({ showQrCodeModal: false });
  };

  handleShareQrCode = () => {
    if (
      navigator.userAgent === FoodomaaAndroidWebViewUA ||
      navigator.userAgent === FoodomaaAndroidWebViewUA2
    ) {
      if (window.Android !== "undefined") {
        window.Android.shareUpiQrCode(sessionStorage.getItem("qrCodeImage"));
      } else {
        console.log("Sharing not available");
      }
    } else {
      console.log("Sharing not available");
    }
  };

  render() {

    const qrcode = sessionStorage.getItem("qrCodeImage");
    const amountToPay = sessionStorage.getItem("amountToPay");

    return (
       <React.Fragment>
        <Meta
          seotitle={`Pay with UPI | ${localStorage.getItem("seoMetaTitle")}`}
          seodescription={localStorage.getItem("seoMetaDescription")}
          ogtype="website"
          ogtitle={`Pay with UPI | ${localStorage.getItem("seoMetaTitle")}`}
          ogdescription={localStorage.getItem("seoOgDescription")}
          ogurl={window.location.href}
          twittertitle={`Pay with UPI | ${localStorage.getItem(
            "seoMetaTitle"
          )}`}
          twitterdescription={localStorage.getItem("seoTwitterDescription")}
        />
        {this.state.redirecting && (
          <div className="mt-50 container" id="redirecting-div">
            <center>
              <img
                src="/assets/img/order-placed.gif"
                className="img-fluid mb-3"
                style={{
                  maxWidth: "50%",
                  height: "auto",
                }}
                alt={localStorage.getItem("runningOrderPlacedTitle")}
              />
              <h4 className="my-3">
                {localStorage.getItem("runningOrderPlacedTitle")}
              </h4>
              <h3 className="my-5">Redirecting...</h3>
            </center>
          </div>
        )}
        {this.state.showIntents && (
          <div className="mt-4 container" id="payment-options">
            <center>
              <img
                src={WEBSITE_URL + "/assets/img/logos/logo.png"}
                alt="logo"
                className="img-fluid  mt-4 mb-2"
                style={{ width: "135px" }}
              />

              <br />
              <h4 className="my-2">{localStorage.getItem("upiPayHeading")}</h4>
              <p>{localStorage.getItem("upiPaySubHeading")}</p>
              <hr />
              <div className="row mt-3">
                {qrcode !== null && (
                  <>
                    <div className="col-12 col-md-12 col-lg-12 mb-3">
                      <div className="card">
                        <div
                          className="card-body text-center payment-card"
                          style={{ height: "35vh" }}
                        >
                          <h6 className="card-title">
                            {localStorage.getItem("upiPayQrCodeTitle")}
                          </h6>
                          <img
                            src={qrcode}
                            alt="QR Code"
                            style={{
                              width: "210px",
                              maxWidth: "100%",
                              height: "auto",
                              margin: "auto",
                            }}
                            className="position-relative"
                          />
                        </div>
                        <div className="mt-3">
                          <img
                            src={
                              WEBSITE_URL +
                              "/assets/img/various/safe_upi_gateway.png"
                            }
                            alt="logo"
                            className="img-fluid mt-2"
                            style={{ width: "50px" }}
                          />
                        </div>
                         {amountToPay && (
                          <div class="amount-section">
                            <div class="amount-label">Amount to Pay</div>
                            <div class="amount-value">
                              {localStorage.getItem("currencySymbolAlign") ===
                                "left" &&
                                localStorage.getItem("currencyFormat")}
                              {formatPrice(amountToPay)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                     {(navigator.userAgent === FoodomaaAndroidWebViewUA ||
                      navigator.userAgent === FoodomaaAndroidWebViewUA2) && (
                      <>
                        {
                          <>
                            <div className="col-12 col-md-12 col-lg-12 mb-3">
                              <div className="card">
                                <div className="card-body text-center payment-card">
                                  <h6 className="card-title">OR</h6>
                                  <button
                                    className="btn btn-secondary mr-3 safeupigpaycard"
                                    onClick={this.handleShareQrCode}
                                    style={{ height: "34%" }}
                                  >
                                    <img
                                      src={
                                        WEBSITE_URL +
                                        "/assets/img/various/gpay.png"
                                      }
                                      className="mr-2"
                                      style={{ height: "auto", width: "25%" }}
                                    />
                                    {"Gpay"}
                                  </button>

                                  {this.state.paytm && (
                                    <a
                                      className="btn btn-secondary safeupipaytmcard"
                                      href={this.state.paytm}
                                      style={{ height: "34%" }}
                                    >
                                      <img
                                        src={"https://play-lh.googleusercontent.com/IWU8HM1uQuW8wVrp6XpyOOJXvb_1tDPUDAOfkrl83RZPG9Ww3dCY9X1AV6T1atSvgXc"}
                                        height="20px"
                                        width="20px"
                                        className="mr-2"
                                      />
                                      {"Paytm"}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        }
                      </>
                    )}
                   
                  </>
                )}
              </div>
              <p className="text-muted">
                {localStorage.getItem("upiPayWaitMessage")}
              </p>
              {/* {order_type === "delivery" && (
                <>
                  <hr />
                  <div className="cod-payment mt-2">
                    <p className="text-muted">
                      If you face any issues while paying, kindly click on the
                      button below to continue the order as COD.
                    </p>
                    <button
                      onClick={() => this.placeOrderAsCod(order_id)}
                      className="btn btn-danger btn-sm"
                      id="orderAsCod"
                    >
                      Order as COD
                    </button>
                  </div>
                </>
              )} */}
            </center>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default SafeUpiPayment;
