import Cookies from 'js-cookie';

export const isAuthenticated = () => {
  const accessToken = Cookies.get('accessToken');
  console.log('accessToken in isAuthenticated:', accessToken);
  return !!accessToken;
};

export const getUserRole = () => {
  const accessToken = Cookies.get('accessToken');
  if (accessToken) {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.role; // Adjust according to your token structure
  }
  return null;
};

// export const handleOAuth2Redirect = (state) => {
//     window.location.href = `http://localhost:8080/oauth2/authorization/google?state=${state}`;
// };
