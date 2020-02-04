import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const Routes = props => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <div>home</div>
        </Route>
        <Route exact path="/about">
          <div>about</div>
        </Route>
      </Switch>
    </Router>
  );
};

export default Routes;
