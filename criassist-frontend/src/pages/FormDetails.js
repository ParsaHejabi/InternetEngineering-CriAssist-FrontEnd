import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { useQuery } from "@apollo/react-hooks";
import { FORM_ANSWER, AREA_WITH_GIVEN_POINT } from "../global/queries";
import moment from 'moment';
import { GoogleMap, withGoogleMap, withScriptjs, Marker } from 'react-google-maps';

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        padding: "5%"
    },
    table: {
        minWidth: 650,
    },
});

const GetOneAnswer = props => {
    const { data, loading } = useQuery(FORM_ANSWER, {
        variables: { "id": props }
    });
    return { data, loading }
}

const GetAreaWithGivenPoint = props => {
    const { data, loading } = useQuery(AREA_WITH_GIVEN_POINT, {
        variables: { "lat": props.lat, "long": props.long }
    });
    return { data, loading };
}

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            marker_lat: 45.4211,
            marker_lng: -75.6903
        }
    }
    render() {
        console.log(this.props.markers);
        var markers = [];
        this.props.markers.forEach(mark => {
            markers.push(<Marker position={{ lat: mark.lng, lng: mark.lat }} />);
        })
        return (<GoogleMap
            defaultZoom={14}
            defaultCenter={{ lat: this.props.markers[0].lng, lng: this.props.markers[0].lat }}
            onClick={(e) => {
                console.log(e.latLng.lat());
                console.log(e.latLng.lng());
                this.props.setVal({ lat: e.latLng.lat(), lng: e.latLng.lng() })
                this.setState({
                    marker_lat: e.latLng.lat(),
                    marker_lng: e.latLng.lng()
                })
            }}>
            {markers}
        </GoogleMap>);
    }
}

export default function SimpleTable(props) {
    const classes = useStyles();
    var answerID = useParams().id;
    var answer = GetOneAnswer(answerID);
    var rows = [];
    var showMap = false;
    var markers = [];
    var wmap = <div />;
    var locationFields = props.form.form.fields.filter(element => element.type.includes("Location"));
    var finalAnswer = { value: {} };
    locationFields.forEach(locationField => {
        showMap = true;
        finalAnswer.value[locationField.name] = { "lat": 90, "long": 90 };
        if (!answer.loading) {
            finalAnswer = answer.data.formAnswer;
        }
        var areaNames = GetAreaWithGivenPoint({
            "lat": finalAnswer.value[locationField.name].lat,
            "long": finalAnswer.value[locationField.name].long
        })
        finalAnswer.value["Areas"] = [];
        var temp = finalAnswer;
        if (!areaNames.loading) {
            temp.value["Areas"] = areaNames.data.areaNamesOfGivenPoint;
            finalAnswer = temp;
        }
        markers.push({ lat: finalAnswer.value[locationField.name].lat, lng: finalAnswer.value[locationField.name].long });

    })

    const WrappedMap = withScriptjs(withGoogleMap(props => <Map markers={markers} />));

    if (showMap) {
        wmap = (<WrappedMap
            googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyDjs0u02-62FMwrtxMxci5pc6PIubSyW28`}
            loadingElement={<div style={{ height: `300px` }} />}
            containerElement={<div style={{ height: `300px` }} />}
            mapElement={<div style={{ height: `300px`, width: `90%` }} />}
        />);
    }



    if (!answer.loading) {
        var fieldKeys = Object.keys(answer.data.formAnswer.value);
        var index = fieldKeys.indexOf("Areas");
        delete fieldKeys[index];
        fieldKeys.forEach(key => {
            var fieldTitle = (props.form.form.fields).find(element => element.name === key);
            var cell = <TableCell align="right">{answer.data.formAnswer.value[key]}</TableCell>;

            if (fieldTitle.type.includes("Location")) {
                var areas = "";
                if (finalAnswer.value["Areas"])
                    finalAnswer.value["Areas"].forEach(area => areas = areas.concat(" ", area));
                cell = <TableCell align="right">{areas}</TableCell>;
            }
            if (fieldTitle.type.includes("Date")) {
                cell = <TableCell align="right">{moment(new Date(answer.data.formAnswer.value[key])).format('YYYY MMMM Do')}</TableCell>;
            }
            rows.push(
                <TableRow>
                    <TableCell align="right">{fieldTitle.title}</TableCell>
                    {cell}
                </TableRow>
            );
        })
    }

    return (
        <div>
            <Typography variant="h5" gutterBottom>{props.title}</Typography>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">نام فیلد</TableCell>
                            <TableCell align="right"> مقدار فیلد</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows}
                    </TableBody>
                </Table>
            </TableContainer>
            {wmap}
        </div>
    );
}