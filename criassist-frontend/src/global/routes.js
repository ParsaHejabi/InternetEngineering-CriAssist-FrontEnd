import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "../pages/Home";
import CCAgent from "../pages/CCAgent.js";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/about">
          <div>about</div>
        </Route>
        <Route path="/ccagent/:id">
          <CCAgent />
        </Route>
      </Switch>
    </Router>
  );
};

export default Routes;
