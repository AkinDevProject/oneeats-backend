import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Page de callback apres authentification Keycloak.
 * Avec le mode web-app de Quarkus, la session est deja etablie via cookie.
 * Cette page redirige simplement vers la page appropriee.
 */
export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Gerer les erreurs de Keycloak
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorDescription = searchParams.get('error_description');
      console.error('Auth error:', errorDescription || errorParam);
      navigate('/login', { replace: true });
      return;
    }

    // Attendre que le chargement utilisateur soit termine
    if (isLoading) {
      return;
    }

    // Rediriger selon le role de l'utilisateur
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/restaurant', { replace: true });
      }
    } else {
      // Pas d'utilisateur connecte, retour au login
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Connexion en cours...</h2>
        <p className="text-gray-600 mt-2">Veuillez patienter</p>
      </div>
    </div>
  );
}
