import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import i18n from '@/locale'
import { ls } from '@/utils/storage'

// return (
//   <LocaleProvider locale={enUS}>
//     <App />
//   </LocaleProvider>
// );

ReactDOM.render(<App />, document.getElementById('root'))
