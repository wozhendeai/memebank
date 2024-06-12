import { ComponentType, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

interface WithAuthRedirectProps {
    // TODO: ....
}

const withAuthRedirect = <P extends WithAuthRedirectProps>(Component: ComponentType<P>): ComponentType<P> => {
  return (props: P) => {
    const navigate = useNavigate();
    const { isConnected } = useAccount();

    useEffect(() => {
      if (isConnected) {
        navigate('/home', { replace: true });
      } else if (!isConnected) {
        navigate('/', { replace: true });
      }
    }, [isConnected, navigate]);

    return <Component {...props} />;
  };
};

export default withAuthRedirect;
