import './App.css';
import './index.css';
import './responsive.css';
import 'bootstrap/dist/css/bootstrap.css';
import './assets/fonts.woff2';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Dashboard/Login';
import Home from './Dashboard/Home';
import Seller from './Dashboard/Seller';
import Profile from './Buyer/BuyerProfile';
import SellerProfile from './Seller/SellerProfile';
import Properties from './Buyer/Properties';
import Register from './Dashboard/register';
import { AuthProvider } from "./Dashboard/AuthContext";
import About from './Dashboard/About';
import Contact from './Dashboard/Contact';
import Listings from './Seller/PostProperty';
import MyListings from './Seller/MyListings';
import SellGooglesign from './Seller/SellGoogleSign.jsx';
import SellerLogin from './Seller/SellerLogin';
import PropertyDetailsPage from './Buyer/PropertyDetailsPage'
import Feedback  from './Buyer/Feedback';
import MyFavorites from './Buyer/MyFavorites';
import ForgotPassword from './Dashboard/ForgotPassword.jsx';
import BuyerSellerChat from './Dashboard/BuyerSellerChat.jsx';
import ChatRoom from './Dashboard/ChatRooom.jsx';





function App() {

    return (
        <BrowserRouter>
            <AuthProvider>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/seller" element={<Seller />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/About" element={<About />} />
                    <Route path="/Contact" element={<Contact />} />
                    <Route path="/Properties" element={<Properties />} />
                    <Route path="/listings" element={<Listings/>} />
                    <Route path="/SellerProfile" element={<SellerProfile />} />
                    <Route path="/MyListings" element={<MyListings />} />
                    <Route path="/SellerLogin" element={<SellerLogin />} />
                    <Route path="/SellGooglesign" element={<SellGooglesign />} />
                    <Route path="/property-details" element={<PropertyDetailsPage />} />
                    <Route path="/Feedback" element={<Feedback />} />
                    <Route path="/MyFavorites" element={<MyFavorites />} />
                    <Route path="/ForgotPassword" element={<ForgotPassword/>} />
                    <Route path="/BuyerSellerChat" element={<BuyerSellerChat/>} />
                    <Route path="/ChatRooom" element={<ChatRoom/>} />

                    


                    

                </Routes>
                <ToastContainer />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
