import React, { Component } from "react";
import { loadCart, removeProduct } from "../../../services/cart/actions";

import DelayLink from "../../helpers/delayLink";
import Ink from "react-ink";
import { connect } from "react-redux";
import { formatPrice } from "../../helpers/formatPrice";
import { updateCart } from "../../../services/total/actions";
import Dialog from "@material-ui/core/Dialog";
import { removeCoupon } from "../../../services/coupon/actions";
import Confetti from "../../helpers/react-confetti-boom/lib/index.esm";
import { GoogleApiWrapper } from "google-maps-react";
import Loading from "../../helpers/loading";
import calculateDistanceGoogle from "../../helpers/calculateDistanceGoogle";
import { calculateDistance } from "../../helpers/calculateDistance";
import FreeItemProgress from "./FreeItemProgress";
import { getCartQuantityForItem, getMaxQuantityPerOrder, getQuantityLimitMessage } from "../../helpers/cartQuantityLimit";

import "./FreeItemProgress/index.css";

class Cart extends Component {
  state = {
    isOpen: false,
    removeProductFromPreviousRestaurant: false,
    open: false,
    product: [],
    is_free_delivery: false,
    distance: 0,
    quantityLimitMessage: null,
  };
  componentDidMount() {
    const { cartProducts } = this.props;
    if (cartProducts.length) {
      this.setState({ isOpen: true });
    }
    const { restaurant_info, cartTotal } = this.props;
    console.log(restaurant_info);
    console.log(cartTotal);

    console.log(this.props);

    if (
      restaurant_info.free_delivery_subtotal > 0 &&
      restaurant_info.free_delivery_subtotal <= cartTotal.totalPrice
    ) {
      this.setState({ is_free_delivery: true });
    } else {
      this.setState({ is_free_delivery: false });
    }



    if (
      cartProducts &&
      cartProducts.length > 0 &&
      restaurant_info.id == cartProducts[0].restaurant_id
    ) {
      this.__checkMinOrderFreeItem(restaurant_info, cartTotal);
    }

    
  }
  componentWillReceiveProps(nextProps) {
  
    if (nextProps.newProduct !== this.props.newProduct) {
      this.addProduct(nextProps.newProduct);
    }

    if (nextProps.productToRemove !== this.props.productToRemove) {
      this.removeProduct(nextProps.productToRemove);
    }
    const { restaurant_info } = this.props;
    const { cartTotal } = nextProps;

    console.log(restaurant_info);

    if (
      restaurant_info.free_delivery_subtotal > 0 &&
      restaurant_info.free_delivery_subtotal <= cartTotal.totalPrice
    ) {
      this.setState({ is_free_delivery: true });
    } else {
      this.setState({ is_free_delivery: false });
    }

    const { cartProducts } = nextProps;

    if (
      cartProducts &&
      cartProducts.length > 0 &&
      restaurant_info.id == cartProducts[0].restaurant_id
    ) {
      this.__checkMinOrderFreeItem(restaurant_info, cartTotal);
    }
  }

  openFloatCart = () => {
    this.setState({ isOpen: true });
  };

  closeFloatCart = () => {
    this.setState({ isOpen: false });
  };

  handlePopup = () => {
    this.setState({ open: !this.state.open });
  };

  closeQuantityLimitDialog = () => {
    this.setState({ quantityLimitMessage: null });
  };

  addProduct = (product) => {
    const { cartProducts, updateCart } = this.props;
    //get restaurant id and save to localStorage as active restaurant

    localStorage.setItem("cleared", "false");
    const hasDifferentRestaurantProducts =
      cartProducts.length > 0 && cartProducts[0].restaurant_id !== product.restaurant_id;
    if (!hasDifferentRestaurantProducts) {
      const maxQuantityPerOrder = getMaxQuantityPerOrder(product);
      if (maxQuantityPerOrder > 0 && getCartQuantityForItem(cartProducts, product.id) >= maxQuantityPerOrder) {
        this.setState({ quantityLimitMessage: getQuantityLimitMessage(product, maxQuantityPerOrder) });
        this.openFloatCart();
        return;
      }
    }

    if (!product.quantity || product.quantity < 1) {
      product.quantity = 1;
    }

    let productAlreadyInCart = false;
    let differentRestaurant = false;
    let cartUpdateflag = true;
    cartProducts.forEach((cp) => {
      if (cartUpdateflag) {
        if (product.restaurant_id === cp.restaurant_id) {
          localStorage.setItem("activeRestaurant", product.restaurant_id);
        }
        // first check if the restaurent id matches with items in cart
        // if restaurant id doesn't match, then remove all products from cart
        // then continue to add the new product to cart
        if (cp.restaurant_id === product.restaurant_id) {
          // then add the item to cart or increment count
          if (cp.id === product.id) {
            //check if product has customizations, and if the customization matches with any
            if (
              JSON.stringify(cp.selectedaddons) ===
              JSON.stringify(product.selectedaddons)
            ) {
              // increment the item quantity by 1
              cp.quantity += 1;
              productAlreadyInCart = true;
              differentRestaurant = false;
              this.setUserSelected();
            }
          }
        } else {
          // else if restaurant id doesn't match, then remove all products from cart
          this.setState({
            removeProductFromPreviousRestaurant: true,
            open: true,
          });

          differentRestaurant = true;
          cartUpdateflag = false;

          this.setState({ product: product });
          // setTimeout(() => {
          // 	this.setState({ removeProductFromPreviousRestaurant: false });
          // }, 4 * 1000);

          // cartProducts.splice(0, cartProducts.length);
        }
      }
    });

    if (!productAlreadyInCart && !differentRestaurant) {
      localStorage.setItem("activeRestaurant", product.restaurant_id);
      cartProducts.push(product);
    }

    if (cartUpdateflag) {
      updateCart(cartProducts);
    }
    this.openFloatCart();
  };

  setUserSelected = () => {
    // console.log("Delivery Type: " + this.props.restaurant_info.delivery_type);
    localStorage.getItem("userPreferredSelection") === "DELIVERY" &&
      this.props.restaurant_info.delivery_type === 1 &&
      localStorage.setItem("userSelected", "DELIVERY");
    localStorage.getItem("userPreferredSelection") === "SELFPICKUP" &&
      this.props.restaurant_info.delivery_type === 2 &&
      localStorage.setItem("userSelected", "SELFPICKUP");
    localStorage.getItem("userPreferredSelection") === "DELIVERY" &&
      this.props.restaurant_info.delivery_type === 3 &&
      localStorage.setItem("userSelected", "DELIVERY");
    localStorage.getItem("userPreferredSelection") === "SELFPICKUP" &&
      this.props.restaurant_info.delivery_type === 3 &&
      localStorage.setItem("userSelected", "SELFPICKUP");
  };

  removeProduct = (product) => {
    const { cartProducts, updateCart } = this.props;

    const index = cartProducts.findIndex((p) => p.id === product.id);

    //if product is in the cart then index will be greater than 0
    if (index >= 0) {
      cartProducts.forEach((cp) => {
        if (cp.id === product.id) {
          if (cp.quantity === 1) {
            //if quantity is 1 then remove product from cart
            cartProducts.splice(index, 1);
          } else {
            //else decrement the quantity by 1
            cp.quantity -= product.quantity;
          }
        }
      });

      updateCart(cartProducts);
      if (cartProducts.length < 1) {
        this.closeFloatCart();
        localStorage.removeItem("activeRestaurant");
      }
    }
  };

  getTotalItemsInCart = () => {
    if (localStorage.getItem("countQuantityAsTotalItemsOnCart") === "true") {
      let total = 0;
      this.props.cartProducts.forEach((item) => {
        total += item.quantity;
      });
      return total;
    } else {
      return this.props.cartTotal.productQuantity;
    }
  };

  clearCart = () => {
    const { cartProducts, updateCart, removeCoupon } = this.props;
    cartProducts.splice(0, cartProducts.length);
    this.closeFloatCart();
    removeCoupon();
    setTimeout(() => {
      updateCart(cartProducts);
    }, 500);
    this.addProduct(this.state.product);
    this.openFloatCart();
    this.setState({ open: !this.state.open, product: [] });
    localStorage.setItem("cleared", "true");
    this.setUserSelected();
  };

  	__checkMinOrderFreeItem = (restaurant_info, cartTotal) => {
		const subtotal = parseFloat(formatPrice(cartTotal.totalPrice));
		const free_subtotal = restaurant_info.item_offer_min_subtotal;

		if (restaurant_info.item_offers === 1 && subtotal >= free_subtotal) {
			// work here
			console.log("you have free item")
			this.setState({ is_free_item: true })
		} else {
			this.setState({ is_free_item: false })

			console.log("you don't have  free item")
		}
	}


  render() {
    const { cartTotal, cartProducts, restaurant_info } = this.props;

    let classes = ["float-cart"];

    if (!!this.state.isOpen) {
      classes.push("float-cart--open");
    }

    let remaningAmt = 0;
    let completedOrderRate = 0;
    if (restaurant_info.item_offers&&restaurant_info.item_offer_min_subtotal > 0) {
      remaningAmt =
        restaurant_info.item_offer_min_subtotal - cartTotal.totalPrice;
		
      completedOrderRate = (
        (Number(cartTotal.totalPrice) /
          Number(restaurant_info.item_offer_min_subtotal)) *
        100
      ).toFixed(2);
    }

    console.log(remaningAmt);
    return (
      <React.Fragment>
        {this.state.removeProductFromPreviousRestaurant && (
          <React.Fragment>
            <Dialog
              fullWidth={true}
              fullScreen={false}
              open={this.state.open}
              onClose={this.state.handlePopup}
              style={{ width: "100%", margin: "auto" }}
              PaperProps={{
                style: { backgroundColor: "#fff", borderRadius: "4px" },
              }}
            >
              <div
                className="container"
                style={{ borderRadius: "5px", height: "200px" }}
              >
                <React.Fragment>
                  <div className="px-10 col-12 py-3 d-flex justify-content-between align-items-center">
                    <h1 className="mt-2 mb-0 font-weight-black h4">
                      {localStorage.getItem("cartReplaceItemTitle")}
                    </h1>
                  </div>
                  <div className="px-10 mb-20">
                    {localStorage.getItem("cartReplaceItemSubTitle")}
                  </div>
                  <div className="d-flex justify-content-center">
                    <div className="text-center mr-4">
                      <button
                        className="btn clear-cart-btn"
                        onClick={this.handlePopup}
                        style={{
                          borderColor: localStorage.getItem("storeColor"),
                        }}
                      >
                        {localStorage.getItem("cartReplaceItemActionNo")}
                      </button>
                    </div>

                    <div className="text-center">
                      <button
                        className="btn clear-cart-btn text-white"
                        onClick={this.clearCart}
                        style={{
                          backgroundColor: localStorage.getItem("storeColor"),
                          borderColor: localStorage.getItem("storeColor"),
                        }}
                      >
                        {localStorage.getItem("cartReplaceItemActionYes")}
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              </div>
            </Dialog>
          </React.Fragment>
          // <Fade duration={250} bottom>
          // 	<div className="auth-error going-different-restaurant-notify">
          // 		<div className="">{localStorage.getItem("itemsRemovedMsg")}</div>
          // 	</div>
          // </Fade>
        )}
        <Dialog
          fullWidth={true}
          fullScreen={false}
          open={!!this.state.quantityLimitMessage}
          onClose={this.closeQuantityLimitDialog}
          PaperProps={{
            style: {
              backgroundColor: "#fff",
              borderRadius: "8px",
              margin: "0 auto",
              maxWidth: "420px",
              width: "calc(100% - 48px)",
            },
          }}
        >
          <div
            className="container"
            style={{
              borderRadius: "8px",
              minHeight: "160px",
              padding: "2rem 1.5rem",
              textAlign: "center",
            }}
          >
            <div className="mb-20">
              <h1 className="mt-0 mb-0 font-weight-black h4">Quantity limit reached</h1>
            </div>
            <div className="mb-30" style={{ fontSize: "1rem", lineHeight: "1.5" }}>
              {this.state.quantityLimitMessage}
            </div>
            <div className="d-flex justify-content-center">
              <button
                className="btn clear-cart-btn text-white"
                onClick={this.closeQuantityLimitDialog}
                style={{
                  backgroundColor: localStorage.getItem("storeColor"),
                  borderColor: localStorage.getItem("storeColor"),
                  borderRadius: "6px",
                  minWidth: "140px",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </Dialog>
        <div
          className={
            remaningAmt > 0 && completedOrderRate > 0 && "outer-float-cart"
          }
        >
          {remaningAmt > 0 && completedOrderRate > 0 && (
            <FreeItemProgress
              cartTotal={cartTotal}
              remaningAmt={remaningAmt}
              completedOrderRate={completedOrderRate}
            />
          )}
          <div
            className={classes.join(" ")}
            style={{
              backgroundColor: localStorage.getItem("cartColorBg"),
              color: localStorage.getItem("cartColorText"),
              height: (this.state.is_free_delivery||this.state.is_free_item) && "5rem",
            }}
          >
            {cartProducts.length ? (
              <DelayLink to={"/cart"} delay={200} className="text-white">
                <>
                  <span>
                    {this.getTotalItemsInCart()}{" "}
                    {localStorage.getItem("floatCartItemsText")}
                  </span>
                  <span className="pl-5 pr-5">&nbsp;|&nbsp;</span>
                  <span>
                    {localStorage.getItem("currencySymbolAlign") === "left" &&
                      localStorage.getItem("currencyFormat")}
                    {formatPrice(cartTotal.totalPrice)}
                    {localStorage.getItem("currencySymbolAlign") === "right" &&
                      localStorage.getItem("currencyFormat")}
                  </span>
                  {/* <span>{`${localStorage.getItem("currencyFormat")} ${formatPrice(cartTotal.totalPrice)}`}</span> */}
                  <span className="pull-right">
                    {localStorage.getItem("floatCartViewCartText")}{" "}
                    <i className="si si-basket" />
                  </span>
                  <Ink duration="500" />

                  {this.state.is_free_item && this.state.is_free_delivery ? (
                    <>
                      <div className="text-center">
                        YAY! You've got a Free item and Free Delivery!
                      </div>
                      <Confetti
                        mode="boom"
                        x={0.5}
                        y={1}
                        particleCount={100}
                        deg={270}
                        shapeSize={20}
                        spreadDeg={90}
                        effectInterval={2000}
                        effectCount={2}
                        colors={[
                          "#ff0000",
                          "#0000ff",
                          "#ffa500",
                          "#ff577f",
                          "#ff884b",
                          "#ffd384",
                          "#fff9b0",
                          "#3498db",
                        ]}
                      />
                    </>
                  ) : this.state.is_free_item ? (
                    <>
                      <div className="text-center">
                     {localStorage.getItem("freeItemGotText")}
                      </div>
                      <Confetti
                        mode="boom"
                        x={0.5}
                        y={1}
                        particleCount={100}
                        deg={270}
                        shapeSize={20}
                        spreadDeg={90}
                        effectInterval={2000}
                        effectCount={2}
                        colors={[
                          "#ff0000",
                          "#0000ff",
                          "#ffa500",
                          "#ff577f",
                          "#ff884b",
                          "#ffd384",
                          "#fff9b0",
                          "#3498db",
                        ]}
                      />
                    </>
                  ) : this.state.is_free_delivery ? (
                    <>
                      <div className="text-center">
                        YAY! You've got Free Delivery!
                      </div>
                      <Confetti
                        style={{
                          margin: "10rem",
                        }}
                        mode="boom"
                        x={0.5}
                        y={1}
                        particleCount={100}
                        deg={270}
                        shapeSize={20}
                        spreadDeg={90}
                        effectInterval={2000}
                        effectCount={2}
                        colors={[
                          "#ff0000",
                          "#0000ff",
                          "#ffa500",
                          "#ff577f",
                          "#ff884b",
                          "#ffd384",
                          "#fff9b0",
                          "#3498db",
                        ]}
                      />
                    </>
                  ) : null}
                </>
              </DelayLink>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  cartProducts: state.cart.products,
  newProduct: state.cart.productToAdd,
  productToRemove: state.cart.productToRemove,
  cartTotal: state.total.data,
  restaurant_info: state.items.restaurant_info,
  user: state.user.user,
});

export default GoogleApiWrapper({
  apiKey: localStorage.getItem("googleApiKey"),
  LoadingContainer: Loading,
})(
  connect(
    mapStateToProps,
    { loadCart, updateCart, removeProduct, removeCoupon }
  )(Cart)
);
