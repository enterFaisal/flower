import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <div dir="rtl" lang="ar">
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp

