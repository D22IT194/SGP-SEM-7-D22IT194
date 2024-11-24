import React from 'react';
import Aboutimg1 from '../assets/about-1.png';
import Navbar from './Navbar';
import Footer from './Footer';

const About = () => {
    return (
        <>
            <Navbar />
            <div className="about-us-container">

                <div className='about-content'>

                    <div className='About-disc'>

                        <h1>About us</h1>
                        <p>
                            At makaan.com, we understand that people everywhere are searching for a home to call their own.
                            A home is a cherished memory that lasts forever, where the walls embrace memories, the ceilings
                            shelter love and laughter, where the quiet corners offer a much-needed pause and life itself
                            becomes a reason to celebrate.
                        </p>
                        <p>
                            We want to make the journey as joyful as the moment when you finally find the perfect home.
                            So we begin by partnering with our customers from the start and being there when it matters
                            the most - right from online search to brokers to home loans to paperwork to finally finding
                            that perfect home. At makaan.com, we help you find joy.
                        </p>

                        <h2>Our Vision</h2>
                        <p>Changing the way India experiences property.</p>

                        <h2>Our Mission</h2>
                        <p>
                            To be the first choice of our consumers and partners in discovering, renting, buying, selling,
                            financing a home, and digitally enabling them throughout their journey. We do that with data,
                            design, technology, and above all, the passion of our people while delivering value to our shareholders.
                        </p>
                    </div>
                    <div className="family-illustration">
                        <img src={Aboutimg1} alt="Family Illustration" />
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}

export default About;