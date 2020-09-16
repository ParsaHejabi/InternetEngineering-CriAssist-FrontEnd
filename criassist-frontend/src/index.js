import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import * as serviceWorker from "./serviceWorker";
import Routes from "./global/routes";
import { create } from "jss";
import rtl from "jss-rtl";
import { StylesProvider, jssPreset, ThemeProvider, createMuiTheme } from "@material-ui/core/styles";

// Configure JSS
const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

const PORT = process.env.PORT || 5000;
let url;

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  url = `http://localhost:${PORT}/graphql`;
} else {
  url = `https://criassist.herokuapp.com/graphql`;
}

const client = new ApolloClient({
  uri: url
});

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <StylesProvider jss={jss}>
      <ThemeProvider theme={darkTheme}>
        <Routes />
      </ThemeProvider>
    </StylesProvider>
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
