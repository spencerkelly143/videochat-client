import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router,
        Switch, Route} from 'react-router-dom'
import Home from './home';
import Chat from './chat';

function Index(){
  return(
    <Router>
    <Switch>
      <Route exact path='/'>
        <Home />
      </Route>
      <Route path='/chat/:user' component={Chat} />
    </Switch>
    </Router>
  )
}
ReactDOM.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
  document.getElementById('root')
);
