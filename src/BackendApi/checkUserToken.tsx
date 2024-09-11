import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const checkUserToken = () => {
  const navigate = useNavigate();
  const isTokenExpired = () => {
    const accessToken = Cookies.get('accessToken');
    console.log('accessToken in isTokenExpired:', accessToken);
    if (!accessToken) {
      return true;
    }
    try {
      const decodedToken: { exp?: number } = jwtDecode(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      console.log('Decoded token:', decodedToken);
      console.log('Current time (seconds):', currentTime);
      if (decodedToken.exp) {
        console.log('Token expiration time (exp):', decodedToken.exp);
        return currentTime >= decodedToken.exp;
      } else {
        console.error('Token does not have an expiration time.');
        return true;
      }
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return true;
    }
  };

  useEffect(() => {
    if (isTokenExpired()) {
      alert('Your session has expired. Please log in again.'); // Show an alert with the error message
      Cookies.remove('accessToken');
      navigate('/authentication/login');
    }
  }, [navigate]);

  return null; // This component does not render anything
};

export default checkUserToken;
