import React from "react";
import "./index.css";
import { formatPrice } from "../../../helpers/formatPrice";

function FreeDeliveryProgress(props) {
  let classes = ["freedelivery-progress freedelivery-progress-open"];



  return (
    <>
      <div
        className={classes.join(" ")}
        style={{
          bottom: "4rem",
          width: "100vw",
        }}
      >
        <div className="d-flex">
          <div>
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 24 24"
              class="text-dark mr-1"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m20.749 12 1.104-1.908a1 1 0 0 0-.365-1.366l-1.91-1.104v-2.2a1 1 0 0 0-1-1h-2.199l-1.103-1.909a1.008 1.008 0 0 0-.607-.466.993.993 0 0 0-.759.1L12 3.251l-1.91-1.105a1 1 0 0 0-1.366.366L7.62 4.422H5.421a1 1 0 0 0-1 1v2.199l-1.91 1.104a.998.998 0 0 0-.365 1.367L3.25 12l-1.104 1.908a1.004 1.004 0 0 0 .364 1.367l1.91 1.104v2.199a1 1 0 0 0 1 1h2.2l1.104 1.91a1.01 1.01 0 0 0 .866.5c.174 0 .347-.046.501-.135l1.908-1.104 1.91 1.104a1.001 1.001 0 0 0 1.366-.365l1.103-1.91h2.199a1 1 0 0 0 1-1v-2.199l1.91-1.104a1 1 0 0 0 .365-1.367L20.749 12zM9.499 6.99a1.5 1.5 0 1 1-.001 3.001 1.5 1.5 0 0 1 .001-3.001zm.3 9.6-1.6-1.199 6-8 1.6 1.199-6 8zm4.7.4a1.5 1.5 0 1 1 .001-3.001 1.5 1.5 0 0 1-.001 3.001z" />
            </svg>
          </div>
          <div>
            {localStorage.getItem("freeItemProgressPrefixText")}{" "}
            <b>
              {localStorage.getItem("currencySymbolAlign") ===
                "left" && localStorage.getItem("currencyFormat")}
              {props.remaningAmt}
              {localStorage.getItem("currencySymbolAlign") ===
                "right" && localStorage.getItem("currencyFormat")}
            </b>{" "}
            {localStorage.getItem("freeItemProgressSuffixText")}
          </div>
        </div>
        <div
          className="row progress push  mt-1  mb-1"
          style={{
            height: "10px",
            borderRadius: "2px",
            backgroundColor: "#32cd3229",
          }}
        >
          <div
            className="progress-bar progress-bar-animated"
            style={{
              backgroundColor: "limegreen",
              width: `${props.completedOrderRate}%`,
              animation: "progressBarTransition 1.5s ease",
            }}
          />
        </div>
        <div className="d-flex flex-row justify-content-between">
          <div>{localStorage.getItem("cartItemTotalText")}</div>
          <div>
            {localStorage.getItem("currencySymbolAlign") === "left" &&
              localStorage.getItem("currencyFormat")}
            {formatPrice(props.cartTotal.totalPrice)}
            {localStorage.getItem("currencySymbolAlign") === "right" &&
              localStorage.getItem("currencyFormat")}
          </div>
        </div>
      </div>
    </>
  );
}

export default FreeDeliveryProgress;
