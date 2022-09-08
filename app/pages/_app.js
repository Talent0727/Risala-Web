import '../styles/style.css'
import { Provider } from 'react-redux'
import { SocketProvider } from '../components/Socket';
import store from '../features/store';

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </Provider>
  )
}

export default MyApp