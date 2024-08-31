import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';

const OAuth2CallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');

    if (accessToken) {
      console.log('Access token found:', accessToken); // Debugging line
      Cookies.set('accessToken', accessToken, { expires: 1 }); // Updated cookie settings
      navigate('/');
    } else {
      console.error('Access token not found in URL parameters');
      navigate('/authentication/login');
    }
  }, [navigate, searchParams]);

  return <div>Redirecting...</div>;
};

export default OAuth2CallbackPage;
