import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const FORMS = [
  {
    _id: 1,
    title: "فرم اول"
  },
  {
    _id: 2,
    title: "فرم دوم"
  },
  {
    _id: 3,
    title: "فرم سوم"
  },
  {
    _id: 4,
    title: "فرم چهارم"
  },
  {
    _id: 5,
    title: "فرم پنجم"
  }
];

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
  return (
    <Grid container className={classes.container} spacing={2}>
      {FORMS.map(item => (
        <Grid key={item._id} item xs={3}>
          <Card className={classes.root}>
            <CardContent>
              <Typography variant="h5" component="h2">
                {item.title}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">جزئیات</Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Home;
