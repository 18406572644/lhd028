import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Movies from '@/pages/Movies';
import MovieDetail from '@/pages/MovieDetail';
import BlindBox from '@/pages/BlindBox';
import Collection from '@/pages/Collection';
import CollectionDetail from '@/pages/CollectionDetail';
import History from '@/pages/History';
import Share from '@/pages/Share';
import ShareView from '@/pages/ShareView';
import Stats from '@/pages/Stats';

const antTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#C41E3A',
    colorBgContainer: '#2C1810',
    colorBgElevated: '#3D2517',
    colorBgLayout: '#1A0E08',
    colorBorder: '#B8864A',
    colorText: '#FFF8F0',
    colorTextSecondary: '#D4A574',
    colorTextTertiary: '#B8864A',
    borderRadius: 4,
    fontFamily: "'Noto Sans SC', sans-serif",
  },
};

export default function App() {
  return (
    <ConfigProvider theme={antTheme} locale={zhCN}>
      <ParticlesProvider init={loadSlim}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/share/:code" element={<ShareView />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="movies" element={<Movies />} />
              <Route path="movies/:id" element={<MovieDetail />} />
              <Route path="blindbox" element={<BlindBox />} />
              <Route path="collection" element={<Collection />} />
              <Route path="collection/:id" element={<CollectionDetail />} />
              <Route path="history" element={<History />} />
              <Route path="share" element={<Share />} />
              <Route path="stats" element={<Stats />} />
            </Route>
          </Routes>
        </Router>
      </ParticlesProvider>
    </ConfigProvider>
  );
}
