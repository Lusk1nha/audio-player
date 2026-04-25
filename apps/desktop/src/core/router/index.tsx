import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LibraryView } from '../../modules/library/presentation/LibraryView';

// Você pode criar componentes simples para as outras telas por enquanto
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full text-gray-500">
    <h1 className="text-2xl">{title}</h1>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // O Layout envolve todas as rotas filhas
    children: [
      {
        path: '/',
        element: <LibraryView />, // Rota padrão cai no seu gerenciador
      },
      {
        path: '/playlists',
        element: <PlaceholderView title="Suas Playlists aparecerão aqui" />,
      },
      {
        path: '/settings',
        element: <PlaceholderView title="Configurações do Sistema" />,
      },
    ],
  },
]);