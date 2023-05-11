import { Link, Outlet } from 'umi';
import styles from './index.less';

const Layout = ({ children }: any) => {
  return (
    <div className={styles.navs}>
      <Outlet />
    </div>
  )
}

export default Layout;
