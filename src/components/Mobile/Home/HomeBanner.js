import React, { Component } from "react";
import Axios from "axios";
import { GET_JUST99_BANNERS_URL } from "../../../configs/website";

class HomeBanner extends Component {
    state = {
        banners: [],
        current: 0,
    };

    componentDidMount() {
        this.getBanners();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getBanners = async () => {
        try {
            const response = await Axios.get(
                GET_JUST99_BANNERS_URL
            );

            const activeBanners = response.data.filter(
                (banner) => banner.isActive
            );

            this.setState({
                banners: activeBanners,
                current: 0,
            });

            if (activeBanners.length > 1) {
                this.interval = setInterval(() => {
                    this.setState((prev) => ({
                        current:
                            (prev.current + 1) %
                            prev.banners.length,
                    }));
                }, 3500);
            }
        } catch (error) {
            console.log("Failed to load banners:", error);
        }
    };

    render() {
        const { banners, current } = this.state;

        if (banners.length === 0) {
            return null;
        }

        const currentBanner = banners[current];

        return (
            <div className="home-banner">

                <img
                    src={`https://api.just99.online/uploads/banners/${currentBanner.image}`}
                    alt="Banner"
                    className="home-banner-image"
                />

                {banners.length > 1 && (
                    <div className="home-banner-dots">
                        {banners.map((_, index) => (
                            <span
                                key={index}
                                className={
                                    index === current
                                        ? "banner-dot active"
                                        : "banner-dot"
                                }
                            />
                        ))}
                    </div>
                )}

            </div>
        );
    }
}

export default HomeBanner;