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

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

export default function SimpleTable(props) {
    const classes = useStyles();
    const formID = useParams().formid;
    const answerID = useParams().id;
    const data = (props.allData).find(element => (element._id === parseInt(answerID)))
    const rows = [];
    data.fields.forEach(field => {
        rows.push(
            <TableRow>
                <TableCell align="right">{field.title}</TableCell>
                <TableCell align="right">{field.value}</TableCell>
            </TableRow>
        );
    })

    return (
        <div>
            <Typography>{props.title}</Typography>
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
        </div>
    );
}