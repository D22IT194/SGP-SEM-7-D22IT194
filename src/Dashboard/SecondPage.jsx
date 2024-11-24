import { Navigate } from 'react-router-dom';
import disc from '../assets/description.gif'
import propimg2 from '../assets/property-img-2.png'
import { useNavigate } from 'react-router-dom';


const SecondPage = () => {
    const navigate = useNavigate();
    return (

        <div className="second-page">


            <div className="home-desc">

                <div className="home-detail">

                    <p className="title"> Sell or Rent your property for <strong> free on Real-Estate!</strong> </p>

                    <p className="subtitle">Become a part of the growing Your family. As a promise to our real-estate
                        agent community, all our listings are completely free &amp; always will be. Now
                        you can grow your business happily. Further more, over a million buyers visit
                        us every month, giving you the audience that you need. Use our Real-Estate
                        seller Platform to avail all these benefits &amp; conveniently follow up with your
                        clients.</p>


                    <div className="list-property-btn" > <span className="property-btn" onClick={() => navigate("/login")}>List Property</span> </div>

                </div>



                <div className="property-img-1">

                    <img className="img-1" src={disc} alt="img-1" />

                </div>

            </div>


            <div className="home-desc-2">

                <div className="property-img-2">

                    <img className="img-2" src={propimg2} alt="img-2" />
                </div>

                <div className="img-desc">

                    <h2>List your property with ease</h2>

                    <div className="img-about">
                        <p>
                            If you are selling a house or keen to rent a house, Real-Estate.com is where you should be.
                            When you open our site, continue to ‘list property’ option to start with property listings.
                            If you are an existing user, you could just login with your credentials.
                            Select your city where you wish to sell flat or post ad for rent. Select your profile as a
                            ‘Buyer’, ‘agent’ or ‘Seller’.
                            You could log in with your Facebook profile, Google Plus or email id.
                            You will be asked to register your mobile number. Proceed with OTP verification for a safe
                            and
                            reliable way of buying and selling property online.
                            Post properties with complete details and pictures to get maximum responses. On the basis of
                            your listing quality,
                            a rating will be generated which only you can see. A good quality property listing will help
                            you
                            rent or sell property fast.
                            Upon verification, your property listing will be visible to all potential buyers and
                            tenants.
                            You can keep a tab on all your listings at any given point of time.
                        </p>
                    </div>
                    <br>
                    </br>
                    <div className="list-property-btn" > <span className="property-btn" onClick={() => navigate("/login")}>List Property</span> </div>

                </div>


            </div>


        </div>
    );
}

export default SecondPage;