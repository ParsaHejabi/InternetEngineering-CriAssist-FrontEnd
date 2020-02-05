import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useQuery } from "@apollo/react-hooks";

import { FORMS_LIST } from "../global/queries";

const useStyles = makeStyles({
  container: {
    flexGrow: 1,
    padding: "5%"
  },
  root: {
    minWidth: 275
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
});

const Home = props => {
  const classes = useStyles();
  const { data, error, loading } = useQuery(FORMS_LIST);
  if (error) return null;
  if (loading) return <div>loading</div>;
  return (
    <Grid container className={classes.container} spacing={2}>
      {data.forms.map(item => (
        <Grid key={item._id} item xs={3}>
          <Card className={classes.root}>
            <CardContent>
              <Typography variant="h5" component="h2">
                {item.title}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to={`/ccagent/${item._id}`}>
                جزئیات
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Home;
