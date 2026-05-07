import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content>
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  );
}

export default App;
