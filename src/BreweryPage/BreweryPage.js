import React from 'react';
import { Row, Col } from 'react-bootstrap';

import BreweryPageMeta from '../BreweryPageMeta/BreweryPageMeta';
import BreweryImages from '../BreweryImages/BreweryImages';
import BreweryReviews from '../BreweryReviews/BreweryReviews';
import BreweryDescription from '../BreweryDescription/BreweryDescription';
import BreweryBeers from '../BreweryBeers/BreweryBeers';
import BrewerySocial from '../BrewerySocial/BrewerySocial';
import BreweryRating from '../BreweryRating/BreweryRating';
import BreweryMap from '../BreweryMap/BreweryMap';
import RideButton from '../RideButton/RideButton';
import BreweryInfo from '../BreweryInfo/BreweryInfo';

import config from '../../config.json';

import './BreweryPage.css';

const BreweryPage = (
{
    brewery, 
    userCoordinates,
    isMobile,
    activeCity,
    activeCityBreweries,
    isLoggedIn,
    currentUrl
}) => {
    return (
      <div className="breweryPage" itemScope itemType="http://schema.org/Brewery">
            <BreweryPageMeta brewery={brewery} currentUrl={currentUrl}/>
            <div className="breweryPage-header">
                <center>
                    <h1 className="brewery-name">{brewery.name}</h1>
                    <BrewerySocial social={brewery.social} />
                    <RideButton breweryName={brewery.name} 
                                userCoordinates={userCoordinates}
                                isMobile={isMobile}
                                destination={brewery.location}/>
                </center>
                <div className="container">
                <Row className="brewery-stuff">
                    <Col sm={12} md={6}>
                        <center>
                            <BreweryRating ratings={brewery.breweryRating} />
                            <BreweryInfo info={brewery.brewInfo} />
                        </center>
                    </Col>
                    <Col sm={12} md={6}>
                        <div className="breweryPage-map">
                            <BreweryMap googleMapsApiKey={ config.googleMapsApiKey }
                                        mapCenter={ {
                                            lat: brewery.location.lat,
                                            lng: brewery.location.lng
                                        } }
                                        mapZoom={ 15 }
                                        breweries={ activeCityBreweries }
                                        activeCity={ activeCity }
                            />
                        </div>
                    </Col>
                </Row>
                </div>
            </div>
            <div>
                <BreweryDescription description={brewery.breweryDescription} />
                <BreweryImages photos={brewery.photos} />
                <BreweryReviews reviews={brewery.reviews} />
                <BreweryBeers beers={brewery.beers} />
            </div>
        </div>
    );
}

export default BreweryPage;


