import React, { Component } from 'react';
import axios from "axios";
import { GET_JUST99_BRANCHES_URL } from "../../../configs/index";
import Ink from 'react-ink';
import Flip from "react-reveal/Flip";

import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { getFoodTimes, placeholderImage } from '../../helpers/truncate';
import { RiSearch2Line } from 'react-icons/ri';
import {
  RiArrowLeftLine,
  RiMapPinFill,
  RiSearchLine,
  RiMenuLine,
  RiUser3Line,
  RiHome5Line,
} from "react-icons/ri";

// import {
//   RiArrowLeftLine,
//   RiMapPinFill,
//   RiSearchLine,
//   RiMenuLine,
// } from "react-icons/ri";

class Header extends Component {
  state = {
  reward_count: 0,
  couponModal: false,
  stories: [],
  loading: true,
  city: null,
  placeholders: ['biriyani', 'dosa', 'fried chicken', 'mandhi'],
  currentPlaceholderIndex: 0,

  branches: [],
  selectedBranchSlug:
    localStorage.getItem("selectedBranchSlug") || "",

  branchDropdownOpen: false,
}
  // state = {
  //   reward_count: 0,
  //   couponModal: false,
  //   stories: [],
  //   loading: true,
  //   city: null,
  //   placeholders: ['biriyani', 'dosa', 'fried chicken', 'mandhi'],
  //   currentPlaceholderIndex: 0,
  // }

  static contextTypes = {
    router: () => null,
  };

  componentDidMount() {
  const { user } = this.props;

  try {
    this.setState({
      city: localStorage.getItem("city")
    });
  } catch (error) {
  }

  // Listen for branch changes from RestaurantList
  window.addEventListener(
    "branchChanged",
    this.handleExternalBranchChange
  );

  window.addEventListener(
    "openBranchDropdown",
    this.handleOpenBranchDropdown
  );

  this.getBranches();
}

componentWillUnmount() {
    window.removeEventListener(
        "branchChanged",
        this.handleExternalBranchChange
    );

    window.removeEventListener(
        "openBranchDropdown",
        this.handleOpenBranchDropdown
    );
}

  getBranches = () => {
  axios
    .get(GET_JUST99_BRANCHES_URL)
    .then((response) => {
      this.setState({
        branches: response.data || [],
      });
    })
    .catch((error) => {
      console.log("Failed to load branches:", error);
    });
};

handleExternalBranchChange = (event) => {
  const selectedBranchSlug = event.detail;

  this.setState({
    selectedBranchSlug,
  });
};

handleHeaderBranchChange = (event) => {
  const selectedBranchSlug = event.target.value;

  this.setState({
    selectedBranchSlug,
  });

  localStorage.setItem(
    "selectedBranchSlug",
    selectedBranchSlug
  );

  // Tell RestaurantList that the branch changed
  window.dispatchEvent(
    new CustomEvent("branchChanged", {
      detail: selectedBranchSlug,
    })
  );
};

handleCustomBranchChange = (branchSlug) => {
  this.setState({
    selectedBranchSlug: branchSlug,
    branchDropdownOpen: false,
  });

  localStorage.setItem(
    "selectedBranchSlug",
    branchSlug
  );

  window.dispatchEvent(
    new CustomEvent("branchChanged", {
      detail: branchSlug,
    })
  );
};

handleOpenBranchDropdown = () => {
    this.setState({
        branchDropdownOpen: true,
    });
};

  getAddress = () => {
    const { hide_seacrh } = this.props;
    try {
      const city = JSON.parse(localStorage.getItem("city"));
      if (city.name)
        return city.name;
      else {
        try {
          return JSON.parse(
            localStorage.getItem("userSetAddress")
          ).address.substring(0, hide_seacrh ? 40 : 28);
        } catch (error) {
          this.context.router.history.push("/search-location");

        }
      }
    } catch (error) {
      try {
        return JSON.parse(
          localStorage.getItem("userSetAddress")
        ).address.substring(0, hide_seacrh ? 40 : 28);
      } catch (error) {
        this.context.router.history.push("/search-location");


      }
    }
  }
  render() {
    const { is_back, explore, plus_icon, no_location, search_bar, user, user_info, hide_food_times, heading_color, head_name, hide_name, home } = this.props;

    return (
      <React.Fragment>
        <div className='d-flex flex-column'

        >
          {user_info && user && user.success && !hide_name ? (
            <>
              <div className={`d-flex align-items-center w-100 px-1 pt-0 justify-content-betweens `}>
                {!search_bar ?
                  <Link to={'/my-account'} className='position-relative pr-3' style={{ color: '#fff', flexShrink: 1 }}>
                    {
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ fontWeight: '500', height: '10vw', width: '10vw', borderRadius: '100px', backgroundColor: '#121212', padding: '14px', color: '#f1f1f1', fontSize: '0.98em', border: '2px solid #3d3d3d' }}
                      >
                        {this.props.user.data.name.charAt(0)}
                      </div>
                    }
                    <Ink duration={1000} />
                  </Link>
                  : <></>
                }
                <div className='d-flex flex-column align-items-start' style={{ flexShrink: 1 }}>
                  <span className='d-flex align-items-center' style={{ fontSize: '1em' }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: search_bar ? '25px' : '1.25rem', width: 'auto', maxWidth: '65vw', fontWeight: '700', color: heading_color ? heading_color : 'inherit' }}>{"Hey, " + user.data.name} </span>
                    <span style={{ fontSize: search_bar ? '25px' : '1.25rem', fontWeight: '700' }}>👋</span>
                  </span>
                  {hide_food_times ? null :
                    <div
                      className='d-flex align-items-center'
                      style={{
                        fontSize: '11px',

                        fontWeight: 500
                      }}><span style={{ minWidth: '30%', }}>{getFoodTimes()} at </span>{no_location ? null : <div className='d-flex align-items-center pl-2'
                        onClick={() => {
                          const locationtomoce = user && user.success && user.data && user.data.default_address && user.data.default_address.address ? "/my-addresses" : "/search-location"
                          this.context.router.history.push(locationtomoce)
                        }


                        }><RiMapPinFill /><span className='pl-2'
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            width: '150px',
                            textOverflow: "ellipsis",
                          }}>{this.getAddress()}</span></div>}</div>
                  }
                </div>
                {search_bar ? (
                  <Link to={'/my-account'} className='position-relative' style={{ color: '#000', flexShrink: 1 }}>

                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{ fontWeight: '500', height: '10vw', width: '10vw', borderRadius: '100px', backgroundColor: '#121212', padding: '14px', color: '#f1f1f1', fontSize: '0.98em', border: '2px solid #3d3d3d' }}
                    >
                      {this.props.user.data.name.charAt(0)}
                    </div>

                    <Ink duration={1000} />
                  </Link>
                ) : (
                  <>
                    {plus_icon &&
                      <div className='d-flex flex-column align-items-end pl-10' style={{ flexGrow: 0, fontSize: '0.89em', color: '#A3A3A3' }}>
                        <Link
                          to={'/subscriptions'}
                          style={{
                            color: '#a3a3a3'
                          }}>
                          <img
                            className='mr-2'
                            style={{
                              height: 32
                            }}
                            src='https://i.ibb.co/PY4QSv4/Untitled-design-8-removebg-preview.png'
                          />
                        </Link>
                      </div>
                    }
                  </>
                )}
              </div>
              {home &&
                <Link
                  to={'/explore'}
                  className='pt-15'
                >
                  <div className='d-flex align-items-center py-10' style={{ background: '#FAFAFA', borderRadius: '0.85rem', border: '0.5px solid #bbb', justifyContent: 'space-between' }}>
                    <div
                      className='pl-15 d-flex align-items-center'
                      style={{ fontSize: '0.98rem', fontWeight: '600', color: '#A3A3A3' }}
                    >
                      <span className='pr-1' style={{ fontWeight: '400' }}>Search For</span>
                      <Flip collapse bottom when={this.state.flips}>
                        {" "}
                        '{this.state.placeholders[this.state.currentPlaceholderIndex]}'
                      </Flip>
                    </div>
                    <span style={{ right: '15px' }} className='pr-15'>
                      <RiSearch2Line size={22} color='#545454' />
                    </span>
                  </div>
                </Link>
              }
            </>
          ) : null}
          <div className="d-flex align-items-center justify-content-between">


          {!this.props.user.success && !is_back && (
            <div
              className="d-flex flex-column w-100"
                style={{
                  padding: "5px 12px 12px 12px",
                  backgroundColor: "#CA202C",
                }}
            >  
          <div
            className="d-flex align-items-center justify-content-between w-100"
                style={{
                  height: 85,
                }}
          >

    {/* ================= MY ACCOUNT ================= */}

    <Link
      to="/my-account"
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        color: "#fff",
        textDecoration: "none",
        width: 25,
      }}
    >

      {/* Round icon */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "2px solid #fff",
        }}
      >
        <RiUser3Line
          size={20}
          color="#fff"
        />
      </div>

      {/* Text */}
      <span
        style={{
          fontSize: 8,
          fontWeight: 600,
          marginTop: 1,
          color: "#fff",
        }}
      >
       Account
      </span>

    </Link>


    {/* ================= EATBRO LOGO ================= */}

    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        flex: 1,
      }}
    >

      <img
        src={require("../../../assets/images/eatbro-logo.png")}
        alt="Eatbro"
        style={{
          height: 60,
          maxWidth: 180,
          objectFit: "contain",
        }}
      />

    </div>


    {/* ================= HOME ================= */}

    <Link
      to="/"
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        color: "#fff",
        textDecoration: "none",
        width: 25,
      }}
    >

      {/* Round icon */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "2px solid #fff",
        }}
      >

        <RiHome5Line
          size={20}
          color="#fff"
        />

      </div>

      {/* Text */}
      <span
        style={{
          fontSize: 8,
          fontWeight: 600,
          marginTop: 1,
          color: "#fff",
        }}
      >
        Home
      </span>

    </Link>

  </div>

  <div className="branch-select-wrapper">

  {/* SELECTED BRANCH BOX */}
  <div
    className={
      "branch-select-control " +
      (this.state.branchDropdownOpen
        ? "branch-select-control-open"
        : "")
    }
    onClick={() =>
      this.setState({
        branchDropdownOpen:
          !this.state.branchDropdownOpen,
      })
    }
  >

    <i
      className="si si-location-pin"
      style={{
        color: "#CA202C"
      }}
    />

    <span className="branch-selected-text">
  {this.state.selectedBranchSlug
    ? (
      this.state.branches.find(
        (branch) =>
          branch.slug ===
          this.state.selectedBranchSlug
      )
        ? this.state.branches.find(
            (branch) =>
              branch.slug ===
              this.state.selectedBranchSlug
          ).name
        : "Select Branch"
    )
    : "Select Branch"}
</span>

    {/* <span className="branch-selected-text">
      {this.state.selectedBranchSlug
        ? (
          this.state.branches.find(
            (branch) =>
              branch.slug ===
              this.state.selectedBranchSlug
          )?.name || "Select Branch"
        )
        : "Select Branch"}
    </span> */}

    <i
      className={
        "si si-arrow-down branch-select-arrow " +
        (this.state.branchDropdownOpen
          ? "branch-select-arrow-open"
          : "")
      }
    />

  </div>


  {/* CUSTOM DROPDOWN OPTIONS */}
  {this.state.branchDropdownOpen && (

    <div className="branch-dropdown-menu">

      {/* SELECT BRANCH */}
      <div
        className={
          "branch-dropdown-option branch-dropdown-placeholder " +
          (!this.state.selectedBranchSlug
            ? "branch-dropdown-option-active"
            : "")
        }
        onClick={(event) => {
          event.stopPropagation();

          this.handleCustomBranchChange("");
        }}
      >

        <span className="branch-option-icon">
          <i className="si si-location-pin" />
        </span>

        <span className="branch-option-name">
          Select Branch
        </span>

      </div>


      {/* BRANCHES */}
      {this.state.branches.map((branch) => {

        const isSelected =
          this.state.selectedBranchSlug ===
          branch.slug;

        return (
          <div
            key={branch._id}
            className={
              "branch-dropdown-option " +
              (isSelected
                ? "branch-dropdown-option-selected"
                : "")
            }
            onClick={(event) => {
              event.stopPropagation();

              this.handleCustomBranchChange(
                branch.slug
              );
            }}
          >

            <span
              className={
                "branch-option-icon " +
                (isSelected
                  ? "branch-option-icon-selected"
                  : "")
              }
            >
              <i className="si si-location-pin" />
            </span>

            <span className="branch-option-name">
              {branch.name}
            </span>

            {isSelected && (
              <span className="branch-option-check">
                ✓
              </span>
            )}

          </div>
        );

      })}

    </div>

  )}

</div>
  {/* <label className="branch-select-control">

  <i
    className="si si-location-pin"
    style={{
      color: "#CA202C"
    }}
  />

  <select
    value={this.state.selectedBranchSlug}
    onChange={this.handleHeaderBranchChange}
  >

    <option value="">
      Select Branch
    </option>

    {this.state.branches.map((branch) => (
      <option
        value={branch.slug}
        key={branch._id}
      >
        {branch.name}
      </option>
    ))}

  </select>

  <i className="si si-arrow-down branch-select-arrow" />

</label> */}
 </div>  
)}


            {/* {!this.props.user.success && !is_back && (
    <div
        className="d-flex align-items-center justify-content-between w-100"
        style={{
            height: 60,
            padding: "0px 0px",
        }}
    >
        <Link
          to="/my-account"   
          className="d-flex align-items-center"
          style={{ color: "#fff", textDecoration: "none" }}
        >
          <RiMenuLine size={28} />
        </Link>
      
        <div className="d-flex justify-content-center align-items-center">
          <img
            src={require("../../../assets/images/eatbro-logo.png")}
            alt="Eatbro"
            style={{
              height: 60,
              objectFit: "contain",
            }}
          />
        </div>
        <Link
            to="/"
            className="d-flex flex-column align-items-center"
            style={{ color: "#fff", textDecoration: "none" }}
        >
            <RiHome5Line size={33} color="#fff" />
        </Link>
    </div>
)} */}
            
          </div>
          {explore ? (
            <>

              <div className=' mb-15 pt-4 mt-4'>


                <Link to="/explore" className="pt-15 ">
                  <div className="d-flex align-items-center py-10" style={{ background: 'rgb(250, 250, 250)', borderRadius: '0.85rem', border: '0.5px solid rgb(187, 187, 187)', justifyContent: 'space-between' }}>
                    <div className="pl-15 d-flex align-items-center" style={{ fontSize: '0.98rem', fontWeight: 600, color: 'rgb(163, 163, 163)' }}>
                      <span className="pr-1" style={{ fontWeight: 400 }}>Search For</span>
                      <div style={{ height: 0, transition: 'height 250ms' }}>
                        <div className="react-reveal" style={{ animationFillMode: 'both', backfaceVisibility: 'visible', animationDuration: '875ms', animationDelay: '125ms', animationIterationCount: 1, opacity: 1, animationName: 'react-reveal-403381815844108-1' }}>
                        </div>
                      </div>
                      <div style={{ height: '19px', transition: 'height 250ms' }}>
                        <div className="react-reveal" style={{ animationFillMode: 'both', backfaceVisibility: 'visible', animationDuration: '875ms', animationDelay: '125ms', animationIterationCount: 1, opacity: 1, animationName: 'react-reveal-403381815844108-1' }}>'</div>
                      </div>
                      <div style={{ height: '19px', transition: 'height 250ms' }}>
                        <div className="react-reveal" style={{ animationFillMode: 'both', backfaceVisibility: 'visible', animationDuration: '875ms', animationDelay: '125ms', animationIterationCount: 1, opacity: 1, animationName: 'react-reveal-403381815844108-1' }}>biriyani</div>
                      </div>
                      <div style={{ height: '19px', transition: 'height 250ms' }}>
                        <div className="react-reveal" style={{ animationFillMode: 'both', backfaceVisibility: 'visible', animationDuration: '875ms', animationDelay: '125ms', animationIterationCount: 1, opacity: 1, animationName: 'react-reveal-403381815844108-1' }}>'</div>
                      </div>
                    </div>
                    <span className="pr-15" style={{ right: '15px' }}>
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" color="#545454" height="22" width="22" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(84, 84, 84)' }}>
                        <path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"></path>
                      </svg>
                    </span>
                  </div>
                </Link>
              </div>
            </>
          ) :
            <></>
          }
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.user,

});


export default connect(mapStateToProps, {})(Header);
