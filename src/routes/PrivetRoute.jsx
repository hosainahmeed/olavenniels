import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGetProfileDataQuery } from '../Redux/Apis/service/profileApis';
import toast from 'react-hot-toast';

const PrivateRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { data, isLoading: isProfileLoading } = useGetProfileDataQuery();

  useEffect(() => {
    const checkAuthorization = () => {
      const role = data?.admin?.role;

      try {
        if (role === 'SUPER_ADMIN') {
          setIsAuthorized(true);
        } else if (role === 'ADMIN') {
          if (location.pathname === '/make-admin') {
            toast.error("You don't have access to this page");
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
      }
    };

    if (!isProfileLoading) {
      checkAuthorization();
      setIsLoading(false);
    }
  }, [data?.admin?.role, isProfileLoading, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <span className="loader-black"></span>
      </div>
    );
  }

  return isAuthorized ? (
    children
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;
