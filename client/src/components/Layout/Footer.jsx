import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter style={{ textAlign: 'center', background: '#f0f2f5' }}>
      家教信息平台 ©{new Date().getFullYear()} Created by You
    </AntFooter>
  );
};

export default Footer;
