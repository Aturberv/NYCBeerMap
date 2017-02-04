/* global FB */

import ReactGA from 'react-ga';
import Helmet from 'react-helmet';
import React, { Component } from 'react';
import autoBind from 'react-autobind';
import {geolocated} from 'react-geolocated';

import Header from '../Header/Header';
import BreweryPage from '../BreweryPage/BreweryPage';
import BreweryMap from '../BreweryMap/BreweryMap';
import Footer from '../Footer/Footer';

import Cities from '../breweries.json';
import config from '../../config.json';

import './bootstrap.css';
import './App.css';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

class App extends Component {

  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      breweries: Cities[props.params.city],
      defaultCenter: config.cities[props.params.city].map.center,
      isLoggedIn: false,
      fbInit: false
    }
    window.fbAsyncInit = this.facebookInit;
    window.fbLogin = this.getFacebookInfo;
  }

  facebookInit() {
    FB.init({
      appId      : '744534482367485',
      xfbml      : true,
      status     : true,
      cookie     : true,
      version    : 'v2.7'
    });
    this.setState({fbInit:true});
    FB.getLoginStatus(this.getFacebookInfo);
  }

  getFacebookInfo(fbResponse) {
    if (fbResponse.authResponse && fbResponse.status === 'connected') {
      this.setState({
        isLoggedIn: true
      });
      // FB.api('/me', {fields:'name, email'}, function(resp) {
      //   TODO: send email to third party service?
      // });
    } else {
      this.setState({
        isLoggedIn:false
      });
    }
  }

  breweryNameFilter(breweryKeys) {
    if (breweryKeys.length === 0) {
      this.setState({breweries: Cities[this.props.params.city]});
      this.props.router.push(`'/${this.props.params.city}`);
    } else if (breweryKeys.length === 1) {
        this.props.router.push(`${this.props.params.city}/${breweryKeys[0]}`)
    } else {
      this.setState({
        breweries: Object.keys(Cities[this.props.params.city]).reduce((result, key) => {
          if(breweryKeys.indexOf(key) > -1) {
            result[key] = Cities[this.props.params.city][key]
          }
          return result
        }, {})
      });
      this.props.router.push(`'/${this.props.params.city}`);
    }
  }

  beerTypeFilter(beerTypes) {
    if (beerTypes.length === 0) {
      this.setState({breweries: Cities[this.props.params.city]});
    } else {
      this.setState({
        breweries: Object.keys(Cities[this.props.params.city]).reduce((result, key) => {
          const intersection = new Set(
              Cities[this.props.params.city][key].beerTypes
              .filter(type => beerTypes.indexOf(type) > -1))
          // we matched on all desired filters
          if(intersection.size === beerTypes.length) {
            result[key] = Cities[this.props.params.city][key];
          }
          return result;
        }, {})
      });
    }
  }

  ratingFilter(ratingEvent) {
    this.props.router.push(this.props.params.city);
    this.setState({
      breweries: Object.keys(Cities[this.props.params.city]).reduce((result, key) => {
        if(Cities[this.props.params.city][key].yelpRating >= ratingEvent) {
          result[key] = Cities[this.props.params.city][key];
        }
        return result;
      }, {})
    });
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.params.city !== nextProps.params.city) {
      this.setState({
        breweries: Cities[nextProps.params.city]
      })
    }

    if(this.props.location.pathname !== nextProps.location.pathname) {
      ReactGA.pageview(nextProps.location.pathname)
    }
  }

  render() {
    const {
      params: {
        city,
        breweryKey
      },
      location: {
        pathname
      },
      coords
    } = this.props;

    const currentUrl = `${config.url}${pathname}`;
    const favIcon = `${config.url}/favicon.ico`;
    const activeCityConfig = config.cities[city];
    const activeCityBreweries = Cities[city];
    const title = `${activeCityConfig.name} Brewery Map`;
    let scripts = [
      {type: "application/ld+json", innerHTML: `{"@context": "http://schema.org","@type": "Organization","url": "${config.url}","logo": "${favIcon}"}`}
    ];
    if(!process.env.REACT_APP_CI) {
      scripts.push({src:"https://connect.facebook.net/en_US/sdk.js"});
    }

    return (
      <div className="App">
        <Helmet
          defaultTitle={title}
          titleTemplate={`%s - ${title}`}
          meta={[
            {name: "description", content: activeCityConfig.description},
            {name: "keywords", content: activeCityConfig.keywords},
            {name: "theme-color", content:"#1E90FF"},
            {property: "fb:app_id", content:"744534482367485"},
            {property: "og:type", content:"website"},
            {property: "og:url", content:currentUrl},
            {property: "og:description", content:activeCityConfig.description},
            {property: "og:title", content: title}
          ]}
          link={[
            {rel:"alternate", hreflang:"en", href:currentUrl},
            {rel:"canonical", itemprop:"url", href:currentUrl},
            {rel:"shortcut icon", href:favIcon},
            {rel:"apple-touch-icon", href:favIcon},
            {rel:"apple-touch-icon", sizes:"160x160", href:favIcon},
          ]}
          script={scripts}
        />
        <Header breweryNameFilter={this.breweryNameFilter}
                beerTypeFilter={this.beerTypeFilter}
                ratingFilter={this.ratingFilter}
                breweryKey={ breweryKey }
                city={ city }
                allCities={ config.cities }
                breweries={ activeCityBreweries }
        />
        <div className="content">
          {
            breweryKey ?
              <BreweryPage brewery={ activeCityBreweries[breweryKey] }
                           isMobile={ isMobile }
                           userCoordinates={ coords }
                           activeCity={ city }
                           activeCityBreweries={ activeCityBreweries }
                           isLoggedIn={ this.state.isLoggedIn }
                           fbInit={ this.state.fbInit }
                           currentUrl={ currentUrl }
              />
            :
              <div className="App-map">
                <BreweryMap googleMapsApiKey={ config.googleMapsApiKey }
                            mapCenter={ activeCityConfig.map.center }
                            mapZoom={ activeCityConfig.map.zoom }
                            breweries={ this.state.breweries }
                            activeCity={ city }
                />
              </div>
          }
        </div>
        <Footer 
          allCities={ config.cities }
          router={ this.props.router }
        />
        <div className="hidden-links">
          {
            // include anchor tags to all of our links so
            // search engines can more easily crawl
            Object.keys(config.cities).map((city) => {
              let breweries = config.cities[city].breweries || []
              return [(<a href={`${config.url}/${city}`}>{city}</a>)].concat(
                Object.keys(breweries).map((brewery) => {
                  return (<a href={`${config.url}/${city}/${brewery}`}>{brewery}</a>)
                })
              )
            })
          }
        </div>
      </div>
    );
  }
}

if(isMobile) {
    // can we figure out what city
    // based on their location?
    App = geolocated({
        positionOptions: {
            enableHighAccuracy: false
        },
        userDecisionTimeout: 5000
    })(App);
}

export default App;
